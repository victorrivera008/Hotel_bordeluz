from django.urls import path
from .views import RegistroUsuarioAPIView, ProfileView

urlpatterns = [
    path('register/', RegistroUsuarioAPIView.as_view(), name='user_register'),
    path('profile/', ProfileView.as_view(), name='user_profile'), 
]