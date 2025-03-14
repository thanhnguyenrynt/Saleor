# Generated by Django 3.2.13 on 2022-05-02 11:06
import datetime

from django.contrib.postgres.functions import RandomUUID
from django.contrib.postgres.operations import CryptoExtension
from django.db import migrations
from django.db.models import F, OuterRef, Subquery
from django.db.models.functions import Coalesce


def set_order_discount_token_and_created_at(apps, _schema_editor):
    OrderDiscount = apps.get_model("discount", "OrderDiscount")
    Order = apps.get_model("order", "Order")

    OrderDiscount.objects.filter(token__isnull=True).update(
        token=RandomUUID(),
        created_at=Coalesce(
            Subquery(
                Order.objects.filter(discounts=OuterRef("id")).values("created_at")[:1]
            ),
            datetime.datetime.now(tz=datetime.UTC),
        ),
    )


def set_order_discount_old_id(apps, schema_editor):
    OrderDiscount = apps.get_model("discount", "OrderDiscount")
    OrderDiscount.objects.all().update(old_id=F("id"))


class Migration(migrations.Migration):
    dependencies = [
        ("discount", "0040_orderdiscount_token_old_id_created_at"),
    ]

    operations = [
        CryptoExtension(),
        migrations.RunPython(
            set_order_discount_token_and_created_at,
            migrations.RunPython.noop,
        ),
        migrations.RunPython(
            set_order_discount_old_id, reverse_code=migrations.RunPython.noop
        ),
    ]
