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
    datos_energia = pd.DataFrame()
    datos_energia['energía'] = (energia_generada/1000).round(2)
    #print(datos_producción_beneficio.head(20))
    # energia_generada[:720].plot(figsize=(12,8))
    # plt.show()

    return energia_generada

    

def datos_comparativa(latitude, longitude, name, dt_consumo, precio_luz, 
                      placas0, coste0, subvencion0, placas1, coste1, subvencion1,
                      placas2, coste2, subvencion2, placas3, coste3, subvencion3):
    
    placas = [placas0, placas1, placas2, placas3]
    coste = [coste0, coste1, coste2, coste3]
    subvencion = [subvencion0, subvencion1, subvencion2, subvencion3]
    # coste_inicial = [subv - cost for subv, cost in zip(subvencion, coste)]
    datos_ahorro = pd.DataFrame()
    datos_ahorro['Años']=list(range(0,26,1))

    for j in range(len(placas)):
        df_datos = pd.DataFrame()
        df_datos['FECHA-HORA']=dt_consumo['FECHA-HORA']
        datos_fecha_split=df_datos['FECHA-HORA'].str.split('/')
        mes =[]
        for i in datos_fecha_split:
            mes.append(i[1])
        df_datos['Mes'] = mes
        df_datos['CONSUMO_Wh']=dt_consumo['CONSUMO Wh']/1000
        df_datos['Precio_luz']=precio_luz['value']/1000
        df_datos['Precio_excedente']=precio_luz['Precio_energia_excedentaria']/1000
        
        # print(name)
        # print(latitude)
        # print(longitude)
        # print(placas[j])
        df_datos['Produccion'] = list(modelo_fotovoltaico(latitude, longitude, name, placas[j]))
        df_datos['Produccion'] = df_datos['Produccion']/1000
        df_datos['Gasto_sin_placas'] = df_datos['Precio_luz']*df_datos['CONSUMO_Wh']
        df_datos['Diferencia'] = df_datos['CONSUMO_Wh']-df_datos['Produccion']
        
        Gasto_red =[]
        Energia_excedentaria = []
        #Calculos de gasto y ahorro con placas.
        for x in df_datos['Diferencia']:
            if x > 0:
                Gasto_red.append(x)
                Energia_excedentaria.append(0)
            else:
                Gasto_red.append(0)
                Energia_excedentaria.append(-x)
        
        df_datos['Gasto_red'] = Gasto_red
        df_datos['Energia_excedentaria'] = Energia_excedentaria
        df_datos['Autoproduccion_directa'] = df_datos['Produccion']-df_datos['Energia_excedentaria']

        df_datos['Ahorro_con_placas'] = df_datos['Precio_luz']*df_datos['Autoproduccion_directa']+df_datos['Energia_excedentaria']*df_datos['Precio_excedente']
        df_datos['Gasto_con_placas'] = df_datos['Gasto_red']*df_datos['Precio_luz']-df_datos['Energia_excedentaria']*df_datos['Precio_excedente']
        # pd.options.display.max_columns=20
        # pd.options.display.max_colwidth=200

        df_ahorro = df_datos.groupby('Mes')[['CONSUMO_Wh', 'Produccion', 'Gasto_sin_placas', 'Ahorro_con_placas', 'Gasto_con_placas']].sum('CONSUMO Wh').round(2)
        df_ahorro.reset_index(inplace=True)
        def ajustar_fila(row):
            if row['Ahorro_con_placas'] > row['Gasto_sin_placas']:
                row['Ahorro_con_placas'] = row['Gasto_sin_placas']
                row['Gasto_con_placas'] = 0
            return row

        df_ahorro = df_ahorro.apply(ajustar_fila, axis=1)
        ahorro = df_ahorro['Ahorro_con_placas'].sum().round(2)

        ahorro_vida_util=[]

        for año in datos_ahorro['Años']:
            ahorro_vida_util.append((subvencion[j]-coste[j]) + ahorro * año)
        nombre_variable = f'placas_caso{j}'
        datos_ahorro[nombre_variable] = ahorro_vida_util

    print(datos_ahorro)
    return datos_ahorro



    