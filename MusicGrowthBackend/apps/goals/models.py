from django.db import models
from django.conf import settings

class Goal(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('completed', 'Completed'), ('paused', 'Paused')]
    TYPE_CHOICES = [('voice', 'Voice'), ('ear_training', 'Ear Training'), ('general', 'General')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='voice')
    target_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    milestones = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} — {self.title}"