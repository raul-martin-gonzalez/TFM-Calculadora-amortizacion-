# base image esto installa la versión de Python para dentro de la imagne Docker. 
# También es la versión de Python que correrá la aplicación en el contenedor.

FROM python:3.11  
# setup environment variable
 
# where your code lives  
WORKDIR /app

# install dependencies. Actualiza la versión de pip que se utilizará para instalar las dependencias.
RUN pip install --upgrade pip  

# copy whole project to your docker home directory. 
COPY . /app/  

# run this command to install all dependencies  
RUN pip install -r requirements.txt  

# port where the Django app runs. 
# Esta instrucción es para indicar que la aplicación está corriedo en el puerto 8000
EXPOSE 8000  

# start server  
CMD ["python", "manage.py", "runserver"]