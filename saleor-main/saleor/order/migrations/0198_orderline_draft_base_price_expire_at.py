# Generated by Django 4.2.16 on 2025-02-21 15:57

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("order", "0197_order_draft_save_billing_address_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="orderline",
            name="draft_base_price_expire_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
