from rest_framework import permissions
from accounts.models import UserProfile


class IsHostOrAdmin(permissions.BasePermission):
    """
    Allows access only to users with the 'host' or 'admin' role.
    """

    def has_permission(self, request, view):
        # IsAuthenticated is assumed to be checked by another permission class.
        if not request.user or not request.user.is_authenticated:
            return False

        # Check if the user has a profile and the required role.
        profile = getattr(request.user, "profile", None)
        return profile and profile.role in [UserProfile.Role.HOST, UserProfile.Role.ADMIN]