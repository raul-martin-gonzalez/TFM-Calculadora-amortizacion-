from django.urls import path
from . import views

urlpatterns = [
    path('', views.inicio, name="Inicio"),
    path('energia_fotovoltaica', views.energia_fotovoltaica, name="Energia_fotovoltaica"),   
    path('calculadora_amortizacion', views.calculadora_amortizacion, name="Calculadora"),  
    path('resultados_amortizacon', views.resultados, name='Resultados_Amortizacion'),
    path('descargar_csv', views.descargar_csv, name='descargar_csv'),
]

