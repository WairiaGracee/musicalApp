from django.db import models
from django.conf import settings

class PracticeSession(models.Model):
    SESSION_TYPES = [
        ('voice', 'Voice'),
        ('ear_training', 'Ear Training'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='practice_sessions')
    date = models.DateField()
    type = models.CharField(max_length=20, choices=SESSION_TYPES)
    duration_minutes = models.PositiveIntegerField()
    focus = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    mood = models.PositiveSmallIntegerField(default=3)
    techniques = models.JSONField(default=list, blank=True)
    songs_worked_on = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'practice_sessions'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.user.username} — {self.type} — {self.date}"