import uuid
from django.db import models

class Category(models.Model):
    slug = models.SlugField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, default='coffee')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    item_id = models.SlugField(max_length=80, unique=True, help_text="Unique slug identifier (e.g. macchiato)")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=150)
    price_etb = models.DecimalField(max_digits=8, decimal_places=2, help_text="Price in Ethiopian Birr (ETB)")
    badge = models.CharField(max_length=60, blank=True, help_text="e.g. Bisrate Gabriel Favorite, Heritage, Made to Order")
    description = models.TextField()
    tasting_notes = models.CharField(max_length=200, help_text="e.g. Dark Chocolate • Honey Crema • Hazelnut")
    image_url = models.CharField(
        max_length=500,
        blank=True,
        default='/Assets/chillax-inside.webp',
        help_text="Image URL or uploaded path (e.g. /uploads/... or /Assets/...)"
    )
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category__order', '-is_featured', 'name']

    def __str__(self):
        return f"{self.name} ({self.price_etb} ETB)"


class BeanOrigin(models.Model):
    name = models.CharField(max_length=120)
    region = models.CharField(max_length=120, help_text="e.g. Southern Highlands, Oromia")
    altitude = models.CharField(max_length=80, help_text="e.g. 1,900m – 2,200m")
    process = models.CharField(max_length=100, help_text="e.g. Washed / African Raised Beds")
    tasting_profile = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return f"{self.name} ({self.region})"


class PreOrder(models.Model):
    CHANNEL_CHOICES = [
        ('TELEGRAM', 'Telegram'),
        ('WHATSAPP', 'WhatsApp'),
        ('WEB', 'Web Direct'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending Confirmation'),
        ('BREWING', 'Brewing / Preparing'),
        ('READY', 'Ready for Pickup'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    order_number = models.CharField(max_length=32, unique=True, editable=False)
    customer_name = models.CharField(max_length=100)
    pickup_time = models.CharField(max_length=80)
    order_notes = models.TextField(blank=True, null=True)
    total_etb = models.DecimalField(max_digits=10, decimal_places=2)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='TELEGRAM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    items_json = models.JSONField(help_text="Ordered items breakdown with quantities and prices")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"CHX-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.order_number} - {self.customer_name} ({self.total_etb} ETB)"
