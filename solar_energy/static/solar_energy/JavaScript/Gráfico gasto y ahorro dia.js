// Gráfico de consumo y producción diario.
contenedor_grafica = document.getElementById('chart_gasto_ahorro_dia');
contenedor_datos = document.getElementById('Datos_consumo_produccion_mes');
var datos_json = contenedor_datos.getAttribute('data-consumo');
var datos_consumo = JSON.parse(datos_json)
// Función para filtrar los datos

function filtrarDatosPorDia(diaSeleccionado) {
    return datos_consumo.filter(function(d) {
        return d.Fecha === diaSeleccionado;
    });
}


function grafico_gasto_ahorro_dia(container, props) {
    const dateInput = document.getElementById('dateInput').value;
    var datosFiltrados = filtrarDatosPorDia(dateInput);

    var fechas = [];
    var gasto_no_placas = [];
    var ahorros = [];
    var gasto_si_placas = [];

    for (var i = 0; i < datosFiltrados.length; i++) {
        var fechaHora = datosFiltrados[i].FECHA_HORA;
        var gasto_no = datosFiltrados[i].Gasto_sin_placas;
        var ahorro = datosFiltrados[i].Ahorro_con_placas;
        var gasto_si = datosFiltrados[i].Gasto_con_placas;
        
        fechas.push(fechaHora);
        gasto_no_placas.push(gasto_no);
        ahorros.push(ahorro);
        gasto_si_placas.push(gasto_si)
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
    sizetitle = minDimension * 0.08;
    sizeaxis = minDimension * 0.05; 

    // Título del gráfico
    let titulo = g.selectAll('.chart-title').data([null]); // Elimina el título anterior si existe
    titulo = titulo.enter().append("text")
        .attr("class", "chart-title")
        .text(dateInput + ": Sin placas vs. Con placas") // Título del gráfico
        .merge(titulo)
        .attr("x", (props.width - margin.left - margin.right) / 2)
        .attr("y", -margin.top/5)
        .attr("text-anchor", "middle")
        .style("font-size", sizetitle + 'px');
    
    // Etiqueta del eje X
    let etiquetax = g.selectAll('.x-axis-label').data([null]);
    etiquetax = etiquetax.enter().append("text")
        .attr("class", "x-axis-label")
        .text("Horas") // Etiqueta del eje X
        .merge(etiquetax)
        .attr("x", (props.width - margin.left - margin.right) / 2)
        .attr("y", props.height - margin.bottom)
        .attr("text-anchor", "middle")
        .style("font-size", sizeaxis + 'px');

    
    // Etiqueta del eje Y
    let etiquetay = g.selectAll('.y-axis-label').data([null]); 
    etiquetay = etiquetay.enter().append("text")
        .attr("class", "y-axis-label")
        .text("Coste (€)") // Etiqueta del eje Y
        .merge(etiquetay)
        .attr("transform", "rotate(-90)")
        .attr("x", - (props.height - margin.top - margin.bottom) / 2)
        .attr("y", -(margin.left / 2))
        .attr("dy", "-1vh")
        .attr("text-anchor", "middle")
        .style("font-size", sizeaxis + 'px');


        maximoTotal = Math.max(d3.max(gasto_no_placas), d3.max(gasto_si_placas))*1.2;
        minimoTotal = Math.min(d3.min(gasto_no_placas), d3.min(gasto_si_placas));
        // Creación de la escala y y agregación del eje y.
        const yScale = d3.scaleLinear()
            .domain([minimoTotal, maximoTotal])
            .range([height, 0]);
        const yAxis = d3.axisLeft(yScale);
        let yAxisG = g.selectAll('.y-axis1').data([null]);
        yAxisG = yAxisG.enter().append('g')
            .attr('class', 'y-axis1')
        .merge(yAxisG);
        yAxisG.call(yAxis)
            .style('font-size', fontSize + 'px');
    
    // Creación de la escala x y agregación del eje x.
    const xScale = d3.scaleBand()
        .domain(d3.range(fechas.length))
        .range([0, width])
        .padding(0.2)
        .paddingOuter(-0.4); // Ajustamos el espacio en los extremos del eje x
    const xAxis = d3.axisBottom(xScale);
        //.tickValues(d3.range(0, fechas.length, 24)) // Mostrar un valor por cada 24 valores
        //.tickFormat(function(d, i) { return i + 1; }); // Usar números enteros como etiquetas de los ticks
    let xAxisG = g.selectAll('.x-axis1').data([null]);
    xAxisG = xAxisG.enter().append('g')
        .attr('class', 'x-axis1')
    .merge(xAxisG)
        .attr('transform', `translate(0, ${height})`);
    xAxisG.call(xAxis)
        .style('font-size', fontSize + 'px');

    


    // Agregar línea al gráfico
    let grafico = g.selectAll('.linea1').data(gasto_no_placas);
    grafico = grafico.enter().append("path")
        .datum(gasto_no_placas)
        .attr("class", "linea1")
    .merge(grafico)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d); }));

    // Agregar línea al gráfico
    let grafico1 = g.selectAll('.linea2').data(gasto_si_placas);
    grafico1 = grafico1.enter().append("path")
        .datum(gasto_si_placas)
        .attr("class", "linea2")
    .merge(grafico1)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
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
    { label: "Factura de luz sin placas", color: "red" },
    { label: "Factura de luz con placas", color: "steelblue" }
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
    .style("font-size", "14px")
    .attr("alignment-baseline", "middle");
}

function render_grafico_ahorro_dia(){
    grafico_gasto_ahorro_dia(d3.select("#chart_gasto_ahorro_dia"), {
      width: contenedor_grafica.clientWidth,
      height: contenedor_grafica.clientHeight,
    });
  };
  
render_grafico_ahorro_dia();
  
window.addEventListener('resize', render_grafico_ahorro_dia);