from rest_framework import generics, permissions
from .models import WeeklySong
from .serializers import WeeklySongSerializer

class SongListCreateView(generics.ListCreateAPIView):
    serializer_class = WeeklySongSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WeeklySong.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SongDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WeeklySongSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WeeklySong.objects.filter(user=self.request.user)