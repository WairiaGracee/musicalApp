from rest_framework import serializers
from .models import WeeklySong

class WeeklySongSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklySong
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']