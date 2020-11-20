from django.db import models

# Create your models here.


class Project(models.Model):
    project_name = models.CharField(max_length=100)
    project_tag = models.CharField(max_length=100, default='')
    project_desc = models.CharField(max_length=1000)

    def __str__(self):
        return self.project_name

class Transition(models.Model):
    transition_name = models.CharField(max_length=100)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    source_va_id = models.CharField(max_length=100)
    source_va_name = models.CharField(max_length=100)
    source_va_intent = models.CharField(max_length=100)
    dest_va = models.CharField(max_length=100)

    def __str__(self):
        return self.transition_name

class Va(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    va_name = models.CharField(max_length=100)
    va_tag = models.CharField(max_length=100, default='')
    va_desc = models.CharField(max_length=1000)
    va_intents = models.CharField(max_length=256)
    va_slots = models.CharField(max_length=500, default='none')

    def __str__(self):
        return self.va_name

class BlsModel(models.Model):
    va = models.ForeignKey(Va, on_delete=models.CASCADE)
    bls_url = models.CharField(max_length=100)

    def __str__(self):
        return self.bls_url

class Intent(models.Model):
    va = models.ForeignKey(Va, on_delete=models.CASCADE)
    intent = models.CharField(max_length=100)
    utterance = models.CharField(max_length=2056)
    intent_data = models.CharField(max_length=2056, default='')

    def __str__(self):
        return self.intent_data


class Svp(models.Model):
    va = models.ForeignKey(Va, on_delete=models.CASCADE)
    slots = models.CharField(max_length=1024, default='')
    utterance = models.CharField(max_length=2056, default='')
    svp_data = models.CharField(max_length=2056, default='')
    # new
    intent = models.CharField(max_length=50, default='none')

    def __str__(self):
        return self.svp_data

