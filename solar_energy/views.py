from django.http import HttpResponse
from django.shortcuts import render
from django.http import HttpRequest
import pandas as pd
from solar_energy.Datos_consumo_compactos import datos_consumo_compacto
from solar_energy.Rendimiento_sistema_FV_conectado_red import modelo_fotovoltaico

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
        print(df1.columns)
        #datos = df[0:20].to_dict(orient='records')
        
        datos_json = df[0:20].to_json(orient='records')

        dic_var = {
            'name': request.POST['name_instalacion'],
            'latitud': request.POST['latitud'],
            'longitud': request.POST['longitud'],
            'N_placas': request.POST['placas_cadena'],
            'N_cadenas': request.POST['cadenas_paralelo'],
            'Coste': request.POST['coste_sistema'],
            # 'dato_django': "Dato obtenido a través de django"
        }

                
        datos_radiacion, datos_produccion = modelo_fotovoltaico(float(dic_var['latitud']), float(dic_var['longitud']), dic_var['name'], float(dic_var['N_placas']), float(dic_var['N_cadenas']))
        # print(list(datos_produccion.head(20)))
        # print(len(datos_radiacion))
        # print(len(datos_produccion))

        datos_precio_luz = pd.read_csv('solar_energy/Precio_luz_2023.csv', sep=';', header=0, encoding='utf-8')
        print(datos_precio_luz)

        consumo_compacto, consumo_mes = datos_consumo_compacto(df1, datos_radiacion, datos_produccion, datos_precio_luz)
        consumo_compacto_json = consumo_compacto.to_json(orient='records')
        consumo_mes_json = consumo_mes.to_json(orient='records')
        datos_tabla = consumo_compacto.to_dict(orient='records')
        print(consumo_mes.head(20))
        print(consumo_compacto.head(20))

        dic_totales = {
            'total_consumo': (consumo_compacto['CONSUMO_Wh'].sum()).round(2),
            'total_producción': (consumo_compacto['Produccion'].sum()).round(2), 
            'total_gasto_sin_placas': (consumo_compacto['Gasto_sin_placas'].sum()).round(2),
            'total_ahorro': (consumo_compacto['Ahorro_con_placas'].sum()).round(2),
            'total_gasto_con_placas': (consumo_compacto['Gasto_con_placas'].sum()).round(2),
        }

        dic_totales['Amortizacion']=(float(dic_var['Coste'])/dic_totales['total_ahorro']).round(2)
        dic_totales['Beneficio']=((25-dic_totales['Amortizacion'])*dic_totales['total_ahorro']).round(2)

        dic_totales['Amortizacion_IVA']=(float(dic_var['Coste'])/(dic_totales['total_ahorro']*1.21)).round(2)
        dic_totales['Beneficio_IVA'] = ((25-dic_totales['Amortizacion_IVA'])*(dic_totales['total_ahorro']*1.21)).round(2)
        print(dic_totales)
        # print(consumo_compacto)

        #print(type(altitud))
        #return HttpResponse(altitud)


        return resultados(request, {'contexto1': dic_var, 'contexto2': datos_tabla, "contexto3": dic_totales , "contexto4": consumo_compacto_json, 'contexto5':consumo_mes_json})

    return render(request, "solar_energy/Calculadora.html") 

def conceptos_teoricos(request):
    return render(request, "solar_energy/Conceptos teóricos.html")

def resultados(request, diccionario_variables):
    context = diccionario_variables
    return render(request, "solar_energy/Resultados Amortización.html", context)