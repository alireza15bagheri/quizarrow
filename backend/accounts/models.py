from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

class UserProfile(models.Model):
    class Role(models.TextChoices):
        HOST = "host", _("Host")
        PLAYER = "player", _("Player")
        ADMIN = "admin", _("Admin")

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    role = models.CharField(
        max_length=16, choices=Role.choices, default=Role.PLAYER, verbose_name=_("role")
    )

    def __str__(self):
        return f"{self.user.username} ({self.role})"

    @property
    def is_admin(self) -> bool:
        return self.role == self.Role.ADMIN or getattr(self.user, "is_staff", False)