# Generated by Django 1.11.5 on 2017-12-05 10:28

import django.contrib.postgres.indexes
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("product", "0039_merge_20171130_0727")]

    operations = [
        # nosemgrep: add-index-concurrently
        migrations.AddIndex(
            model_name="product",
            index=django.contrib.postgres.indexes.GinIndex(
                fields=["name", "description"], name="product_pro_name_5bb6fa_gin"
            ),
        )
    ]
