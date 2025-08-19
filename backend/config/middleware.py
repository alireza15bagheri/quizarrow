import json
import time
import logging
from typing import Iterable
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.utils.deprecation import MiddlewareMixin

api_logger = logging.getLogger("api")

def _is_api_path(path: str) -> bool:
    prefixes: Iterable[str] = getattr(settings, "API_PATH_PREFIXES", ["/api"])
    return any(path.startswith(p) for p in prefixes)

class SimpleCORSMiddleware(MiddlewareMixin):
    """
    Minimal CORS support without external deps.
    Applies only to paths under API/WS prefixes and allowed origins.
    """
    def process_request(self, request):
        origin = request.META.get("HTTP_ORIGIN")
        if not origin or not _is_api_path(request.path):
            return None

        allowed = getattr(settings, "CORS_ALLOWED_ORIGINS", [])
        if origin not in allowed:
            return None

        # Handle preflight
        if request.method == "OPTIONS":
            resp = HttpResponse(status=204)
            self._set_headers(resp, origin)
            return resp
        return None

    def process_response(self, request, response):
        origin = request.META.get("HTTP_ORIGIN")
        if origin and _is_api_path(request.path):
            allowed = getattr(settings, "CORS_ALLOWED_ORIGINS", [])
            if origin in allowed:
                self._set_headers(response, origin)
        return response

    def _set_headers(self, response, origin):
        response["Access-Control-Allow-Origin"] = origin
        if getattr(settings, "CORS_ALLOW_CREDENTIALS", True):
            response["Access-Control-Allow-Credentials"] = "true"
        response["Vary"] = "Origin"
        response["Access-Control-Allow-Methods"] = ", ".join(getattr(settings, "CORS_ALLOW_METHODS", []))
        response["Access-Control-Allow-Headers"] = ", ".join(getattr(settings, "CORS_ALLOW_HEADERS", []))


class APILoggingMiddleware:
    """
    Logs method, path, status, duration, and user id for API paths.
    Keeps bodies out by default; only short error bodies are logged.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()
        response = self.get_response(request)
        if _is_api_path(request.path):
            duration_ms = int((time.perf_counter() - start) * 1000)
            user_id = getattr(request.user, "id", None) if hasattr(request, "user") and request.user.is_authenticated else None
            msg = {
                "method": request.method,
                "path": request.path,
                "status": getattr(response, "status_code", None),
                "ms": duration_ms,
                "user_id": user_id,
            }
            # Log small error payloads for faster debugging
            if msg["status"] and msg["status"] >= 400:
                try:
                    if isinstance(response, JsonResponse):
                        data = json.loads(response.content.decode("utf-8"))
                        msg["error"] = data.get("error") or data.get("detail")
                except Exception:
                    pass
                api_logger.warning(msg)
            else:
                api_logger.info(msg)
        return response


class APIExceptionMiddleware:
    """
    Converts unhandled exceptions on API paths into a consistent JSON error.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not _is_api_path(request.path):
            return self.get_response(request)
        try:
            return self.get_response(request)
        except Exception as ex:
            api_logger.exception({"method": request.method, "path": request.path, "error": str(ex)})
            body = {
                "ok": False,
                "error": {"code": "server_error", "message": "Internal server error", "details": {}},
                "detail": "Internal server error",
                "error": "Internal server error",
            }
            return JsonResponse(body, status=500)
