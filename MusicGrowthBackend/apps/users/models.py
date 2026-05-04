from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    voice_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='intermediate')
    instrument_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username