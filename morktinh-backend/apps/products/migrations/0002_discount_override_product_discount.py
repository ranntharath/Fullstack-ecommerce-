from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='discount',
            name='override_product_discount',
            field=models.BooleanField(default=False),
        ),
    ]
