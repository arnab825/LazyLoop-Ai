"""
Strictly Allowlisted Sandboxed Tools.
No raw shell execution is permitted under any circumstances.
All filesystem accesses pass through WorkspaceValidator.
"""
import os
import hashlib
import difflib
from typing import Dict, Any, List, Optional
from app.core.sandbox import WorkspaceValidator
from app.core.exceptions import ToolExecutionException, SecurityBoundaryException
from app.models.schemas import RiskTier


class ToolRegistry:
    """Registry and execution engine for safe sandboxed tools."""

    @staticmethod
    def get_registered_tools() -> Dict[str, Dict[str, Any]]:
        return {
            "list_directory": {
                "risk_tier": RiskTier.READ_ONLY,
                "description": "Lists contents and metadata of a directory within the workspace.",
                "required_args": ["path"],
            },
            "read_file": {
                "risk_tier": RiskTier.READ_ONLY,
                "description": "Reads text content of a file within the workspace.",
                "required_args": ["path"],
            },
            "find_duplicate_files": {
                "risk_tier": RiskTier.READ_ONLY,
                "description": "Identifies files with identical SHA-256 content hashes.",
                "required_args": [],
            },
            "check_doc_gaps": {
                "risk_tier": RiskTier.READ_ONLY,
                "description": "Inspects README/docs for missing standard sections and setup instructions.",
                "required_args": ["doc_path"],
            },
            "create_file": {
                "risk_tier": RiskTier.LOW,
                "description": "Creates a new file with specified content.",
                "required_args": ["path", "content"],
            },
            "update_file": {
                "risk_tier": RiskTier.LOW,
                "description": "Modifies an existing file with new content.",
                "required_args": ["path", "content"],
            },
            "delete_file": {
                "risk_tier": RiskTier.HIGH_DESTRUCTIVE,
                "description": "Deletes a designated file.",
                "required_args": ["path"],
            },
            "move_file": {
                "risk_tier": RiskTier.LOW,
                "description": "Moves or renames a file within the workspace.",
                "required_args": ["src", "dest"],
            },
        }

    @classmethod
    def execute_tool(
        cls,
        tool_name: str,
        workspace_root: str,
        arguments: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Dispatches tool execution with sandbox boundary validation."""
        tools = cls.get_registered_tools()
        if tool_name not in tools:
            raise ToolExecutionException(f"Unsupported tool: '{tool_name}'. Raw shell execution is prohibited.")

        # Dispatch method
        handler_name = f"_handle_{tool_name}"
        handler = getattr(cls, handler_name, None)
        if not handler:
            raise ToolExecutionException(f"No execution handler implemented for tool: '{tool_name}'")

        return handler(workspace_root, arguments)

    # --- Tool Handlers ---

    @classmethod
    def _handle_list_directory(cls, workspace_root: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        target_subpath = arguments.get("path", "")
        safe_path = WorkspaceValidator.resolve_safe_path(workspace_root, target_subpath)
        
        if not os.path.exists(safe_path):
            raise ToolExecutionException(f"Directory not found: {target_subpath}")
        if not os.path.isdir(safe_path):
            raise ToolExecutionException(f"Path is not a directory: {target_subpath}")

        items = []
        for entry in os.scandir(safe_path):
            rel_path = os.path.relpath(entry.path, workspace_root)
            items.append({
                "name": entry.name,
                "relative_path": rel_path.replace("\\", "/"),
                "is_dir": entry.is_dir(),
                "size_bytes": entry.stat().st_size if entry.is_file() else 0,
            })
            
        return {
            "path": target_subpath,
            "total_items": len(items),
            "items": sorted(items, key=lambda x: (not x["is_dir"], x["name"])),
        }

    @classmethod
    def _handle_read_file(cls, workspace_root: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        target_subpath = arguments.get("path", "")
        max_lines = arguments.get("max_lines", 500)
        safe_path = WorkspaceValidator.resolve_safe_path(workspace_root, target_subpath)

        if not os.path.exists(safe_path):
            raise ToolExecutionException(f"File not found: {target_subpath}")
        if not os.path.isfile(safe_path):
            raise ToolExecutionException(f"Path is not a file: {target_subpath}")

        try:
            with open(safe_path, "r", encoding="utf-8", errors="replace") as f:
                lines = [f.readline() for _ in range(max_lines)]
            return {
                "path": target_subpath,
                "lines_read": len(lines),
                "content": "".join(lines),
            }
        except Exception as e:
            raise ToolExecutionException(f"Failed to read file '{target_subpath}': {str(e)}")

    @classmethod
    def _handle_find_duplicate_files(cls, workspace_root: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        subfolder = arguments.get("subfolder", "")
        safe_root = WorkspaceValidator.resolve_safe_path(workspace_root, subfolder)
        
        hash_map: Dict[str, List[str]] = {}
        for root, dirs, files in os.walk(safe_root):
            # Skip hidden and backup folders
            dirs[:] = [d for d in dirs if not d.startswith(".") and d != "node_modules"]
            for file in files:
                file_full = os.path.join(root, file)
                if os.path.isfile(file_full):
                    try:
                        sha = hashlib.sha256()
                        with open(file_full, "rb") as f:
                            while chunk := f.read(65536):
                                sha.update(chunk)
                        digest = sha.hexdigest()
                        rel = os.path.relpath(file_full, workspace_root).replace("\\", "/")
                        hash_map.setdefault(digest, []).append(rel)
                    except Exception:
                        continue

        # Keep only duplicate groups (>= 2 files)
        duplicates = [
            {"hash": h, "file_count": len(paths), "files": paths}
            for h, paths in hash_map.items() if len(paths) > 1
        ]

        return {
            "duplicate_groups_count": len(duplicates),
            "duplicate_groups": duplicates,
        }

    @classmethod
    def _handle_check_doc_gaps(cls, workspace_root: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        doc_path = arguments.get("doc_path", "README.md")
        safe_path = WorkspaceValidator.resolve_safe_path(workspace_root, doc_path)

        exists = os.path.exists(safe_path)
        if not exists:
            return {
                "doc_path": doc_path,
                "exists": False,
                "missing_sections": [
                    "Project Title & Description",
                    "Installation / Prerequisites",
                    "Usage Instructions",
                    "License Information"
                ],
                "todo_fixme_count": 0,
            }

        content = ""
        with open(safe_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        lower_content = content.lower()
        standard_sections = {
            "Installation / Prerequisites": ["## installation", "## setup", "## prerequisites", "### installation"],
            "Usage Instructions": ["## usage", "## quickstart", "## how to run"],
            "License Information": ["## license", "## copyright"],
            "Contributing Guide": ["## contributing", "## development"],
        }

        missing = []
        for section, keywords in standard_sections.items():
            if not any(k in lower_content for k in keywords):
                missing.append(section)

        # Count TODO / FIXME markers
        todo_count = content.count("TODO") + content.count("FIXME")

        return {
            "doc_path": doc_path,
            "exists": True,
            "missing_sections": missing,
            "todo_fixme_count": todo_count,
            "content_length_chars": len(content),
        }

    @classmethod
    def _handle_create_file(cls, workspace_root: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        target_subpath = arguments.get("path", "")
        content = arguments.get("content", "")
        safe_path = WorkspaceValidator.resolve_safe_path(workspace_root, target_subpath)

        if os.path.exists(safe_path):
            raise ToolExecutionException(f"Cannot create file because it already exists: {target_subpath}")

        os.makedirs(os.path.dirname(safe_path), exist_ok=True)
        with open(safe_path, "w", encoding="utf-8") as f:
            f.write(content)

        return {
            "path": target_subpath,
            "created": True,
            "bytes_written": len(content.encode("utf-8")),
            "sha256": hashlib.sha256(content.encode("utf-8")).hexdigest(),
        }

    @classmethod
    def _handle_update_file(cls, workspace_root: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        target_subpath = arguments.get("path", "")
        content = arguments.get("content", "")
        safe_path = WorkspaceValidator.resolve_safe_path(workspace_root, target_subpath)

        if not os.path.exists(safe_path):
            raise ToolExecutionException(f"Cannot update file because it does not exist: {target_subpath}")

        # Compute diff before overwriting
        old_content = ""
        with open(safe_path, "r", encoding="utf-8", errors="replace") as f:
            old_content = f.read()

        diff = difflib.unified_diff(
            old_content.splitlines(keepends=True),
            content.splitlines(keepends=True),
            fromfile=f"a/{target_subpath}",
            tofile=f"b/{target_subpath}",
        )
        diff_text = "".join(diff)

        with open(safe_path, "w", encoding="utf-8") as f:
            f.write(content)

        return {
            "path": target_subpath,
            "updated": True,
            "diff": diff_text,
            "new_sha256": hashlib.sha256(content.encode("utf-8")).hexdigest(),
        }

    @classmethod
    def _handle_delete_file(cls, workspace_root: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        target_subpath = arguments.get("path", "")
        safe_path = WorkspaceValidator.resolve_safe_path(workspace_root, target_subpath)

        if not os.path.exists(safe_path):
            raise ToolExecutionException(f"File not found for deletion: {target_subpath}")
        if os.path.isdir(safe_path):
            raise ToolExecutionException(f"Recursive directory deletion not permitted via delete_file: {target_subpath}")

        os.remove(safe_path)
        return {
            "path": target_subpath,
            "deleted": True,
        }

    @classmethod
    def _handle_move_file(cls, workspace_root: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        src_subpath = arguments.get("src", "")
        dest_subpath = arguments.get("dest", "")

        safe_src = WorkspaceValidator.resolve_safe_path(workspace_root, src_subpath)
        safe_dest = WorkspaceValidator.resolve_safe_path(workspace_root, dest_subpath)

        if not os.path.exists(safe_src):
            raise ToolExecutionException(f"Source file does not exist: {src_subpath}")
        if os.path.exists(safe_dest):
            raise ToolExecutionException(f"Destination file already exists: {dest_subpath}")

        os.makedirs(os.path.dirname(safe_dest), exist_ok=True)
        os.rename(safe_src, safe_dest)

        return {
            "src": src_subpath,
            "dest": dest_subpath,
            "moved": True,
        }
