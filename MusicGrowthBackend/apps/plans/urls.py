from django.urls import path
from .views import PlanListCreateView, PlanDetailView, current_plan, generate_plan

urlpatterns = [
    path('', PlanListCreateView.as_view(), name='plan-list'),
    path('current/', current_plan, name='plan-current'),
    path('generate/', generate_plan, name='plan-generate'),
    path('<int:pk>/', PlanDetailView.as_view(), name='plan-detail'),
]