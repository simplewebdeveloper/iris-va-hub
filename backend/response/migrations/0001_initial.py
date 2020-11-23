# Generated by Django 3.0.5 on 2020-11-10 00:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('api', '0005_auto_20201102_1150'),
    ]

    operations = [
        migrations.CreateModel(
            name='ResponseTemplate',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('device', models.CharField(max_length=50)),
                ('intent', models.CharField(max_length=100)),
                ('template', models.TextField()),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.Project')),
                ('va', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.Va')),
            ],
        ),
    ]