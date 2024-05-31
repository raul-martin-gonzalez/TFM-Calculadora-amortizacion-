contenedor_datos_comparativa = document.getElementById('Datos_comparativa');
var data_comparativa_str = contenedor_datos_comparativa.getAttribute('data-comparativa');
var data_comparativa = JSON.parse(data_comparativa_str);

contenedor_grafica_comparativa = document.getElementById('chart_comparativa_placas');

contenedor_casos = document.getElementById('Casos');
var data_casos_str = contenedor_casos.getAttribute('data-comparativa');
var data_casos = JSON.parse(data_casos_str);
console.log(typeof(data_casos));

function grafico_comparativa(container, props) {
    var años = [];
    var dcaso0 = [];
    var dcaso1 = [];
    var dcaso2 = [];
    var dcaso3 = [];

    for (var i = 0; i < data_comparativa.length; i++) {
        var año = data_comparativa[i].Años;
        var caso0 = data_comparativa[i].placas_caso0;
        var caso1 = data_comparativa[i].placas_caso1;
        var caso2 = data_comparativa[i].placas_caso2;
        var caso3 = data_comparativa[i].placas_caso3;

        años.push(año);
        dcaso0.push(caso0);
        dcaso1.push(caso1)
        dcaso2.push(caso2)
        dcaso3.push(caso3)
      }
    
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
    sizetitle = minDimension * 0.07;
    sizeaxis = minDimension * 0.05; 


    // Título del gráfico
    let titulo = g.selectAll('.chart-title').data([null]); // Elimina el título anterior si existe
    titulo = titulo.enter().append("text")
        .attr("class", "chart-title")
        .text("Comparativa diferentes casos") // Título del gráfico
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
        .text("Retorno de la inversión (€)") // Etiqueta del eje Y
        .merge(etiquetay)
        .attr("transform", "rotate(-90)")
        .attr("x", - (props.height - margin.top - margin.bottom) / 2)
        .attr("y", -(margin.left / 1.7))
        .attr("dy", "-1vh")
        .attr("text-anchor", "middle")
        .style("font-size", sizeaxis + 'px');

    maximoTotal = Math.max(d3.max(dcaso0), d3.max(dcaso1), d3.max(dcaso2), d3.max(dcaso3))*1.2;
    minimoTotal = Math.min(d3.min(dcaso0), d3.min(dcaso1), d3.min(dcaso2), d3.min(dcaso3));
    // Creación de la escala y y agregación del eje y.
    const yScale = d3.scaleLinear()
        .domain([minimoTotal, maximoTotal])
        .range([height, 0]);
    const yAxis = d3.axisLeft(yScale)
        .ticks(10)
        .tickFormat(d3.format("d"));
    let yAxisG = g.selectAll('.y-axis1').data([null]);
    yAxisG = yAxisG.enter().append('g')
        .attr('class', 'y-axis1')
    .merge(yAxisG);
    yAxisG.call(yAxis)
        .style('font-size', fontSize + 'px');

    // Creación de la escala x y agregación del eje x.
    const xScale = d3.scaleBand()
        .domain(d3.range(años.length))
        .range([0, width])
        .padding(0.2)
        //.paddingOuter(-0.4);
    const xAxis = d3.axisBottom(xScale)
        
    let xAxisG = g.selectAll('.x-axis1').data([null]);
    xAxisG = xAxisG.enter().append('g')
        .attr('class', 'x-axis1')
    .merge(xAxisG)
        .attr('transform', `translate(0, ${height})`);
    xAxisG.call(xAxis)
        .style('font-size', fontSize + 'px');


    g.append("line")
    .attr("class", "zeroline")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", yScale(0))
    .attr("y2", yScale(0))
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "5,5");

    // Agregar línea al gráfico
    let grafico = g.selectAll('.linea1').data(dcaso0);
    grafico = grafico.enter().append("path")
        .datum(dcaso0)
        .attr("class", "linea1")
    .merge(grafico)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); }));

    // Agregar línea al gráfico
    let grafico1 = g.selectAll('.linea2').data(dcaso1);
    grafico1 = grafico1.enter().append("path")
        .datum(dcaso1)
        .attr("class", "linea2")
    .merge(grafico1)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); })); 

    // Agregar línea al gráfico
    let grafico2 = g.selectAll('.linea3').data(dcaso2);
    grafico2 = grafico2.enter().append("path")
        .datum(dcaso2)
        .attr("class", "linea3")
    .merge(grafico2)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); }));
    
    // Agregar línea al gráfico
    let grafico3 = g.selectAll('.linea4').data(dcaso3);
    grafico3 = grafico3.enter().append("path")
        .datum(dcaso3)
        .attr("class", "linea4")
    .merge(grafico3)
        .attr("fill", "none")
        .attr("stroke", "purple")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); }));


// Agregar leyenda
let legend = g.selectAll('.legend').data([null]); 
legend = legend.enter().append("g")
    .attr("class", "legend")
  .merge(legend)
    .attr("transform", "translate(" + (margin.left/3) + "," + (margin.top)/2 + ")");

// Datos de la leyenda
const legendData = [
    { nombre: "Nº placas " + data_casos.caso0, color: "blue" },
    { nombre: "Nº placas " + data_casos.caso1, color: "orange" },
    { nombre: "Nº placas " + data_casos.caso2, color: "red" },
    { nombre: "Nº placas " + data_casos.caso3, color: "purple" },
];


// Configuración de la leyenda
const numCols = 2;
const itemHeight = 20;
const itemWidth = 100;
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
    .style('font-size', '13px')
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


