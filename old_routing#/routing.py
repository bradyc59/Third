from django.conf.urls import url

from Simmonopoly.consumers import MonopolyConsumer

websocket_urlpatterns = [
    url(r'^ws/game/(?P<room_code>\w+)/$', MonopolyConsumer.as_asgi()),
    url(r'^ws/join/$', MonopolyConsumer.as_asgi())
]