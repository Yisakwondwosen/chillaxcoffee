from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_root, name='api_root'),
    path('categories/', views.get_categories, name='api_categories'),
    path('menu/', views.get_menu, name='api_menu'),
    path('status/', views.get_lounge_status, name='api_lounge_status'),
    path('orders/', views.create_preorder, name='api_create_preorder'),
    path('preorder/', views.create_preorder, name='api_create_preorder_alias'),
    path('telegram/webhook/', views.telegram_webhook, name='api_telegram_webhook'),
]
