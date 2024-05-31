from django.http import HttpResponse
from django.shortcuts import render
from django.http import HttpRequest
import pandas as pd
from solar_energy.Datos_consumo_compactos import datos_consumo_compacto
from solar_energy.Rendimiento_sistema_FV_conectado_red import modelo_fotovoltaico
from solar_energy.Datos_comparativa import datos_comparativa
import json
import os

# Create your views here.
def inicio(request):
    return render(request, "solar_energy/Inicio.html")

def energia_fotovoltaica(request):
    return render(request, "solar_energy/Fotovoltaica.html")

def calculadora_amortizacion(request):

    if request.method == 'POST':

        datos_consumo = request.FILES['file']
        
        df1 = pd.read_csv(datos_consumo, header=0, sep=';', encoding='utf-8')
        df=df1.rename(columns={'FECHA-HORA':'FECHA_HORA', 'CONSUMO Wh':'CONSUMO_Wh'})
        comparativa = df1.copy()
        
        datos_json = df[0:20].to_json(orient='records')

        dic_var = {
            'name': request.POST['name_instalacion'],
            'latitud': request.POST['latitud'],
            'longitud': request.POST['longitud'],
            'N_placas': request.POST['placas_cadena'],
            'Coste': request.POST['coste_sistema'],
            'Subvencion': request.POST['subvencion_sistema']
        }
       

        datos_radiacion, datos_produccion = modelo_fotovoltaico(float(dic_var['latitud']), float(dic_var['longitud']), dic_var['name'], float(dic_var['N_placas']))
       
        datos_precio_luz = pd.read_csv('solar_energy/Precio_luz_2023.csv', sep=';', header=0, encoding='utf-8')
        
        consumo_compacto, consumo_mes = datos_consumo_compacto(df1, datos_radiacion, datos_produccion, datos_precio_luz)
        consumo_compacto_json = consumo_compacto.to_json(orient='records')
        consumo_mes_json = consumo_mes.to_json(orient='records')
        
        datos_tabla = consumo_compacto.to_dict(orient='records')
        pd.options.display.width = 500

        dic_totales = {
            'total_consumo': (consumo_compacto['CONSUMO_Wh'].sum()).round(2),
            'total_producción': (consumo_compacto['Produccion'].sum()).round(2), 
            'total_gasto_sin_placas': (consumo_compacto['Gasto_sin_placas'].sum()).round(2),
            'total_ahorro': (consumo_compacto['Ahorro_con_placas'].sum()).round(2),
            'total_gasto_con_placas': (consumo_compacto['Gasto_con_placas'].sum()).round(2),
            'precio_medio_luz': (datos_precio_luz['value'].mean()/1000).round(2),
            'precio_medio_energia_excedente': (datos_precio_luz['Precio_energia_excedentaria'].mean()/1000).round(2)
        }

        dic_totales['Amortizacion']=((float(dic_var['Coste'])-float(dic_var['Subvencion']))/dic_totales['total_ahorro']).round(2)
        dic_totales['Beneficio']=((25-dic_totales['Amortizacion'])*dic_totales['total_ahorro']).round(2)

        dic_totales['Amortizacion_IVA']=((float(dic_var['Coste'])-float(dic_var['Subvencion']))/(dic_totales['total_ahorro']*1.21)).round(2)
        dic_totales['Beneficio_IVA'] = ((25-dic_totales['Amortizacion_IVA'])*(dic_totales['total_ahorro']*1.21)).round(2)
        
        
        data_comparativa = datos_comparativa(float(dic_var['latitud']), float(dic_var['longitud']), dic_var['name'], comparativa, datos_precio_luz,
                                             float(request.POST['placas_cadena']), float(request.POST['coste_sistema']), float(request.POST['subvencion_sistema']),
                                             float(request.POST['placas_cadena1']), float(request.POST['coste_sistema1']), float(request.POST['subvencion_sistema1']),
                                             float(request.POST['placas_cadena2']), float(request.POST['coste_sistema2']), float(request.POST['subvencion_sistema2']),
                                             float(request.POST['placas_cadena3']), float(request.POST['coste_sistema3']), float(request.POST['subvencion_sistema3']))
        data_comparativa_json = data_comparativa.to_json(orient='records')
        
        casos={'caso0': float(request.POST['placas_cadena']),
               'caso1': float(request.POST['placas_cadena1']),
               'caso2': float(request.POST['placas_cadena2']),
               'caso3': float(request.POST['placas_cadena3']),
               }
        
        json_casos = json.dumps(casos)

        return resultados(request, {'contexto1': dic_var, 'contexto2': datos_tabla, "contexto3": dic_totales , "contexto4": consumo_compacto_json, 'contexto5':consumo_mes_json, 'contexto6':data_comparativa_json, 'contexto7':json_casos})

    return render(request, "solar_energy/Calculadora.html") 


def resultados(request, diccionario_variables):
    context = diccionario_variables
    return render(request, "solar_energy/Resultados Amortización.html", context)


def descargar_csv(request):
    # Ruta al archivo CSV
    ruta_archivo = 'solar_energy/Ejemplo Datos Consumo.csv'  # Reemplaza con la ruta real de tu archivo CSV
    
    # Verificar si el archivo existe
    if os.path.exists(ruta_archivo):
        with open(ruta_archivo, 'rb') as archivo:
            response = HttpResponse(archivo.read(), content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="datos_consumo.csv"'
            return response
    else:
        return HttpResponse("El archivo CSV no se encontró.", status=404)
    
