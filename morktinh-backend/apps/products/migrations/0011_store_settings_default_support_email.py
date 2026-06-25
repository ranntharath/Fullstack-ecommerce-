from django.conf import settings
from django.db import migrations, models

import apps.products.models


def update_placeholder_support_email(apps, schema_editor):
    StoreSettings = apps.get_model('products', 'StoreSettings')
    StoreSettings.objects.filter(
        support_email='support@morktinh.com',
    ).update(
        support_email=getattr(settings, 'EMAIL_HOST_USER', 'support@morktinh.com'),
    )


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0010_storesettings'),
    ]

    operations = [
        migrations.AlterField(
            model_name='storesettings',
            name='support_email',
            field=models.EmailField(
                default=apps.products.models.default_support_email,
                max_length=254,
            ),
        ),
        migrations.RunPython(
            update_placeholder_support_email,
            migrations.RunPython.noop,
        ),
    ]
