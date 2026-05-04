from django.db import models
from django.conf import settings

class WeeklyPlan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='plans')
    week_start = models.DateField()
    week_end = models.DateField()
    focus = models.CharField(max_length=500)
    ai_suggestion = models.TextField(blank=True)
    tasks = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-week_start']

    def __str__(self):
        return f"{self.user.username} — week of {self.week_start}"