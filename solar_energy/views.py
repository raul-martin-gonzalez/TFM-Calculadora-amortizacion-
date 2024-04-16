from django.http import HttpResponse
from django.shortcuts import render
from django.http import HttpRequest
import pandas as pd
from solar_energy.Datos_consumo_compactos import datos_consumo_compacto

# Create your views here.
def inicio(request):
    return render(request, "solar_energy/Inicio.html")

def energia_fotovoltaica(request):
    return render(request, "solar_energy/Fotovoltaica.html")

def precio_luz(request):
    return render(request, "solar_energy/Precio_luz.html")

def calculadora_amortizacion(request):

    if request.method == 'POST':
        # name = request.POST['name_instalacion']
        # altitud = request.POST['altitud']
        # longitud = request.POST['longitud']
        datos_consumo = request.FILES['file']
        
        df1 = pd.read_csv(datos_consumo, header=0, sep=';', encoding='utf-8')
        df=df1.rename(columns={'FECHA-HORA':'FECHA_HORA', 'CONSUMO Wh':'CONSUMO_Wh'})
        print(df.columns)
        datos = df[0:20].to_dict(orient='records')
        datos_json = df[0:20].to_json(orient='records')
        dic_var = {
            'name': request.POST['name_instalacion'],
            'altitud': request.POST['altitud'],
            'longitud': request.POST['longitud'],
            'dato_django': "Dato obtenido a través de django"
        }
        consumo_compacto = (datos_consumo_compacto(df1))
        
        #print(type(altitud))
        #return HttpResponse(altitud)
        return resultados(request, {'contexto1': dic_var, 'contexto2': datos, "contexto3": datos_json, "contexto4":consumo_compacto})

    return render(request, "solar_energy/Calculadora.html") 

def conceptos_teoricos(request):
    return render(request, "solar_energy/Conceptos teóricos.html")

def resultados(request, diccionario_variables):
    context = diccionario_variables
    return render(request, "solar_energy/Resultados Amortización.html", context)