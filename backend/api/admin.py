from django import forms
from django.contrib import admin
from django.utils.html import format_html
from .models import Category, MenuItem, BeanOrigin, PreOrder

admin.site.site_header = "Chillax Coffee Administration"
admin.site.site_title = "Chillax Coffee Admin"
admin.site.index_title = "Bisrate Gabriel Cafe Management Portal"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon', 'order')
    prepopulated_fields = {'slug': ('name',)}

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        try:
            from .telegram_bot import trigger_git_sync
            action = f"admin update category '{obj.name}'" if change else f"admin add category '{obj.name}'"
            trigger_git_sync(action)
        except Exception:
            pass

    def delete_model(self, request, obj):
        name = obj.name
        super().delete_model(request, obj)
        try:
            from .telegram_bot import trigger_git_sync
            trigger_git_sync(f"admin delete category '{name}'")
        except Exception:
            pass


class MenuItemAdminForm(forms.ModelForm):
    image_file = forms.FileField(
        required=False,
        label="Upload Image File (from device)",
        help_text="Upload a photo from your computer or phone (JPG, PNG, WebP). It will automatically be committed to GitHub and synced to the site.",
        widget=forms.FileInput(attrs={'accept': 'image/*'})
    )

    class Meta:
        model = MenuItem
        fields = '__all__'


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    form = MenuItemAdminForm
    list_display = ('image_thumbnail', 'name', 'category', 'price_etb', 'badge', 'is_available', 'is_featured')
    list_display_links = ('image_thumbnail', 'name')
    list_filter = ('category', 'is_available', 'is_featured')
    search_fields = ('name', 'description', 'tasting_notes')
    prepopulated_fields = {'item_id': ('name',)}
    actions = ['mark_in_stock', 'mark_sold_out']
    fieldsets = (
        ("Basic Information", {
            "fields": ("name", "item_id", "category", "price_etb", "is_available", "is_featured")
        }),
        ("Product Details", {
            "fields": ("badge", "description", "tasting_notes")
        }),
        ("Image & Media", {
            "fields": ("image_file", "image_url", "current_image_preview"),
            "description": "Upload a photo from your device, or enter a custom image path or URL."
        }),
    )
    readonly_fields = ('current_image_preview',)

    def current_image_preview(self, obj):
        if obj and obj.image_url:
            return format_html(
                '<div style="margin-top: 6px;">'
                '<img src="{}" style="max-height: 140px; max-width: 240px; border-radius: 8px; border: 1px solid #e5e7eb; object-fit: cover;" onerror="this.src=\'/Assets/chillax-inside.webp\'" />'
                '<p style="font-size: 11px; color: #6b7280; margin-top: 4px;">Current image: <code>{}</code></p>'
                '</div>',
                obj.image_url,
                obj.image_url
            )
        return "No image set yet"
    current_image_preview.short_description = "Image Preview"

    def image_thumbnail(self, obj):
        if obj and obj.image_url:
            return format_html(
                '<img src="{}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; border: 1px solid #e5e7eb;" onerror="this.src=\'/Assets/chillax-inside.webp\'" />',
                obj.image_url
            )
        return ""
    image_thumbnail.short_description = "Photo"

    def mark_in_stock(self, request, queryset):
        queryset.update(is_available=True)
        try:
            from .telegram_bot import trigger_git_sync
            trigger_git_sync("admin mark items in stock")
        except Exception:
            pass
        self.message_user(request, "Selected items marked as In-Stock.")
    mark_in_stock.short_description = "🟢 Mark selected items as In-Stock"

    def mark_sold_out(self, request, queryset):
        queryset.update(is_available=False)
        try:
            from .telegram_bot import trigger_git_sync
            trigger_git_sync("admin mark items sold out")
        except Exception:
            pass
        self.message_user(request, "Selected items marked as Sold-Out.")
    mark_sold_out.short_description = "⏸ Mark selected items as Sold-Out"

    def save_model(self, request, obj, form, change):
        uploaded_file = form.cleaned_data.get('image_file') or request.FILES.get('image_file')
        if uploaded_file:
            try:
                from .telegram_bot import handle_admin_uploaded_file
                hint = obj.item_id or obj.name or "item"
                photo_path = handle_admin_uploaded_file(uploaded_file, save_name_hint=hint)
                if photo_path:
                    obj.image_url = photo_path
            except Exception as e:
                self.message_user(request, f"Warning: Image upload had an error: {e}", level='WARNING')

        if not obj.image_url:
            obj.image_url = '/Assets/chillax-inside.webp'

        super().save_model(request, obj, form, change)
        try:
            from .telegram_bot import trigger_git_sync
            action = f"admin update item '{obj.name}'" if change else f"admin add item '{obj.name}'"
            trigger_git_sync(action, uploaded_photo_url=obj.image_url)
        except Exception:
            pass

    def delete_model(self, request, obj):
        name = obj.name
        super().delete_model(request, obj)
        try:
            from .telegram_bot import trigger_git_sync
            trigger_git_sync(f"admin delete item '{name}'")
        except Exception:
            pass


@admin.register(BeanOrigin)
class BeanOriginAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'altitude', 'process')
    search_fields = ('name', 'region', 'tasting_profile')


@admin.register(PreOrder)
class PreOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'pickup_time', 'total_display', 'channel', 'status_badge', 'created_at')
    list_filter = ('status', 'channel', 'created_at')
    search_fields = ('order_number', 'customer_name', 'order_notes')
    readonly_fields = ('order_number', 'created_at')
    actions = ['mark_brewing', 'mark_ready', 'mark_completed', 'mark_cancelled']

    def total_display(self, obj):
        return f"{float(obj.total_etb):,.0f} ETB"
    total_display.short_description = "Total"

    def status_badge(self, obj):
        colors = {
            'PENDING': '#f59e0b',
            'BREWING': '#3b82f6',
            'READY': '#10b981',
            'DELIVERY': '#8b5cf6',
            'COMPLETED': '#6b7280',
            'CANCELLED': '#ef4444',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-weight: 500; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"

    def mark_brewing(self, request, queryset):
        queryset.update(status='BREWING')
        self.message_user(request, "Selected orders marked as Preparing / Brewing.")
    mark_brewing.short_description = "☕ Mark as Preparing / Brewing"

    def mark_ready(self, request, queryset):
        queryset.update(status='READY')
        self.message_user(request, "Selected orders marked as Ready for Pickup.")
    mark_ready.short_description = "✅ Mark as Ready for Pickup"

    def mark_completed(self, request, queryset):
        queryset.update(status='COMPLETED')
        self.message_user(request, "Selected orders marked as Completed.")
    mark_completed.short_description = "🏁 Mark as Completed"

    def mark_cancelled(self, request, queryset):
        queryset.update(status='CANCELLED')
        self.message_user(request, "Selected orders marked as Cancelled.")
    mark_cancelled.short_description = "❌ Mark as Cancelled"
