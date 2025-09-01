from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth import authenticate, login, logout
from .models import UserProfile

# --- Response helpers (consistent shape) ---

def json_ok(payload: dict | None = None, status: int = 200):
    """
    Success shape: preserves existing keys for compatibility, and adds ok: true.
    """
    data = {"ok": True}
    if payload:
        data.update(payload)
    return JsonResponse(data, status=status)

def json_error(message: str, *, code: str = "error", status: int = 400, details: dict | None = None):
    """
    Error shape: structured 'error' (object) plus legacy string fields.
    - 'error': object with 'code', 'message', 'details'
    - 'detail': legacy message string
    - 'error_legacy': legacy message string for older clients that expected a string in 'error'
    """
    body = {
        "ok": False,
        "error": {"code": code, "message": message, "details": details or {}},
        "detail": message,         # legacy message string
        "error_legacy": message,   # legacy alias; do not overwrite 'error' object
    }
    return JsonResponse(body, status=status)

# --- CSRF failure as JSON ---

def csrf_failure_view(request, reason=""):
    return json_error("CSRF verification failed", code="csrf_failed", status=403, details={"reason": reason})

@ensure_csrf_cookie
@require_GET
def csrf(request):
    # Sets csrftoken cookie on the response
    return json_ok({"detail": "CSRF cookie set"})

def _get_user_data(user):
    """
    Helper to consistently serialize user data, safely handling missing profiles
    and ensuring superusers are recognized as admins.
    """
    # Superusers are always admins, regardless of their profile.
    if user.is_superuser:
        role = UserProfile.Role.ADMIN
    else:
        # For regular users, safely check for a profile.
        # Fallback to the default role if a profile somehow doesn't exist.
        try:
            role = user.profile.role
        except UserProfile.DoesNotExist:
            role = UserProfile.Role.PLAYER

    return {
        "id": user.id,
        "username": user.username,
        "role": role,
    }

@csrf_protect
@require_POST
def login_view(request):
    import json
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return json_error("Invalid JSON", code="invalid_json", status=400)

    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    if not username or not password:
        return json_error("Missing credentials", code="missing_credentials", status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return json_error("Invalid username or password", code="invalid_credentials", status=401)

    login(request, user)
    return json_ok(_get_user_data(user))

@csrf_protect
@require_POST
def logout_view(request):
    logout(request)
    return json_ok({"detail": "Logged out"})

@require_GET
def me(request):
    if request.user.is_authenticated:
        return json_ok(_get_user_data(request.user))
    return json_error("Anonymous", code="anonymous", status=401)