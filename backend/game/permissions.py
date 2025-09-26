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


class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to users with the 'admin' role.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        profile = getattr(request.user, "profile", None)
        return profile and profile.role == UserProfile.Role.ADMIN


class IsChatRoomOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access only to the user who created the chat room or an admin.
    """
    def has_object_permission(self, request, view, obj):
        # Admins can delete any room.
        if request.user.profile.is_admin:
            return True
        # The user who created the room can delete it.
        return obj.created_by == request.user