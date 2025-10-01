import bleach
from rest_framework import serializers
from ..models import Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]

    def validate_name(self, value):
        """Sanitize tag name to prevent XSS."""
        return bleach.clean(value)