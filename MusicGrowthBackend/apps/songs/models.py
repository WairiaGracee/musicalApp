from django.db import models
from django.conf import settings

class WeeklySong(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='songs')
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    added_date = models.DateField()
    techniques = models.JSONField(default=list, blank=True)
    vocal_layers = models.JSONField(default=dict, blank=True)
    recordings = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-added_date', '-created_at']

    def __str__(self):
        return f"{self.user.username} — {self.title} by {self.artist}"