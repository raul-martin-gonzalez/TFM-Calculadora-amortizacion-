contenedor_datos_comparativa = document.getElementById('Datos_comparativa');
var data_comparativa_str = contenedor_datos_comparativa.getAttribute('data-comparativa');
var data_comparativa = JSON.parse(data_comparativa_str);

contenedor_grafica_comparativa = document.getElementById('chart_comparativa_placas');

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
    
    let minDimension = Math.min(props.width, props.height);
    let fontSize;
    fontSize = minDimension * 0.03;
    sizetitle = minDimension * 0.08;
    sizeaxis = minDimension * 0.05; 


    // Título del gráfico
    let titulo = g.selectAll('.chart-title').data([null]); // Elimina el título anterior si existe
    titulo = titulo.enter().append("text")
        .attr("class", "chart-title")
        .text("Gasto vs. Consumo Mes") // Título del gráfico
        .merge(titulo)
        .attr("x", (props.width - margin.left - margin.right) / 2)
        .attr("y", -margin.top/5)
        .attr("text-anchor", "middle")
        .style("font-size", sizetitle + 'px');
    
    // Etiqueta del eje X
    let etiquetax = g.selectAll('.x-axis-label').data([null]);
    etiquetax = etiquetax.enter().append("text")
        .attr("class", "x-axis-label")
        .text("Años") // Etiqueta del eje X
        .merge(etiquetax)
        .attr("x", (props.width - margin.left - margin.right)/1.8)
        .attr("y", props.height - margin.bottom)
        .attr("text-anchor", "middle")
        .style("font-size", sizeaxis + 'px');

    
    // Etiqueta del eje Y
    let etiquetay = g.selectAll('.y-axis-label').data([null]); 
    etiquetay = etiquetay.enter().append("text")
        .attr("class", "y-axis-label")
        .text("€") // Etiqueta del eje Y
        .merge(etiquetay)
        .attr("transform", "rotate(-90)")
        .attr("x", - (props.height - margin.top - margin.bottom) / 2)
        .attr("y", -(margin.left / 1.7))
        .attr("dy", "-1vh")
        .attr("text-anchor", "middle")
        .style("font-size", sizeaxis + 'px');

    
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
    xAxisG.call(xAxis)
        .style('font-size', fontSize + 'px');


    // Creación de la escala x y agregación del eje x.
    const yScale = d3.scaleLinear()
        .domain([d3.min(data_comparativa.placas_35), d3.max(data_comparativa.placas_35)])
        .range([height, 0]);
    const yAxis = d3.axisLeft(yScale);
    let yAxisG = g.selectAll('.y-axis1').data([null]);
    yAxisG = yAxisG.enter().append('g')
        .attr('class', 'y-axis1')
    .merge(yAxisG);
    yAxisG.call(yAxis)
        .style('font-size', fontSize + 'px');


    // Agregar línea al gráfico
    let grafico = g.selectAll('.linea1').data(data_comparativa.placas_1);
    grafico = grafico.enter().append("path")
        .datum(data_comparativa.placas_1)
        .attr("class", "linea1")
    .merge(grafico)
        .attr("fill", "none")
        .attr("stroke", "blue")
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
        .attr("stroke", "orange")
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
        .attr("stroke", "red")
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
        .attr("stroke", "purple")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); }));

    // Agregar línea al gráfico
    let grafico4 = g.selectAll('.linea5').data(data_comparativa.placas_12);
    grafico4 = grafico4.enter().append("path")
        .datum(data_comparativa.placas_12)
        .attr("class", "linea5")
    .merge(grafico4)
        .attr("fill", "none")
        .attr("stroke", "brown")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); }));


    // Agregar línea al gráfico
    let grafico5 = g.selectAll('.linea6').data(data_comparativa.placas_16);
    grafico5 = grafico5.enter().append("path")
        .datum(data_comparativa.placas_16)
        .attr("class", "linea6")
    .merge(grafico5)
        .attr("fill", "none")
        .attr("stroke", "pink")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); }));


    let grafico6 = g.selectAll('.linea7').data(data_comparativa.placas_20);
    grafico6 = grafico6.enter().append("path")
        .datum(data_comparativa.placas_20)
        .attr("class", "linea7")
    .merge(grafico6)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); })); 

    let grafico7 = g.selectAll('.linea8').data(data_comparativa.placas_25);
    grafico7 = grafico7.enter().append("path")
        .datum(data_comparativa.placas_25)
        .attr("class", "linea8")
    .merge(grafico7)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); })); 
    
    // Agregar línea al gráfico
    let grafico8 = g.selectAll('.linea9').data(data_comparativa.placas_35);
    grafico8 = grafico8.enter().append("path")
        .datum(data_comparativa.placas_35)
        .attr("class", "linea9")
    .merge(grafico8)
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
    .attr("transform", "translate(" + (margin.left/2) + "," + (margin.top)/2 + ")");

// Datos de la leyenda
const legendData = [
    { nombre: "Placas 1", color: "blue" },
    { nombre: "Placas 2", color: "orange" },
    { nombre: "Placas 4", color: "red" },
    { nombre: "Placas 8", color: "purple" },
    { nombre: "Placas 12", color: "brown" },
    { nombre: "Placas 16", color: "pink" },
    { nombre: "Placas 20", color: "black" },
    { nombre: "Placas 25", color: "green" },
    { nombre: "Placas 35", color: "yellow" }
];


// Configuración de la leyenda
const numCols = 2;
const itemHeight = 20;
const itemWidth = 80;
const padding = 5;

legendData.forEach((d, i) => {
    const col = i % numCols;
    const row = Math.floor(i / numCols);

    // Añadir rectángulo de color
    legend.selectAll("rect")
    .data(legendData)
    .enter().append("rect")
    .attr('x', (d, i) => {
        const col = i % numCols;
        return col * (itemWidth + padding);
    })
    .attr('y', (d, i) => {
        const row = Math.floor(i / numCols);
        return row * (itemHeight + padding);
    })
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', d => d.color);

    // Añadir texto de la leyenda
    legend.selectAll("text")
    .data(legendData)
    .enter().append("text")
    .attr('x', (d, i) => {
        const col = i % numCols;
        return col * (itemWidth + padding) + 24;
    })
    .attr('y', (d, i) => {
        const row = Math.floor(i / numCols);
        return row * (itemHeight + padding) + 9;
    })
    .attr('dy', '0.35em')
    .style('text-anchor', 'start')
    .style('font-size', '12px')
    .text(d => d.nombre);
});



}

function render_comparativa(){
    grafico_comparativa(d3.select("#chart_comparativa_placas"), {
      width: contenedor_grafica_comparativa.clientWidth,
      height: contenedor_grafica_comparativa.clientHeight,
    });
  };
  
  render_comparativa();
  
window.addEventListener('resize', render_comparativa);


