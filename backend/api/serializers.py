from rest_framework import serializers
from .models import Bot
from .models import Intent
from .models import Svp


class BotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bot
        fields = '__all__'


class IntentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Intent
        fields = '__all__'


class SvpSerializer(serializers.ModelSerializer):
    class Meta:
        model = Svp
        fields = '__all__'
