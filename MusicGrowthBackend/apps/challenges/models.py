from django.db import models
from django.conf import settings

class MonthlyChallenge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenges')
    month = models.CharField(max_length=7)  # YYYY-MM
    title = models.CharField(max_length=255)
    skill = models.CharField(max_length=255)
    description = models.TextField()
    target_song = models.CharField(max_length=255, blank=True)
    exercises = models.JSONField(default=list)
    completed_days = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'month']
        ordering = ['-month']

    def __str__(self):
        return f"{self.user.username} — {self.month} — {self.title}"