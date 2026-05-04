from rest_framework import generics, permissions
from .models import PracticeSession
from .serializers import PracticeSessionSerializer

class SessionListCreateView(generics.ListCreateAPIView):
    serializer_class = PracticeSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PracticeSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PracticeSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PracticeSession.objects.filter(user=self.request.user)