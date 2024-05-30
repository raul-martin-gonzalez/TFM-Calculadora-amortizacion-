contenedor_datos=document.getElementById('Datos_consumo_compacto')

datos = contenedor_datos.getAttribute('data-consumo')

var datos_consumo = JSON.parse(datos);


var gasto_no_placas = [];
var ahorros = [];
var gasto_si_placas = []

for (var i = 0; i < datos_consumo.length; i++) {
  var gasto_no = datos_consumo[i].Gasto_sin_placas;
  var ahorro = datos_consumo[i].Ahorro_con_placas;
  var gasto_si = datos_consumo[i].Gasto_con_placas;

  gasto_no_placas.push(gasto_no);
  ahorros.push(ahorro);
  gasto_si_placas.push(gasto_si);
}

contenedor = document.getElementById('Bar_Chart_gasto_ahorro')


function gasto_ahorro(container, props){
  //console.log(props.width);
  //console.log(props.height);
  // Arreglo de meses
  var etiqueta_meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  //Define margenes y dimensiones del gráfico
  var margin = {top: 0.1 * props.height, right: 0.04 * props.width, bottom: 0.2* props.height, left: 0.14 * props.width};
  var width = props.width - margin.left - margin.right;
  var height = props.height - margin.top - margin.bottom;
  // console.log(width);
  // console.log(height);

  //contenedor.textContent = props.height;
  let svg = container.selectAll('svg').data([null]);
  svg = svg.enter().append('svg')
    .merge(svg)
      .attr('width', props.width)
      .attr('height', props.height);

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
  fontSize = minDimension * 0.033;
  sizetitle = minDimension * 0.08;
  sizeaxis = minDimension * 0.05; 

  // Título del gráfico
  let titulo = g.selectAll('.chart-title').data([null]); // Elimina el título anterior si existe
  titulo = titulo.enter().append("text")
      .attr("class", "chart-title")
      .text("Sin placas vs. Con placas") // Título del gráfico
    .merge(titulo)
      .attr("x", (props.width - margin.left - margin.right) / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", sizetitle + 'px');
      
  // Etiqueta del eje X
  let etiquetax = g.selectAll('.x-axis-label').data([null]);
  etiquetax = etiquetax.enter().append("text")
      .attr("class", "x-axis-label")
      .text("Meses") // Etiqueta del eje X
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
      .attr("dy", "-1.5vh")
      .attr("text-anchor", "middle")
      .style("font-size", sizeaxis + 'px');
    

   // Escala para el eje X (barras)
  const xScale = d3.scaleBand()
    .domain(etiqueta_meses)
    .range([0, width])
    .padding(0.1);
  const xAxis = d3.axisBottom(xScale);
  let xAxisG = g.selectAll('.x-axis1').data([null]);
    xAxisG = xAxisG.enter().append('g')
      .attr('class', 'x-axis1')
    .merge(xAxisG)
      .attr('transform', `translate(0, ${height})`);
    xAxisG.call(xAxis)
      .style('font-size', fontSize + 'px');;


  maximoTotal = Math.max(d3.max(gasto_no_placas), d3.max(gasto_si_placas))*1.2;
  // Escala para el eje Y y Agrega el eje Y (altura de las barras)
  const yScale = d3.scaleLinear()
    .domain([0, maximoTotal])
    .range([height, 0]);
  const yAxis = d3.axisLeft(yScale);
  let yAxisG = g.selectAll('.y-axis1').data([null]);
    yAxisG = yAxisG.enter().append('g')
      .attr('class', 'y-axis1')
    .merge(yAxisG);
    yAxisG.call(yAxis)
      .style('font-size', fontSize + 'px');;


    // Crea las barras
  let grafico = g.selectAll('.bar1').data(gasto_no_placas);
    grafico = grafico.enter().append("rect")
        .attr("class", "bar1")
      .merge(grafico)
      .attr("x", (d, i) => xScale(etiqueta_meses[i]))
      .attr("y", d => yScale(d))
        .attr("width", xScale.bandwidth()/2)
        .attr("height", function(d) { return height - yScale(d); })
        .style("fill", "red");

  let grafico2 = g.selectAll('.bar2').data(gasto_si_placas);
  grafico2 = grafico2.enter().append("rect")
      .attr("class", "bar2")
    .merge(grafico2)
    .attr("x", (d, i) => xScale(etiqueta_meses[i]) + xScale.bandwidth() / 2)
    .attr("y", d => yScale(d))
      .attr("width", xScale.bandwidth()/2)
      .attr("height", function(d) { return height - yScale(d); })
      .style("fill", "steelblue");


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
  

};

function render2(){
    gasto_ahorro(d3.select("#Bar_Chart_gasto_ahorro"), {
    width: contenedor.clientWidth,
    height: contenedor.clientHeight,
  });
};

render2();

window.addEventListener('resize', render2);


  
