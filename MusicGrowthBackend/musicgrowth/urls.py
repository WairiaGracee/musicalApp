from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/sessions/', include('apps.sessions.urls')),
    path('api/plans/', include('apps.plans.urls')),
    path('api/goals/', include('apps.goals.urls')),
    path('api/journal/', include('apps.journal.urls')),
    path('api/songs/', include('apps.songs.urls')),
    path('api/challenges/', include('apps.challenges.urls')),
]