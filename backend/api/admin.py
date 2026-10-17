from django.contrib import admin
from .models import Category, MenuItem, BeanOrigin, PreOrder

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon', 'order')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price_etb', 'badge', 'is_available', 'is_featured')
    list_filter = ('category', 'is_available', 'is_featured')
    search_fields = ('name', 'description', 'tasting_notes')
    prepopulated_fields = {'item_id': ('name',)}


@admin.register(BeanOrigin)
class BeanOriginAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'altitude', 'process')
    search_fields = ('name', 'region', 'tasting_profile')


@admin.register(PreOrder)
class PreOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'pickup_time', 'total_etb', 'channel', 'status', 'created_at')
    list_filter = ('channel', 'status', 'created_at')
    search_fields = ('order_number', 'customer_name', 'order_notes')
    readonly_fields = ('order_number', 'created_at')
