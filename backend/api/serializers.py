from rest_framework import serializers
from .models import Category, MenuItem, BeanOrigin, PreOrder

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'slug', 'name', 'icon', 'order']


class MenuItemSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id',
            'item_id',
            'category_slug',
            'category_name',
            'name',
            'price_etb',
            'badge',
            'description',
            'tasting_notes',
            'image_url',
            'is_available',
            'is_featured',
        ]


class BeanOriginSerializer(serializers.ModelSerializer):
    class Meta:
        model = BeanOrigin
        fields = '__all__'


class PreOrderSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = PreOrder
        fields = [
            'id',
            'order_number',
            'customer_name',
            'pickup_time',
            'order_notes',
            'total_etb',
            'channel',
            'status',
            'items_json',
            'created_at',
        ]
