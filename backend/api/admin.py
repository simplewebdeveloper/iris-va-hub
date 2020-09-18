from django.contrib import admin
from import_export.admin import ImportExportModelAdmin, ImportExportMixin, ImportMixin, ExportActionModelAdmin, ImportExportActionModelAdmin
from .models import Bot
from .models import Intent
from .models import Svp

# Register your models here.
admin.site.register(Bot, ImportExportModelAdmin)
admin.site.register(Intent, ImportExportModelAdmin)
admin.site.register(Svp, ImportExportModelAdmin)
