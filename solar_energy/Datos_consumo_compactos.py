import pandas as pd

def datos_consumo_compacto(df, radiacion, produccion, precio):
    
    df.drop(['CUPS','INV / VER', 'GENERACION Wh', 'REACT Q1', 'REACT Q2', 'REACT Q3', 'REACT Q4', 'METODO OBT.',
        'FIRMEZA', 'NUM FACTURA'], axis=1, inplace=True)

    datos_fecha_split=df['FECHA-HORA'].str.split('/')

    dia =[]
    mes =[]
    año = []
    hora =[]
    fechas = []
    for i in datos_fecha_split:
        dia.append(i[0])
        mes.append(i[1])
        x = i[2].split(' ')
        año.append(x[0])
        hora.append(x[1])
        fecha = x[0] + '-' + i[1] + '-' + i[0]
        fechas.append(fecha)

    df['Fecha'] = fechas
    df['Día'] = dia
    df['Mes'] = mes
    df['Año'] = año
    df['Hora'] = hora
    df['Precio_luz'] = precio['value']/1000
    df['Precio_excedente'] = precio['Precio_energia_excedentaria']/1000

    df_final = df.reindex(['FECHA-HORA', 'Día', 'Mes', 'Año', 'Fecha', 'Hora', 'CONSUMO Wh', 'Precio_luz', 'Precio_excedente'], axis=1)
    #print(df_final.head(30))
    #df_final.drop('FECHA-HORA', axis=1, inplace=True)
   
    df_consumo_mes = df_final.rename(columns={'FECHA-HORA': 'FECHA_HORA', 'CONSUMO Wh':'CONSUMO_Wh'})
    
    df_consumo_mes['CONSUMO_Wh'] = df_consumo_mes['CONSUMO_Wh']/1000
    df_consumo_mes['poa_direct'] = list(radiacion['poa_direct']/1000)
    df_consumo_mes['poa_diffuse'] = list(radiacion['poa_diffuse']/1000)
    df_consumo_mes['poa_global'] = list(radiacion['poa_global']/1000)
    df_consumo_mes['Produccion'] = list(produccion/1000)
    df_consumo_mes['Gasto_sin_placas'] = df_consumo_mes['Precio_luz']*df_consumo_mes['CONSUMO_Wh']
    df_consumo_mes['Diferencia'] = df_consumo_mes['CONSUMO_Wh']-df_consumo_mes['Produccion']
    
    Gasto_red =[]
    Energia_excedentaria = []
    #Calculos de gasto y ahorro con placas.
    for x in df_consumo_mes['Diferencia']:
        if x > 0:
            Gasto_red.append(x)
            Energia_excedentaria.append(0)
        else:
            Gasto_red.append(0)
            Energia_excedentaria.append(-x)

    # https://es.support.somenergia.coop/article/784-como-funciona-la-compensacion-simplificada-de-excedentes

    df_consumo_mes['Gasto_red'] = Gasto_red
    df_consumo_mes['Energia_excedentaria'] = Energia_excedentaria
    df_consumo_mes['Autoproduccion_directa'] = df_consumo_mes['Produccion']-df_consumo_mes['Energia_excedentaria']

    df_consumo_mes['Ahorro_con_placas'] = df_consumo_mes['Precio_luz']*df_consumo_mes['Autoproduccion_directa']+df_consumo_mes['Energia_excedentaria']*df_consumo_mes['Precio_excedente']
    df_consumo_mes['Gasto_con_placas'] = df_consumo_mes['Gasto_red']*df_consumo_mes['Precio_luz']-df_consumo_mes['Energia_excedentaria']*df_consumo_mes['Precio_excedente']


    df_consumo = df_consumo_mes.groupby('Mes')[['CONSUMO_Wh', 'Produccion', 'Gasto_sin_placas', 'Ahorro_con_placas', 'Gasto_con_placas', 'poa_direct', 'poa_diffuse', 'poa_global']].sum('CONSUMO Wh').round(2)
    df_consumo['Precio_medio_luz'] = df_consumo_mes.groupby('Mes')['Precio_luz'].mean().round(2)
    
    df_consumo.reset_index(inplace=True)

    df_consumo['Mes'][df_consumo['Mes']=='01']='Enero'
    df_consumo['Mes'][df_consumo['Mes']=='02']='Febrero'
    df_consumo['Mes'][df_consumo['Mes']=='03']='Marzo'
    df_consumo['Mes'][df_consumo['Mes']=='04']='Abril'
    df_consumo['Mes'][df_consumo['Mes']=='05']='Mayo'
    df_consumo['Mes'][df_consumo['Mes']=='06']='Junio'
    df_consumo['Mes'][df_consumo['Mes']=='07']='Julio'
    df_consumo['Mes'][df_consumo['Mes']=='08']='Agosto'
    df_consumo['Mes'][df_consumo['Mes']=='09']='Septiembre'
    df_consumo['Mes'][df_consumo['Mes']=='10']='Octubre'
    df_consumo['Mes'][df_consumo['Mes']=='11']='Noviembre'
    df_consumo['Mes'][df_consumo['Mes']=='12']='Diciembre'

    # Ajustar los valores de 'Ahorro_con_placas' y 'Gasto_con_placas'
    def ajustar_fila(row):
        if row['Ahorro_con_placas'] > row['Gasto_sin_placas']:
            row['Ahorro_con_placas'] = row['Gasto_sin_placas']
            row['Gasto_con_placas'] = 0
        return row

    df_consumo = df_consumo.apply(ajustar_fila, axis=1)

    df_consumo_compacto = df_consumo
    


    return df_consumo_compacto, df_consumo_mes

