from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import ResponseTemplate
from .serializers import ResponseSerializer

class ResponseView(ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = ResponseTemplate.objects.all()
    serializer_class = ResponseSerializer