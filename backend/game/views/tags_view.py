from rest_framework import generics, permissions
from ..models import Tag
from ..serializers import TagSerializer


class TagListView(generics.ListAPIView):
    """
    Provides a list of all available tags.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]