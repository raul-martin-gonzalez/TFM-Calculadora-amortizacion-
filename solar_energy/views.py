from django.http import HttpResponse
from django.shortcuts import render
from django.http import HttpRequest

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
        dic_var = {
            'name': request.POST['name_instalacion'],
            'altitud': request.POST['altitud'],
            'longitud' : request.POST['longitud']
        }
        #print(type(altitud))
        #return HttpResponse(altitud)
        return resultados(request, dic_var)

    return render(request, "solar_energy/Calculadora.html") 

def conceptos_teoricos(request):
    return render(request, "solar_energy/Conceptos teóricos.html")

def resultados(request, diccionario_variables):
    context = diccionario_variables
    return render(request, "solar_energy/Resultados Amortización.html", context)