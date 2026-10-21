"""
Ollama Local AI Model Adapter.
Interacts with local Ollama daemon at 127.0.0.1:11434 with format='json' schema enforcement.
"""
import httpx
import json
import uuid
from typing import Dict, Any, List

from app.adapters.base import ModelProvider
from app.models.schemas import ExecutionPlan, ToolStep, RiskTier
from app.core.exceptions import ModelInferenceException
from app.tools.registry import ToolRegistry


PLAN_SYSTEM_PROMPT = """You are the LazyLoop AI Planning Engine.
Your mission is to decompose a user request into a sequence of safe, discrete operations.
You MUST output ONLY a valid JSON object matching this schema:
{
  "explanation": "Brief rationale for this plan",
  "total_estimated_manual_minutes": 15.0,
  "steps": [
    {
      "tool_name": "list_directory" | "read_file" | "find_duplicate_files" | "check_doc_gaps" | "create_file" | "update_file" | "delete_file" | "move_file",
      "arguments": { ... },
      "description": "Clear step description",
      "risk_tier": "READ_ONLY" | "LOW" | "HIGH_DESTRUCTIVE"
    }
  ]
}
DO NOT output any code blocks, markdown tags, or commentary outside the JSON object.
NEVER propose shell commands. Only use the listed registered tools.
"""


class OllamaProvider(ModelProvider):
    """Integrates with locally running Ollama instance."""

    def __init__(self, base_url: str = "http://127.0.0.1:11434", model_name: str = "llama3.2:latest"):
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    async def list_models(self) -> List[str]:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    return [m.get("name", "") for m in data.get("models", [])]
        except Exception:
            pass
        return []

    async def generate_plan(
        self,
        task_id: str,
        prompt: str,
        workspace_context: Dict[str, Any],
    ) -> ExecutionPlan:
        registered_tools = ToolRegistry.get_registered_tools()
        tools_summary = "\n".join([f"- {name}: {data['description']}" for name, data in registered_tools.items()])

        full_prompt = f"""
Available Tools:
{tools_summary}

Workspace Context:
Root: {workspace_context.get('root', '')}
Current directory preview: {json.dumps(workspace_context.get('files_sample', []))}

User Task:
"{prompt}"

Generate the JSON plan now:
"""
        payload = {
            "model": self.model_name,
            "prompt": full_prompt,
            "system": PLAN_SYSTEM_PROMPT,
            "format": "json",
            "stream": False,
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(f"{self.base_url}/api/generate", json=payload)
                if response.status_code != 200:
                    raise ModelInferenceException(f"Ollama returned HTTP error {response.status_code}: {response.text}")
                
                result_json = response.json()
                raw_response = result_json.get("response", "{}")
                parsed = json.loads(raw_response)

                raw_steps = parsed.get("steps", [])
                validated_steps = []
                highest_risk = RiskTier.READ_ONLY

                for idx, s in enumerate(raw_steps):
                    tool = s.get("tool_name", "")
                    if tool not in registered_tools:
                        continue  # Skip unregistered tools for safety
                    
                    risk = registered_tools[tool]["risk_tier"]
                    if risk == RiskTier.HIGH_DESTRUCTIVE:
                        highest_risk = RiskTier.HIGH_DESTRUCTIVE
                    elif risk == RiskTier.LOW and highest_risk != RiskTier.HIGH_DESTRUCTIVE:
                        highest_risk = RiskTier.LOW

                    validated_steps.append(
                        ToolStep(
                            id=str(uuid.uuid4()),
                            step_index=idx,
                            tool_name=tool,
                            arguments=s.get("arguments", {}),
                            description=s.get("description", f"Execute {tool}"),
                            risk_tier=risk,
                        )
                    )

                return ExecutionPlan(
                    task_id=task_id,
                    explanation=parsed.get("explanation", "Plan proposed by local model."),
                    steps=validated_steps,
                    total_estimated_manual_minutes=float(parsed.get("total_estimated_manual_minutes", 10.0)),
                    highest_risk_tier=highest_risk,
                )
        except Exception as e:
            raise ModelInferenceException(f"Failed to generate structured plan from Ollama: {str(e)}")
