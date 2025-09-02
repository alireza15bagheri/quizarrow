from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
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
        profile_data = self.context['request'].data.get('profile')
        if profile_data and 'role' in profile_data:
            # Enforce business rule: only allow changing to 'player' or 'host'
            new_role = profile_data['role']
            if new_role == UserProfile.Role.ADMIN:
                raise ValidationError({"profile": {"role": "Cannot set user role to 'admin'."}})
            
            # Enforce business rule: prevent an admin from changing their own role
            requesting_user = self.context['request'].user
            if instance.id == requesting_user.id:
                 raise ValidationError({"profile": {"role": "You cannot change your own role."}})
            
            profile = instance.profile
            profile.role = new_role
            profile.save()

        return instance