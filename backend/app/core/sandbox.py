"""
Workspace Boundary Sandbox Validator.
Enforces strict containment within user-authorized workspace directories.
Guards against path traversal, symlink breakouts, and unauthorized access.
"""
import os
import os.path
from app.core.exceptions import SecurityBoundaryException
from app.core.config import settings


class WorkspaceValidator:
    """Validates and enforces that file paths remain strictly inside the authorized workspace root."""

    @staticmethod
    def canonicalize_workspace(workspace_path: str) -> str:
        """
        Resolves the absolute realpath of a workspace root.
        Ensures directory exists and is a directory.
        """
        if not workspace_path:
            raise SecurityBoundaryException("Workspace path cannot be empty.")
        
        # When running containerized where /workspace is mounted, seamlessly map host paths
        if os.path.exists("/workspace") and os.path.isdir("/workspace"):
            clean = workspace_path.strip()
            if clean in ["/workspace", "workspace"] or not os.path.exists(os.path.realpath(os.path.abspath(clean))):
                return os.path.realpath("/workspace")

        real_root = os.path.realpath(os.path.abspath(workspace_path))
        if not os.path.exists(real_root):
            raise SecurityBoundaryException(f"Workspace directory does not exist: {workspace_path}")
        if not os.path.isdir(real_root):
            raise SecurityBoundaryException(f"Workspace path is not a directory: {workspace_path}")
            
        return real_root

    @classmethod
    def resolve_safe_path(cls, workspace_root: str, target_subpath: str) -> str:
        """
        Resolves target_subpath relative to workspace_root and asserts that the canonical
        resolved path is strictly contained within workspace_root.
        Prevents path traversal ('..'), symlink breakouts, and drive jumping.
        """
        canonical_root = cls.canonicalize_workspace(workspace_root)
        
        # Reject leading slashes, drive letters, and traversal tokens immediately
        clean_subpath = target_subpath.strip()
        
        # If the model passed an absolute path matching canonical_root or '/workspace', normalize to relative
        if clean_subpath == canonical_root or clean_subpath in ["/workspace", "workspace"]:
            clean_subpath = ""
        elif clean_subpath.startswith(canonical_root + "/") or clean_subpath.startswith(canonical_root + "\\"):
            clean_subpath = clean_subpath[len(canonical_root):].lstrip("/\\")
        elif clean_subpath.startswith("/workspace/") or clean_subpath.startswith("workspace/"):
            clean_subpath = clean_subpath.replace("/workspace/", "").replace("workspace/", "").lstrip("/\\")

        # Check if subpath is an absolute path or has drive letter outside workspace
        if os.path.isabs(clean_subpath) or (len(clean_subpath) > 1 and clean_subpath[1] == ":"):
            raise SecurityBoundaryException(f"Absolute paths or drive letters forbidden in subpath: '{clean_subpath}'")
            
        traversal_tokens = ["..", "\0"]
        for token in traversal_tokens:
            if token in clean_subpath:
                raise SecurityBoundaryException(f"Path traversal token detected in subpath: '{clean_subpath}'")
                
        # Strip any leading slashes to prevent join root-reset
        clean_subpath = clean_subpath.lstrip("/\\")
                
        # Join and resolve canonical real path
        candidate_path = os.path.abspath(os.path.join(canonical_root, clean_subpath))
        resolved_path = os.path.realpath(candidate_path)
        
        # Check containment via os.path.commonpath
        try:
            common = os.path.commonpath([canonical_root, resolved_path])
        except ValueError:
            # Paths on different drives on Windows
            raise SecurityBoundaryException(
                f"Security violation: path '{target_subpath}' resolves to different volume or outside workspace."
            )
            
        if common != canonical_root:
            raise SecurityBoundaryException(
                f"Security violation: path '{target_subpath}' escapes workspace root '{canonical_root}'."
            )
            
        # Verify symlink policy if file exists
        if not settings.allow_symlinks and os.path.islink(candidate_path):
            raise SecurityBoundaryException(
                f"Security violation: symlinks are disabled by security policy for '{target_subpath}'."
            )
            
        return resolved_path
