contenedor_datos_comparativa = document.getElementById('Datos_comparativa');
var data_comparativa_str = contenedor_datos_comparativa.getAttribute('data-comparativa');
var data_comparativa = JSON.parse(data_comparativa_str);
// var data = data_comparativa.placas_1;
// console.log(typeof(data_comparativa));
// console.log(data_comparativa_str)
// console.log('Hola que tal ertre');
// console.log(data);

contenedor_grafica = document.getElementById('chart_comparativa_placas');

function grafico_comparativa(container, props) {
    //Margen y dimensiones del gráfico
    var margin = {top: 0.1 * props.height, right: 0.04 * props.width, bottom: 0.2* props.height, left: 0.14 * props.width};
    var width = props.width - margin.left - margin.right;
    var height = props.height - margin.top - margin.bottom;
    
    // Eliminar gráfico anterior si existe
    container.select("svg").remove();

    // Crear SVG 
    let svg = container.selectAll('svg').data([null]);
    svg = svg.enter().append('svg')
        .merge(svg)
            .attr('width', props.width)
            .attr('height', props.height);
    
    // Agregar un rectángulo con fondo blanco al SVG
    const rect = svg.selectAll('rect').data([null]);
    rect
        .enter().append('rect')
        .attr('rx', 30)
        .merge(rect)
        .attr("fill", "white")
        .attr('width', props.width)
        .attr('height', props.height);
    
    // Crea un grupo (g) para el gráfico con el margen aplicado
    let g = svg.selectAll('g').data([null]);
    g = g.enter().append("g")
        .merge(g)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    
    // Título del gráfico
    let titulo = g.selectAll('.chart-title').data([null]); // Elimina el título anterior si existe
    titulo = titulo.enter().append("text")
        .attr("class", "chart-title")
        .text("Gasto vs. Consumo Mes") // Título del gráfico
        .merge(titulo)
        .attr("x", (props.width - margin.left - margin.right) / 2)
        .attr("y", -margin.top/5)
        .attr("text-anchor", "middle")
        .style("font-size", "5vh");
    
    // Etiqueta del eje X
    let etiquetax = g.selectAll('.x-axis-label').data([null]);
    etiquetax = etiquetax.enter().append("text")
        .attr("class", "x-axis-label")
        .text("Días") // Etiqueta del eje X
        .merge(etiquetax)
        .attr("x", (props.width - margin.left - margin.right) / 2)
        .attr("y", props.height - margin.bottom)
        .attr("text-anchor", "middle")
        .style("font-size", "3vh");

    
    // Etiqueta del eje Y
    let etiquetay = g.selectAll('.y-axis-label').data([null]); 
    etiquetay = etiquetay.enter().append("text")
        .attr("class", "y-axis-label")
        .text("€") // Etiqueta del eje Y
        .merge(etiquetay)
        .attr("transform", "rotate(-90)")
        .attr("x", - (props.height - margin.top - margin.bottom) / 2)
        .attr("y", -(margin.left / 4))
        .attr("dy", "-1vh")
        .attr("text-anchor", "middle")
        .style("font-size", "3vh");

    
    // Creación de la escala x y agregación del eje x.
    const xScale = d3.scaleBand()
        .domain(d3.range(data_comparativa.años.length))
        .range([0, width])
        .padding(0.2);
    const xAxis = d3.axisBottom(xScale)
        //.tickValues(d3.range(0, fechas.length, 24)) // Mostrar un valor por cada 24 valores
        //.tickFormat(function(d, i) { return i + 1; }); // Usar números enteros como etiquetas de los ticks
    let xAxisG = g.selectAll('.x-axis1').data([null]);
    xAxisG = xAxisG.enter().append('g')
        .attr('class', 'x-axis1')
    .merge(xAxisG)
        .attr('transform', `translate(0, ${height})`);
        xAxisG.call(xAxis);


    // Creación de la escala x y agregación del eje x.
    const yScale = d3.scaleLinear()
        .domain([d3.min(data_comparativa.placas_35), d3.max(data_comparativa.placas_35)])
        .range([height, 0]);
    const yAxis = d3.axisLeft(yScale);
    let yAxisG = g.selectAll('.y-axis1').data([null]);
    yAxisG = yAxisG.enter().append('g')
        .attr('class', 'y-axis1')
    .merge(yAxisG);
        yAxisG.call(yAxis);


    // Agregar línea al gráfico
    let grafico = g.selectAll('.linea1').data(data_comparativa.placas_1);
    grafico = grafico.enter().append("path")
        .datum(data_comparativa.placas_1)
        .attr("class", "linea1")
    .merge(grafico)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); }));

    // Agregar línea al gráfico
    let grafico1 = g.selectAll('.linea2').data(data_comparativa.placas_2);
    grafico1 = grafico1.enter().append("path")
        .datum(data_comparativa.placas_2)
        .attr("class", "linea2")
    .merge(grafico1)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); })); 

    // Agregar línea al gráfico
    let grafico2 = g.selectAll('.linea3').data(data_comparativa.placas_4);
    grafico2 = grafico2.enter().append("path")
        .datum(data_comparativa.placas_4)
        .attr("class", "linea3")
    .merge(grafico2)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); }));
    
    // Agregar línea al gráfico
    let grafico3 = g.selectAll('.linea4').data(data_comparativa.placas_8);
    grafico3 = grafico3.enter().append("path")
        .datum(data_comparativa.placas_8)
        .attr("class", "linea4")
    .merge(grafico3)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); }));

    // Agregar línea al gráfico
    let grafico4 = g.selectAll('.linea5').data(data_comparativa.placas_35);
    grafico4 = grafico4.enter().append("path")
        .datum(data_comparativa.placas_35)
        .attr("class", "linea5")
    .merge(grafico4)
        .attr("fill", "none")
        .attr("stroke", "yellow")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); })); 

// Agregar leyenda
let legend = g.selectAll('.legend').data([null]); 
legend = legend.enter().append("g")
    .attr("class", "legend")
  .merge(legend)
    .attr("transform", "translate(" + (-margin.left/2) + "," + (height + margin.bottom/3) + ")");

// Datos de la leyenda
const legendData = [
{ label: "Placas_1", color: "steelblue" },
{ label: "Placas_2", color: "red" },
{ label: "Placas_4", color: "green" },
{ label: "Placas_8", color: "black" },
{ label: "Placas_35", color: "yellow" },
];

// Crear cuadrados de color y etiquetas de texto para la leyenda
legend.selectAll("rect")
.data(legendData)
.enter().append("rect")
.attr("x", 0)
.attr("y", (d, i) => i * 20)
.attr("width", 10)
.attr("height", 10)
.style("fill", d => d.color);

legend.selectAll("text")
.data(legendData)
.enter().append("text")
.attr("x", 15)
.attr("y", (d, i) => i * 20 + 9)
.text(d => d.label)
.style("font-size", "12px")
.attr("alignment-baseline", "middle");

}

function render_comparativa(){
    grafico_comparativa(d3.select("#chart_comparativa_placas"), {
      width: contenedor_grafica.clientWidth,
      height: contenedor_grafica.clientHeight,
    });
  };
  
  render_comparativa();
  
window.addEventListener('resize', render_comparativa);


