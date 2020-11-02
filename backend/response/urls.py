from django.urls import path, include
from rest_framework import routers

from .views import ResponseView

router = routers.DefaultRouter()

router.register('', ResponseView)

urlpatterns = [
    path('', include(router.urls))
]
