from django.contrib import admin
from .views import game
from django.contrib.auth.decorators import login_required
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name="login"),  # /app
    path('', views.index, name="index"),
    path('logout/', views.logout_view, name="logout"),
    path('profile/<profile_user>', login_required(views.ProfileView.as_view()), name="profile"),
    path('register/', views.CaUserSignupView.as_view(), name='confirm'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
