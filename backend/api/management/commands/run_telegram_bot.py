from django.core.management.base import BaseCommand
from api.telegram_bot import run_telegram_bot_polling, get_bot_token

class Command(BaseCommand):
    help = "Starts the Chillax Coffee Telegram Bot listener for order management and menu updates"

    def handle(self, *args, **options):
        token = get_bot_token()
        if not token:
            self.stdout.write(self.style.ERROR(
                "❌ TELEGRAM_BOT_TOKEN is not configured!\n"
                "Please set TELEGRAM_BOT_TOKEN in your environment or backend/.env file."
            ))
            return

        self.stdout.write(self.style.SUCCESS("🚀 Starting Chillax Coffee Telegram Bot daemon..."))
        run_telegram_bot_polling()
