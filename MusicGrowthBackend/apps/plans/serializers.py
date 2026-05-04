from rest_framework import serializers
from .models import WeeklyPlan

class WeeklyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyPlan
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']