from rest_framework.serializers import ModelSerializer
from .models import ResponseTemplate

class ResponseSerializer(ModelSerializer):
    class Meta:
        model = ResponseTemplate
        fields = "__all__"