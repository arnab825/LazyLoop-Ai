"""
Procrastination Radar & Lazy Budget Service.
Scans workspace for common postponed maintenance and calculates automation ROI metrics.
"""
import os
import hashlib
from typing import Dict, Any, List
from app.core.sandbox import WorkspaceValidator
from app.tools.registry import ToolRegistry
from app.core.database import get_db_connection


class RadarService:
    """Identifies postponed repository maintenance chores and ranks them by urgency."""

    @classmethod
    async def scan_workspace(cls, workspace_path: str) -> Dict[str, Any]:
        safe_root = WorkspaceValidator.canonicalize_workspace(workspace_path)
        findings = []

        # 1. Check README & Documentation
        readme_res = ToolRegistry.execute_tool("check_doc_gaps", safe_root, {"doc_path": "README.md"})
        if not readme_res.get("exists"):
            findings.append({
                "id": "missing-readme",
                "title": "Missing Project README",
                "category": "Documentation",
                "impact": "HIGH",
                "urgency": "HIGH",
                "estimated_minutes": 20,
                "reason": "Workspace has no README.md file. New contributors will have difficulty understanding setup.",
                "suggested_prompt": "Create a clean starter README.md with title, setup instructions, and license.",
            })
        elif readme_res.get("missing_sections"):
            findings.append({
                "id": "readme-sections",
                "title": f"Incomplete README ({len(readme_res['missing_sections'])} sections missing)",
                "category": "Documentation",
                "impact": "MEDIUM",
                "urgency": "MEDIUM",
                "estimated_minutes": 10,
                "reason": f"Missing standard sections: {', '.join(readme_res['missing_sections'])}",
                "suggested_prompt": "Add missing setup and usage sections to README.md",
            })

        # 2. Check TODO & FIXME markers
        if readme_res.get("todo_fixme_count", 0) > 0:
            findings.append({
                "id": "lingering-todos",
                "title": f"{readme_res['todo_fixme_count']} Lingering TODO/FIXME Markers",
                "category": "Code Hygiene",
                "impact": "LOW",
                "urgency": "LOW",
                "estimated_minutes": 15,
                "reason": "Unresolved TODO or FIXME markers detected in repository documentation.",
                "suggested_prompt": "Review TODO and FIXME markers in README.md and organize them into tasks.",
            })

        # 3. Check for Duplicate Files
        dup_res = ToolRegistry.execute_tool("find_duplicate_files", safe_root, {})
        if dup_res.get("duplicate_groups_count", 0) > 0:
            findings.append({
                "id": "duplicate-assets",
                "title": f"{dup_res['duplicate_groups_count']} Duplicate File Groups Detected",
                "category": "Storage Hygiene",
                "impact": "MEDIUM",
                "urgency": "MEDIUM",
                "estimated_minutes": 15,
                "reason": "Redundant copies of files detected with matching SHA-256 hashes.",
                "suggested_prompt": "Review duplicate files and prepare a cleanup plan.",
            })

        # Calculate Overall Health Score
        deduction = len(findings) * 20
        health_score = max(20, 100 - deduction)

        return {
            "workspace_path": safe_root,
            "health_score": health_score,
            "total_findings": len(findings),
            "findings": findings,
        }
