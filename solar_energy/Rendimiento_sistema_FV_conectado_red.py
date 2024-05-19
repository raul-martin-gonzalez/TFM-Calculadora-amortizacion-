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

    # print(data.head(20))

    data[['poa_direct', 'poa_diffuse', 'poa_global']][3000:3072].plot(figsize=(12,6))
    # plt.show()

    data_radiacion = data[['poa_direct', 'poa_diffuse', 'poa_global']]

    location = Location(latitude=latitud, longitude=longitud, name=nombre)

    sandia_modules = pvlib.pvsystem.retrieve_sam('SandiaMod')
    cec_inverters = pvlib.pvsystem.retrieve_sam('CECInverter')
    # print(cec_inverters.columns)
    # print(cec_inverters.columns)
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
    # print(energia_generada.head(20))
    #energia_generada[:720].plot(figsize=(12,8))
    # plt.show()

    return data_radiacion, energia_generada

