from django.urls import path
from .views import ChallengeListCreateView, ChallengeDetailView, current_challenge, generate_challenge

urlpatterns = [
    path('', ChallengeListCreateView.as_view(), name='challenge-list'),
    path('current/', current_challenge, name='challenge-current'),
    path('generate/', generate_challenge, name='challenge-generate'),
    path('<int:pk>/', ChallengeDetailView.as_view(), name='challenge-detail'),
]