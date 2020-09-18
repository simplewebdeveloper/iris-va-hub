from django.db import models

# Create your models here.


class Bot(models.Model):
    bot_name = models.CharField(max_length=100)
    bot_desc = models.CharField(max_length=1000)
    bot_intents = models.CharField(max_length=256)
    bot_slots = models.CharField(max_length=500, default='none')

    def __str__(self):
        return self.bot_name


class Intent(models.Model):
    bot = models.ForeignKey(Bot, related_name='bot', on_delete=models.CASCADE, default=0)
    intent = models.CharField(max_length=100)
    utterance = models.CharField(max_length=2056, unique=True)
    intent_data = models.CharField(max_length=2056, default='')

    def __str__(self):
        return self.intent_data


class Svp(models.Model):
    bot = models.ForeignKey(Bot, related_name='bot_svp', on_delete=models.CASCADE, default=0)
    slots = models.CharField(max_length=1024, default='')
    utterance = models.CharField(max_length=2056, default='', unique=True)
    svp_data = models.CharField(max_length=2056, default='')
    # new
    intent = models.CharField(max_length=50, default='none')

    def __str__(self):
        return self.svp_data

