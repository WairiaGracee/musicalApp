import json
from datetime import date, timedelta
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
from .models import WeeklyPlan
from .serializers import WeeklyPlanSerializer
from apps.sessions.models import PracticeSession

class PlanListCreateView(generics.ListCreateAPIView):
    serializer_class = WeeklyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WeeklyPlan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WeeklyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WeeklyPlan.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_plan(request):
    today = date.today()
    plan = WeeklyPlan.objects.filter(
        user=request.user,
        week_start__lte=today,
        week_end__gte=today,
    ).first()
    if not plan:
        return Response(None)
    return Response(WeeklyPlanSerializer(plan).data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_plan(request):
    import anthropic

    recent_sessions = PracticeSession.objects.filter(user=request.user).order_by('-date')[:6]
    session_summary = '\n'.join([
        f"{s.date}: {s.get_type_display()} — {s.focus} ({s.duration_minutes} min, mood {s.mood}/5). Notes: {s.notes}"
        for s in recent_sessions
    ]) or 'No sessions logged yet.'

    prompt = f"""You are a music coach helping a singer grow intentionally.
The user is an intermediate vocalist and beginner in ear training.

Recent sessions:
{session_summary}

Generate a weekly plan as JSON:
{{
  "focus": "one sentence theme",
  "ai_suggestion": "2-3 sentences of coaching advice",
  "tasks": [
    {{
      "id": "uid1",
      "type": "voice",
      "title": "task title",
      "description": "specific instructions",
      "resources": [],
      "days_target": 3,
      "completed": false
    }}
  ]
}}

Include 4-5 tasks: 2-3 voice, 2 ear training. Respond ONLY with JSON."""

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model='claude-sonnet-4-20250514',
        max_tokens=1000,
        messages=[{'role': 'user', 'content': prompt}],
    )
    text = message.content[0].text.replace('```json', '').replace('```', '').strip()
    parsed = json.loads(text)

    today = date.today()
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)

    plan = WeeklyPlan.objects.create(
        user=request.user,
        week_start=monday,
        week_end=sunday,
        focus=parsed['focus'],
        ai_suggestion=parsed.get('ai_suggestion', ''),
        tasks=parsed['tasks'],
    )
    return Response(WeeklyPlanSerializer(plan).data, status=status.HTTP_201_CREATED)