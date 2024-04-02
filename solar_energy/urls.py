from django.urls import path
from . import views

urlpatterns = [
    path('', views.inicio, name="Inicio"),
    path('energia_fotovoltaica', views.energia_fotovoltaica, name="Energia_fotovoltaica"),
    path('precio_luz', views.precio_luz, name="Precio_luz"),
    path('calculadora_amortizacion', views.calculadora_amortizacion, name="Calculadora"),
    path('conceptos_teoricos', views.conceptos_teoricos, name="Conceptos_teoricos"),
    path('resultados_amortizacon', views.resultados, name='Resultados_Amortizacion')
]