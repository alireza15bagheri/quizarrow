from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth import authenticate, login, logout

@ensure_csrf_cookie
@require_GET
def csrf(request):
    # Sets csrftoken cookie on the response
    return JsonResponse({"detail": "CSRF cookie set"})

@csrf_protect
@require_POST
def login_view(request):
    import json
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    if not username or not password:
        return JsonResponse({"error": "Missing credentials"}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"error": "Invalid username or password"}, status=401)

    login(request, user)
    return JsonResponse({"user": {"id": user.id, "username": user.username}})

@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"detail": "Logged out"})

@require_GET
def me(request):
    if request.user.is_authenticated:
        u = request.user
        return JsonResponse({"id": u.id, "username": u.username})
    return JsonResponse({"detail": "Anonymous"}, status=401)
