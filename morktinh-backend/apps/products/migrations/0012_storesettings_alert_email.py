from django.db import migrations, models

import apps.products.models


def copy_support_email_to_alert_email(apps, schema_editor):
    StoreSettings = apps.get_model('products', 'StoreSettings')
    for settings in StoreSettings.objects.all():
        settings.alert_email = settings.support_email
        settings.save(update_fields=['alert_email'])


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0011_store_settings_default_support_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='storesettings',
            name='alert_email',
            field=models.EmailField(
                default=apps.products.models.default_support_email,
                max_length=254,
            ),
        ),
        migrations.RunPython(
            copy_support_email_to_alert_email,
            migrations.RunPython.noop,
        ),
    ]
