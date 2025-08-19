from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.utils import timezone

from .models import LobbyRoom, LobbyParticipant, GameEvent

# --- LobbyRoom lifecycle ---

@receiver(post_save, sender=LobbyRoom)
def lobby_created_or_saved(sender, instance: LobbyRoom, created: bool, **kwargs):
    if created:
        GameEvent.objects.create(
            event_type=GameEvent.Type.LOBBY_CREATED,
            lobby=instance,
            quiz=instance.quiz,
            payload={"status": instance.status},
        )
    # Status changes are tracked via pre_save/post_save pair below
    changed = getattr(instance, "_status_changed_to", None)
    if changed:
        etype = None
        if changed == LobbyRoom.Status.RUNNING:
            etype = GameEvent.Type.LOBBY_STARTED
        elif changed == LobbyRoom.Status.ENDED:
            etype = GameEvent.Type.LOBBY_ENDED
        else:
            etype = GameEvent.Type.STATUS_CHANGED
        GameEvent.objects.create(
            event_type=etype,
            lobby=instance,
            quiz=instance.quiz,
            payload={"to": changed},
        )
        # cleanup flag
        delattr(instance, "_status_changed_to")

@receiver(pre_save, sender=LobbyRoom)
def lobby_status_change_probe(sender, instance: LobbyRoom, **kwargs):
    if not instance.pk:
        return
    try:
        prev = LobbyRoom.objects.get(pk=instance.pk)
    except LobbyRoom.DoesNotExist:
        return
    if prev.status != instance.status:
        instance._status_changed_to = instance.status
        # Set timestamps if not provided
        if instance.status == LobbyRoom.Status.RUNNING and not instance.started_at:
            instance.started_at = timezone.now()
        if instance.status == LobbyRoom.Status.ENDED and not instance.ended_at:
            instance.ended_at = timezone.now()

# --- LobbyParticipant lifecycle ---

@receiver(pre_save, sender=LobbyParticipant)
def participant_transition_probe(sender, instance: LobbyParticipant, **kwargs):
    if not instance.pk:
        # creation tracked in post_save
        return
    try:
        prev = LobbyParticipant.objects.get(pk=instance.pk)
    except LobbyParticipant.DoesNotExist:
        return
    leaving = False
    if prev.connected and not instance.connected:
        leaving = True
    if prev.left_at is None and instance.left_at is not None:
        leaving = True
    instance._leaving_now = leaving

@receiver(post_save, sender=LobbyParticipant)
def participant_created_or_updated(sender, instance: LobbyParticipant, created: bool, **kwargs):
    if created:
        GameEvent.objects.create(
            event_type=GameEvent.Type.PARTICIPANT_JOINED,
            lobby=instance.lobby,
            quiz=instance.lobby.quiz,
            participant=instance,
            payload={"nickname": instance.nickname, "is_host": instance.is_host},
        )
        return

    if getattr(instance, "_leaving_now", False):
        # ensure left_at is set
        if instance.left_at is None:
            instance.left_at = timezone.now()
            instance.save(update_fields=["left_at"])
        GameEvent.objects.create(
            event_type=GameEvent.Type.PARTICIPANT_LEFT,
            lobby=instance.lobby,
            quiz=instance.lobby.quiz,
            participant=instance,
            payload={"nickname": instance.nickname},
        )
        delattr(instance, "_leaving_now")

@receiver(post_delete, sender=LobbyParticipant)
def participant_deleted(sender, instance: LobbyParticipant, **kwargs):
    # Treat delete as a leave
    GameEvent.objects.create(
        event_type=GameEvent.Type.PARTICIPANT_LEFT,
        lobby=instance.lobby,
        quiz=instance.lobby.quiz,
        participant=None,
        payload={"nickname": instance.nickname, "reason": "deleted"},
    )
