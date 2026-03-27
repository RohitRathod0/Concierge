from src.api.routes.notifications import router
from src.services.notification_templates import TEMPLATE_REGISTRY, flash_sale, ipo_fomo

print("Router OK:", router.prefix)
print("Templates:", list(TEMPLATE_REGISTRY.keys()))
t = flash_sale(48, 199, 49, 2341)
print("Flash sale:", t['title'])
t2 = ipo_fomo("Ola Electric", 42.5, 36, 52000)
print("IPO FOMO:", t2['title'])
