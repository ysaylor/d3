// Retreive width of the container
var width = parseInt(d3.select("#scatter").style("width"));

// Assign the height of the graph
var height = width - width / 3.9;

// Assign margin spacing for graph
var margin = 20;

// Assign variable for the space needed for placement of text
var labelArea = 110;

// Assign variables for padding needed for the text at the bottom and left axes
var tPadBot = 40;
var tPadLeft = 40;

// Create the container for the graph
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Set the radius for each circle that will appear in the graph.
var circRadius;
function crGet() {
  if (width <= 530) {
    circRadius = 5;
  }
  else {
    circRadius = 10;
  }
}
crGet();

// Creating Axis Labels

// X Axis

//Create a group element for the x axis labels.
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

// Assign X axis variable with transform property that places it at the bottom of the chart.
// Placing this into a function will allow the location of the label group to be changed when
// the width of the window changes.
function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - tPadBot) +
      ")"
  );
}
xTextRefresh();

// Append the X Axis to the three text SVGs with y coordinates specified to space out the values.
// Poverty
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");
// Age
xText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");
// Income
xText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

// Y Axis

// Assign variables which allows to make transform attributes more readable.
var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

svg.append("g").attr("class", "yText");

var yText = d3.select(".yText");

// Nest the group's transform attr in a function
function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
  );
}
yTextRefresh();

// Append the following texts:

// Obesity
yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

//Smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// Lacks Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// Import CSV data with d3's .csv import method.
d3.csv("assets/data/data.csv", function(data) {
  // Visualize the data
  visualize(data);
});

// Create our visualization function

// Define function that handles the visual manipulation of all elements dependent on the data.
function visualize(theData) {
  
  // Essential Local Variables and Functions

  // curX and curY will determine what data gets represented in each axis.
  // Assign the defaults variables to be the same names
  // as the headings in their matching .csv data file.
  var curX = "poverty";
  var curY = "obesity";

  // Assign empty variables for the min and max values of x and y,
  // which will allow to alter the values in functions and remove repititious code.
  var xMin;
  var xMax;
  var yMin;
  var yMax;

  // Create the function which allows to set up tooltip rules (see d3-tip.js).
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      // x key
      var theX;
      // Retrieve the state name.
      var theState = "<div>" + d.state + "</div>";
      // Obtain the y value's key and value.
      var theY = "<div>" + curY + ": " + d[curY] + "%</div>";
      // If the x key is poverty
      if (curX === "poverty") {
        // Retrieve the x key and a version of the value formatted to show percentage
        theX = "<div>" + curX + ": " + d[curX] + "%</div>";
      }
      else {
        // Otherwise
        // Retrieve the x key and a version of the value formatted to include commas after every third digit.
        theX = "<div>" +
          curX +
          ": " +
          parseFloat(d[curX]).toLocaleString("en") +
          "</div>";
      }
      // Display what we capture.
      return theState + theX + theY;
    });
  // Call the toolTip function.
  svg.call(toolTip);

  // D.R.Y!

  // Change the min and max for x
  function xMinMax() {
    // .min method will obtain the smallest datum from the selected column.
    xMin = d3.min(theData, function(d) {
      return parseFloat(d[curX]) * 0.90;
    });

    // .max method will obtain the largest datum from the selected column.
    xMax = d3.max(theData, function(d) {
      return parseFloat(d[curX]) * 1.10;
    });
  }

  // Change the min and max for y
  function yMinMax() {
    // .min method will obtain the smallest datum from the selected column.
    yMin = d3.min(theData, function(d) {
      return parseFloat(d[curY]) * 0.90;
    });

    // .max method will obtain the largest datum from the selected column.
    yMax = d3.max(theData, function(d) {
      return parseFloat(d[curY]) * 1.10;
    });
  }

  // Change the classes (and appearance) of label text when clicked.
  function labelChange(axis, clickedText) {
    // Switch the currently active to inactive.
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the text just clicked to active.
    clickedText.classed("inactive", false).classed("active", true);
  }

  // Instantiate the Scatter Plot

  // Retrieve the min and max values of x and y.
  xMinMax();
  yMinMax();

  // Create the scales.
   var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    // Height is inversed 
    .range([height - margin - labelArea, margin]);

  // Pass the scales into the axis methods to create the axes.
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // Determine x and y tick counts.
    function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  // Append the axes in group elements. 
  // The transform attribute specifies where to place the axes.
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  // Make a grouping for the circles and their labels.
  var theCircles = svg.selectAll("g theCircles").data(theData).enter();

  // Append the circles for each row of data (or each state, in this case).
  theCircles
    .append("circle")
    // These attr's specify location, size and class.
    .attr("cx", function(d) {
      return xScale(d[curX]);
    })
    .attr("cy", function(d) {
      return yScale(d[curY]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    // Hover rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove the tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select(this).style("stroke", "#e3e3e3");
    });

  // Create matching labels for the circles on graph.
  // Obtain the state abbreviations from the data
  // and place them in the center of the circles.
  theCircles
    .append("text")
    // Return the abbreviation to .text, which makes the text the abbreviation.
    .text(function(d) {
      return d.abbr;
    })
    
    .attr("dx", function(d) {
      return xScale(d[curX]);
    })
    .attr("dy", function(d) {
      
      return yScale(d[curY]) + circRadius / 2.5;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    // Hover Rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d);
      // Highlight the state circle's border
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  // Part 4: Dynamize the Graph
  
  // Select all axis text and add a d3 click event.
  d3.selectAll(".aText").on("click", function() {
    
    var self = d3.select(this);

    // Run function on inactive labels.
    
    if (self.classed("inactive")) {
      
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      // When x is the saved axis, make curX the same as the data name.
      if (axis === "x") {
        
        curX = name;

        // Change the min and max of the x-axis
        xMinMax();

        // Update the x domain.
        xScale.domain([xMin, xMax]);

        // Use a transition when the xAxis update.
        svg.select(".xAxis").transition().duration(300).call(xAxis);

        // With the axis changed, update the location of the state circles.
        d3.selectAll("circle").each(function() {
         
          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[curX]);
            })
            .duration(300);
        });

        // Change the location of the state texts.
        d3.selectAll(".stateText").each(function() {
          
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[curX]);
            })
            .duration(300);
        });

        // Change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
      else {
        // When y is the saved axis, make curY variable the same as the data name.
        curY = name;

        // Change the min and max of the y-axis.
        yMinMax();

        // Update the Y domain
        yScale.domain([yMin, yMax]);

        // Update Y Axis
        svg.select(".yAxis").transition().duration(300).call(yAxis);

        // With the axis changed, update the location of the state circles.
        d3.selectAll("circle").each(function() {
          
          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[curY]);
            })
            .duration(300);
        });

        // We need change the location of the state texts, too.
        d3.selectAll(".stateText").each(function() {
         
          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[curY]) + circRadius / 3;
            })
            .duration(300);
        });

        // Change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
    }
  });

  // Mobile Responsive
  
  d3.select(window).on("resize", resize);
  function resize() {
    
    width = parseInt(d3.select("#scatter").style("width"));
    height = width - width / 3.9;
    leftTextY = (height + labelArea) / 2 - labelArea;

    
    svg.attr("width", width).attr("height", height);

   
    xScale.range([margin + labelArea, width - margin]);
    yScale.range([height - margin - labelArea, margin]);

    
    svg
      .select(".xAxis")
      .call(xAxis)
      .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

    svg.select(".yAxis").call(yAxis);

    // Update the ticks on each axis.
    tickCount();

    // Update the labels on each axis.
    xTextRefresh();
    yTextRefresh();

    // Update the radius of each circle.
    crGet();

    // With the axis changed, update the location and radius of the state circles.
    d3
      .selectAll("circle")
      .attr("cy", function(d) {
        return yScale(d[curY]);
      })
      .attr("cx", function(d) {
        return xScale(d[curX]);
      })
      .attr("r", function() {
        return circRadius;
      });

    // Change the location and size of the state texts.
    d3
      .selectAll(".stateText")
      .attr("dy", function(d) {
        return yScale(d[curY]) + circRadius / 3;
      })
      .attr("dx", function(d) {
        return xScale(d[curX]);
      })
      .attr("r", circRadius / 3);
  }
}