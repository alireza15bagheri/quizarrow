from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["role"]


class UserAdminSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "is_active", "profile"]

    def get_profile(self, obj):
        # Safely get the profile, creating it if it doesn't exist for robustness.
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return UserProfileSerializer(profile).data

    def update(self, instance, validated_data):
        # Update is_active status on the User model
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()

        # Update role on the nested UserProfile model
        # The request context is needed to access the raw request data for the nested field
        profile_data = self.context['request'].data.get('profile')
        if profile_data and 'role' in profile_data:
            profile = instance.profile
            profile.role = profile_data['role']
            profile.save()

        return instance