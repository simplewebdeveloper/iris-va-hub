from rest_framework import serializers
from .models import Project
from .models import Va
from .models import Intent
from .models import Svp

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class VaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Va
        fields = '__all__'


class IntentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Intent
        fields = '__all__'


class SvpSerializer(serializers.ModelSerializer):
    class Meta:
        model = Svp
        fields = '__all__'
