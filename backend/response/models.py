from django.db import models
from api.models import Project, Va

class ResponseTemplate(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    va = models.ForeignKey(Va, on_delete=models.CASCADE)
    device = models.CharField(max_length=50)
    intent = models.CharField(max_length=100)
    template = models.TextField()

    def __str__(self):
        return self.device

class ResponseValue(models.Model):
    response = models.ForeignKey(ResponseTemplate, on_delete=models.CASCADE)
    template = models.TextField()

    def __str__(self):
        return self.template