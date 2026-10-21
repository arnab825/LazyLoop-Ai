"""
Custom exceptions for LazyLoop AI.
"""


class LazyLoopException(Exception):
    """Base exception for all LazyLoop errors."""
    def __init__(self, message: str, error_code: str = "INTERNAL_ERROR"):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)


class SecurityBoundaryException(LazyLoopException):
    """Raised when an operation attempts to escape the authorized workspace root."""
    def __init__(self, message: str):
        super().__init__(message=message, error_code="WORKSPACE_ESCAPE_VIOLATION")


class ToolExecutionException(LazyLoopException):
    """Raised when a sandboxed tool fails to execute safely."""
    def __init__(self, message: str):
        super().__init__(message=message, error_code="TOOL_EXECUTION_FAILURE")


class ApprovalRequiredException(LazyLoopException):
    """Raised when an operation requires ungranted human approval."""
    def __init__(self, message: str):
        super().__init__(message=message, error_code="APPROVAL_REQUIRED")


class VerificationException(LazyLoopException):
    """Raised when deterministic postcondition verification fails."""
    def __init__(self, message: str):
        super().__init__(message=message, error_code="VERIFICATION_FAILURE")


class ModelInferenceException(LazyLoopException):
    """Raised when an AI model fails or returns unparseable output after bounded retries."""
    def __init__(self, message: str):
        super().__init__(message=message, error_code="MODEL_INFERENCE_ERROR")
