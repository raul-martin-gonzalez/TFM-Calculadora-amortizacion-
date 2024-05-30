import pandas as pd
import pvlib
import json


from pvlib.modelchain import ModelChain
from pvlib.location import Location
from pvlib.pvsystem import PVSystem
from pvlib.temperature import TEMPERATURE_MODEL_PARAMETERS

import matplotlib.pyplot as plt

# latitud = 40.535445
# longitud = -3.616536
# nombre='Campus Alcobendas Universidad Europea'

df_precio_luz = pd.read_csv('solar_energy/Precio_luz_2023.csv', sep=';', header=0, encoding='utf-8')
precio_luz = df_precio_luz['value']
precio_energia_excedente=df_precio_luz['Precio_energia_excedentaria']
print(precio_luz)

def modelo_fotovoltaico(latitud, longitud, nombre, placas):
    data, meta, inputs = pvlib.iotools.get_pvgis_hourly(
        latitude=latitud, longitude=longitud, start=2005, end=2005, raddatabase='PVGIS-ERA5', components=True, 
        surface_tilt=30, surface_azimuth=180, outputformat='json', usehorizon=True, userhorizon=None,
        pvcalculation=False, peakpower=None, pvtechchoice='crystSi', mountingplace='free', loss=0, trackingtype=0, 
        optimal_surface_tilt=False, optimalangles=False, url='https://re.jrc.ec.europa.eu/api/', map_variables=True, 
        timeout=30
    ) 

    data['poa_diffuse']=data['poa_sky_diffuse']+data['poa_ground_diffuse']
    data['poa_global']=data['poa_diffuse']+data['poa_direct']

    #print(data.head(20))

    # data[['poa_direct', 'poa_diffuse', 'poa_global']][3000:3072].plot(figsize=(12,6))
    # plt.show()

    data_radiacion = data[['poa_direct', 'poa_diffuse', 'poa_global']]

    location = Location(latitude=latitud, longitude=longitud, name=nombre)

    sandia_modules = pvlib.pvsystem.retrieve_sam('SandiaMod')
    cec_inverters = pvlib.pvsystem.retrieve_sam('CECInverter')
    #print(cec_inverters.columns)
    #print(cec_inverters.columns)
    module = sandia_modules['Canadian_Solar_CS6X_300M__2013_']
    inverter = cec_inverters['ABB__PVI_10_0_I_OUTD_x_US_480_y_z__480V_']

    # print(module)
    # print(inverter)

    temperature_parameters = TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']

    system = PVSystem(surface_tilt=30, surface_azimuth=180,
                    module_parameters=module, inverter_parameters=inverter,
                    temperature_model_parameters=temperature_parameters, modules_per_string=placas, strings_per_inverter=1)

    modelchain = ModelChain(system, location)

    modelo_real_data = modelchain.run_model_from_poa(data)
    energia_generada = modelo_real_data.results.ac.fillna(0)
    datos_producción_beneficio = pd.DataFrame()
    datos_producción_beneficio['energía'] = energia_generada.round(2)
    datos_producción_beneficio['precio'] = precio_luz
    datos_producción_beneficio['ahorro'] = (datos_producción_beneficio['energía']*datos_producción_beneficio['precio']/1000000).round(2)
    #print(datos_producción_beneficio.head(20))
    ahorro_anual = datos_producción_beneficio['ahorro'].sum().round(2)
    # energia_generada[:720].plot(figsize=(12,8))
    # plt.show()

    return datos_producción_beneficio['energía']
    

def datos_comparativa(latitude, longitude, name, coste, subvencion, consumo):
    print('seguro1')
    print(consumo.head())
    print('hola')
    # # consumo.drop(['CUPS','INV / VER', 'GENERACION Wh', 'REACT Q1', 'REACT Q2', 'REACT Q3', 'REACT Q4', 'METODO OBT.',
    # #     'FIRMEZA', 'NUM FACTURA'], axis=1, inplace=True)

    # datos_fecha_split=consumo['FECHA-HORA'].str.split('/')

    # dia =[]
    # mes =[]
    # año = []
    # hora =[]
    # fechas = []
    # for i in datos_fecha_split:
    #     dia.append(i[0])
    #     mes.append(i[1])
    #     x = i[2].split(' ')
    #     año.append(x[0])
    #     hora.append(x[1])
    #     fecha = x[0] + '-' + i[1] + '-' + i[0]
    #     fechas.append(fecha)

    # consumo['Fecha'] = fechas
    # consumo['Día'] = dia
    # consumo['Mes'] = mes
    # consumo['Año'] = año
    # consumo['Hora'] = hora
    df=consumo.rename(columns={'CONSUMO Wh':'CONSUMO_Wh'})
    df_1=pd.DataFrame()
    df_1['Mes'] = df['Mes']
    df_1['CONSUMO_Wh']=df['CONSUMO_Wh']
    
    df_1['precio_luz']=precio_luz
    df_1['precio_energia_excedente']=precio_energia_excedente
    df_1['Gasto_sin_placas']=df_1['CONSUMO_Wh']*df_1['precio_luz']
    placas = [1,2,3,4,8,12,16,20,25,35]
    diccionario_comparativa = {}
    diccionario_comparativa['años'] = list(range(0,26,1))
    años = list(range(1,26,1))

    for i in placas:
        ahorro_vida_util = []
        coste_inicial = -coste + subvencion 
        ahorro_vida_util.append(coste_inicial)
        df_1['energia_producida']= modelo_fotovoltaico(latitude, longitude, name, i)
        df_1['Diferencia']=df_1['CONSUMO_Wh']-df_1['energia_producida']

        Gasto_red =[]
        Energia_excedentaria = []
        for x in df_1['Diferencia']:
            if x > 0:
                Gasto_red.append(x)
                Energia_excedentaria.append(0)
            else:
                Gasto_red.append(0)
                Energia_excedentaria.append(-x)
        
        df_1['Gasto_red'] = Gasto_red
        df_1['Energia_excedentaria'] = Energia_excedentaria
        df_1['Autoproduccion_directa'] = df_1['energia_producida']-df_1['Energia_excedentaria']

        df_1['Ahorro_con_placas'] = df_1['precio_luz']*df_1['Autoproduccion_directa']+df_1['Energia_excedentaria']*df_1['precio_energia_excedente']
        df_1['Gasto_con_placas'] = df_1['Gasto_red']*df_1['precio_luz']-df_1['Energia_excedentaria']*df_1['precio_energia_excedente']

        df_consumo = df_1.groupby('Mes')[['CONSUMO_Wh', 'energia_producida', 'Gasto_sin_placas', 'Ahorro_con_placas', 'Gasto_con_placas']].sum('CONSUMO Wh').round(2)

        # Ajustar los valores de 'Ahorro_con_placas' y 'Gasto_con_placas'
        def ajustar_fila(row):
            if row['Ahorro_con_placas'] > row['Gasto_sin_placas']:
                row['Ahorro_con_placas'] = row['Gasto_sin_placas']
                row['Gasto_con_placas'] = 0
            return row
        
        df_consumo = df_consumo.apply(ajustar_fila, axis=1)
        ahorro = df_consumo['Ahorro_con_placas'].sum().round(2)

        for año in años:
            ahorro_vida_util.append(coste_inicial + ahorro * año)
        nombre_variable = f'placas_{i}'
        diccionario_comparativa[nombre_variable] = ahorro_vida_util
    return diccionario_comparativa
    

#datos_comparativa(40, 10, 'raul', 20, 10, pd.read_csv(r'C:\Users\raulm\Desktop\MASTER\TFM/Datos_consumo_casa_2.csv', sep=';', header=0, encoding='utf-8'))