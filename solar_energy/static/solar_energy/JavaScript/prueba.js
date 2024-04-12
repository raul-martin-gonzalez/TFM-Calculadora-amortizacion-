// Obtener el elemento HTML que contiene el dato de texto
var elementoDato = document.getElementById("dato-texto");

// Obtener el valor del dato de texto desde el atributo "data-dato"
var datoTexto = elementoDato.getAttribute("data-dato");

// Obtener el elemento HTML donde se escribirá el dato
/*var contenedorDato = document.getElementById("dato");*/

// Escribir el dato en el contenedor
elementoDato.textContent = datoTexto;


var contendor_datos_consumo = document.getElementById("Datos_consumo");
var datos_consumo_txt = contendor_datos_consumo.getAttribute("data-consumo");
/*document.write(datos_consumo_txt);*/
var datos_consumo = JSON.parse(datos_consumo_txt);
/*document.write(datos_consumo);*/

var fechas = [];
var consumos = [];

for (var i = 0; i < datos_consumo.length; i++) {
  var fechaHora = datos_consumo[i].FECHA_HORA;
  var consumo = datos_consumo[i].CONSUMO_Wh;
  
  fechas.push(fechaHora);
  consumos.push(consumo);
}

// document.write(fechas);
// document.write(consumos);


// Configuración del lienzo SVG
var svgWidth = 600, svgHeight = 400;
var margin = {top: 60, right: 20, bottom: 60, left: 74};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Escala X: escala de tiempo
var xScale = d3.scaleTime()
    .domain(d3.extent(fechas, function(d) { return new Date(d); })) // Convertir las fechas a objetos Date
    .range([0, width]);
    

// Escala Y: escala lineal
var yScale = d3.scaleLinear()
    .domain([0, d3.max(consumos)])
    .range([height, 0]);

// Línea
var line = d3.line()
    .x(function(d, i) { return xScale(new Date(fechas[i])); })
    .y(function(d) { return yScale(d); });

// Crear el lienzo SVG
var svg = d3.select("#Chart_consumo")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "30px")
    .style("text-decoration", "underline")
    .style("fill", "steelblue")
    .text("Consumo de Energía");

// Agregar la línea al gráfico
svg.append("path")
    .datum(consumos)
    .attr("class", "line")
    .attr("d", line)
    .attr("stroke-width", 5)
    .attr("stroke", "steelblue");
    

// Eje X
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .style("font-size", "16px")
    .call(d3.axisBottom(xScale));

// Eje Y
svg.append("g")
    .style("font-size", "16px")
    .call(d3.axisLeft(yScale));

// Agregar título al eje X
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.top - 20) // Ajusta la posición vertical del título del eje X
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "yellow")
    .text("Fecha y Hora");

// Agregar título al eje Y
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "yellow")
    .text("Consumo (Wh)");

svg.selectAll("path")
    .style("stroke", "yellow"); // Cambia el color de las líneas de los ejes