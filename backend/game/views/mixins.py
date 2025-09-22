from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError

from ..models import Quiz


class QuizEditPermissionMixin:
    """
    Mixin to centralize common quiz ownership and publish-state checks.
    Provides `get_owned_quiz_or_403` to retrieve a quiz and enforce:
      - Current user is the host
      - Quiz is not published (unless allow_published=True)
    """

    def get_owned_quiz_or_403(self, quiz_id, *, allow_published=False):
        quiz = get_object_or_404(Quiz, pk=quiz_id)
        if quiz.host != self.request.user:
            raise PermissionDenied("You do not have permission to edit this quiz.")
        if quiz.is_published and not allow_published:
            raise ValidationError("This quiz is published and cannot be modified.")
        return quiz