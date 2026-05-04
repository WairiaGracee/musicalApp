from rest_framework import serializers
from .models import MonthlyChallenge

class MonthlyChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyChallenge
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']