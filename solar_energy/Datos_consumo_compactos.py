import pandas as pd

def datos_consumo_compacto(df):
    
    df.drop(['CUPS','INV / VER', 'GENERACION Wh', 'REACT Q1', 'REACT Q2', 'REACT Q3', 'REACT Q4', 'METODO OBT.',
        'FIRMEZA', 'NUM FACTURA'], axis=1, inplace=True)

    datos_fecha_split=df['FECHA-HORA'].str.split('/')

    dia =[]
    mes =[]
    año_hora =[]

    for i in datos_fecha_split:
        dia.append(i[0])
        mes.append(i[1])
        año_hora.append(i[2])

    df['Día'] = dia
    df['Mes'] = mes
    df['Año-hora'] = año_hora

    df_final = df.reindex(['FECHA-HORA', 'Día', 'Mes', 'Año-hora', 'CONSUMO Wh'], axis=1)

    df_consumo=df_final.groupby('Mes').sum('Consummo Wh')
    df_consumo.reset_index(inplace=True)
    df_consumo

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

    return df_consumo