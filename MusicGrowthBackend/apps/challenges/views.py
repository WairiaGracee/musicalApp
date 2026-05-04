import json
from datetime import date
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
from .models import MonthlyChallenge
from .serializers import MonthlyChallengeSerializer

class ChallengeListCreateView(generics.ListCreateAPIView):
    serializer_class = MonthlyChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MonthlyChallenge.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChallengeDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = MonthlyChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MonthlyChallenge.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_challenge(request):
    month = date.today().strftime('%Y-%m')
    challenge = MonthlyChallenge.objects.filter(user=request.user, month=month).first()
    if not challenge:
        return Response(None)
    return Response(MonthlyChallengeSerializer(challenge).data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_challenge(request):
    import anthropic

    prompt = """You are a vocal coach creating a monthly challenge for an intermediate singer.

Generate a monthly challenge as JSON:
{
  "title": "short punchy challenge name",
  "skill": "skill being trained",
  "description": "2-3 sentences explaining the month and why this skill matters",
  "target_song": "Artist - Song that showcases this skill",
  "exercises": [
    {"id": "uid1", "title": "exercise name", "description": "step by step instructions", "completed": false}
  ]
}

Include exactly 4 exercises. Be specific and encouraging. Respond ONLY with JSON."""

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model='claude-sonnet-4-20250514',
        max_tokens=1000,
        messages=[{'role': 'user', 'content': prompt}],
    )
    text = message.content[0].text.replace('```json', '').replace('```', '').strip()
    parsed = json.loads(text)

    month = date.today().strftime('%Y-%m')
    challenge, _ = MonthlyChallenge.objects.update_or_create(
        user=request.user,
        month=month,
        defaults={
            'title': parsed['title'],
            'skill': parsed['skill'],
            'description': parsed['description'],
            'target_song': parsed.get('target_song', ''),
            'exercises': parsed['exercises'],
            'completed_days': [],
        }
    )
    return Response(MonthlyChallengeSerializer(challenge).data, status=status.HTTP_201_CREATED)