# Generated by Django 3.0.4 on 2020-03-08 16:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_auto_20200308_1426'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='intent',
            name='bot',
        ),
    ]
