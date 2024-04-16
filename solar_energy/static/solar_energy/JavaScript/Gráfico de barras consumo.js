// https://www.youtube.com/watch?v=jF1XPXqom_c

contenedor = document.getElementById('Bar_Chart_consumo')
var data = [30, 86, 168, 281, 303, 365];

function myResponsiveComponent(container, props){
  console.log(props.width);
  console.log(props.height);

  //Define margenes y dimensiones del gráfico
  var margin = {top: 0.1 * props.height, right: 0.04 * props.width, bottom: 0.2* props.height, left: 0.14 * props.width};
  var width = props.width - margin.left - margin.right;
  var height = props.height - margin.top - margin.bottom;
  console.log(width);
  console.log(height);

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

    
  console.log(data)

   // Escala para el eje X (barras)
  const xScale = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([0, width])
    .padding(0.1);
  const xAxis = d3.axisBottom(xScale);
  let xAxisG = g.selectAll('.x-axis').data([null]);
    xAxisG = xAxisG.enter().append('g')
      .attr('class', 'x-axis')
    .merge(xAxisG)
      .attr('transform', `translate(0, ${height})`);
      xAxisG.call(xAxis);


  // Escala para el eje Y y Agrega el eje Y (altura de las barras)
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([height, 0]);
  const yAxis = d3.axisLeft(yScale);
  let yAxisG = g.selectAll('.y-axis').data([null]);
    yAxisG = yAxisG.enter().append('g')
      .attr('class', 'y-axis')
    .merge(yAxisG);
      yAxisG.call(yAxis);


    // Crea las barras
  let grafico = g.selectAll('.bar').data(data);
    grafico = grafico.enter().append("rect")
        .attr("class", "bar")
      .merge(grafico)
        .attr("x", function(d, i) { return xScale(i); })
        .attr("y", function(d) { return yScale(d); })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) { return height - yScale(d); });
};

function render(){
  myResponsiveComponent(d3.select("#Bar_Chart_consumo"), {
    width: contenedor.clientWidth,
    height: contenedor.clientHeight,
  });
};

render();

window.addEventListener('resize', render);


  
console.log(contenedor.clientWidth);
console.log(contenedor.clientHeight);

