var svgWidth = 900;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 10,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  // Append an SVG group
var chartGroup = svg.append("g")
 .attr("transform", `translate(${margin.left}, ${margin.top})`);

 //set default x-axis
var chosenXAxis = "poverty";

function xScale(Data, chosenXAxis) {    

// create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[chosenXAxis]) * 0.8,
      d3.max(Data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}

  // function used for updating xAxis upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  
  return xAxis;
};

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderText(lableText, newXScale, newYScale, chosenXAxis) {
  lableText.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))

  
  return lableText;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty Rate:";
  }
  else {
    label = "Obesity Rate:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.healthcare}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
} 

// Load data from data.csv
d3.csv("assets/data/data.csv").then(function(Data,err) {
    if (err) throw err;

    console.log(Data);

      // parse data
  Data.forEach(function(data) {
    data.poverty = +data.poverty;
    // console.log(data.poverty)
    data.healthcare = +data.healthcare;
    // console.log(data.healthcare)
    data.obesity = +data.obesity;
    // console.log(data.obesity)
    });
  // xLinearScale function above csv import
  var xLinearScale = xScale(Data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(Data, d => d.healthcare)])
      .range([height, 0]);

// Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
  
// append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

// append y axis
  chartGroup.append("g")
      .call(leftAxis);

// append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(Data)
    .enter()   
    .append("circle")
    .attr("class", "stateCircle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 20)

//append abbr to circle group

    var lableText = chartGroup.append("g")
    .selectAll("text")
    .data(Data)
    .enter()
    .append("text")
    .attr("class", "stateText")
    .attr("x", d => xLinearScale(d[chosenXAxis])-2)
    .attr("y", d => yLinearScale(d.healthcare)+5)
    .text(d => d.abbr)
    .attr("r", 20);

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  //1st x-axis
  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty Rate");

    //1st x-axis
  var obesityLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity Rate");

      // append y axis
  chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Lacks Healthare (%)");

// updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup,lableText);

// x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
     // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

       // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

       // functions here found above csv import
       // updates x scale for new data
        xLinearScale = xScale(Data, chosenXAxis);

       // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis,lableText);

       // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        //update state abbr in cicle

        lableText = renderText(lableText, xLinearScale,yLinearScale, chosenXAxis)

       // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

       // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
        povertyLabel
           .classed("active", false)
           .classed("inactive", true);
         obesityLabel
           .classed("active", true)
           .classed("inactive", false);
        }
      } 
    }); 
})

.catch(function(error) {
 console.log(error);

});
