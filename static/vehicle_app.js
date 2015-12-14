window.onload = init;

function init() {
    vehicleData.getTowData();
    // Kube CSS forced a design change, all their buttons are a custom
    // type, which defaults to submit.
    var form = document.getElementById('aform')
    form.onsubmit = getChoice;
}

function getChoice() {
    var radios = document.getElementsByName('dataChoice');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            vehicleData.addTowData(radios[i].value);
            vehicleData.createBubbleGraph(radios[i].value)
            return false;
        }
    }
}

var towedVehicles = [];

var vehicleData = (function() {
    var vehicleData = {};

    vehicleData.addTowData = function(choice) {
        var result = addTowData(choice);
        return result;
    };

    vehicleData.getTowData = function() {
        getTowData();
    };

    function getTowData() {
        var request = new XMLHttpRequest();
        request.open("GET", "http://cors.io/?u=http://derrick.io/data");
        request.onreadystatechange = function() {
            if (this.readyState == this.DONE && this.status == 200) {
                if (this.responseText) {
                    var carData = JSON.parse(this.responseText)
                    parseTowData(carData);
                }
                else {
                    console.log("Error: Data is empty");
                }
            }
        };
        request.send();
    }

    function parseTowData(towJSON) {
        if (towJSON == null) {
            console.log('Data Response was empty');
            return 0;
        }

        for (var i = 0; i < towJSON.data.length; i++) {
            towedVehicles.push(towJSON.data[i]);
        }
        // console.log(towedVehicles[3999].color);

        if (towedVehicles.length == 0) {
            console.log("Error: the tow vehicle list array is empty!");
            return;
        }
    }



    function addTowData(prop) {
        // Remove any existing data in the table
        var table = document.getElementById('table_data')
        for(var i = 1; i < table.rows.length;) {
                table.deleteRow(i);
        }

        var dataColor = {}
        for (var i = 0; i < towedVehicles.length; i++) {
            var towItem = towedVehicles[i];
            var key = towItem[prop]
            if (key.length == 0) key = '_na';
            if (key in dataColor) {
              dataColor[key] += 1
            }
            else {
              dataColor[key] = 1;
            }
        }

        // Populate the table
        showColorList(dataColor);
        //Change opacity of Top Label
        hiLightDataLabel(prop);
        // Label Data by Selection
        showDataCaptions(prop);
        // console.log(dataColor);
        return true
    }

    function hiLightDataLabel(prop) {
        // Change opacity to match data choice
        var h3_color = document.getElementById('h3_color')
        var h3_make = document.getElementById('h3_make')
        var h3_impound = document.getElementById('h3_state')

        if (prop == 'color') {
            h3_color.setAttribute("class", "heavy");
            h3_make.setAttribute("class", "medium");
            h3_impound.setAttribute("class", "medium");
        }
        else if (prop == 'make') {
            h3_color.setAttribute("class", "medium");
            h3_make.setAttribute("class", "heavy");
            h3_impound.setAttribute("class", "medium");
        }
        else {
            h3_color.setAttribute("class", "medium");
            h3_make.setAttribute("class", "medium");
            h3_impound.setAttribute("class", "heavy");
        }

    }

    function showDataCaptions(inProp) {
        var rawBase = "Complete Data: "
        var bubbleBase = "Top Trouble Makers "
        var table_title = document.getElementById('table_title')
        var d3_title = document.getElementById('d3_title')

        if (inProp == 'color') {
            table_title.innerHTML = rawBase + "Colors"
            d3_title.innerHTML = bubbleBase + "by Color"
        }
        else if (inProp == 'make') {
            table_title.innerHTML = rawBase + "Car Manufacturer"
            d3_title.innerHTML = bubbleBase + "by Make of Vehicle"
        }
        else {
            table_title.innerHTML = rawBase + "State Licence Plate"
            d3_title.innerHTML = "Top Out of State Offenders"
        }

    }


    function showColorList(inData) {
        //console.log( 'colors ' + Object.keys(inData).length);

        var ul = document.getElementById('outputColor');
        var tableBody = document.getElementById('key_value')

         for (var prop in inData) {
            var row = document.createElement('tr')
            var td_key = document.createElement('td');
            var td_value = document.createElement('td');
            td_key.innerHTML = prop;
            row.appendChild(td_key);
            td_value.innerHTML = inData[prop];
            row.appendChild(td_value);
            tableBody.appendChild(row)
        }
    }


    vehicleData.createBubbleGraph = function(selectedData) {
        var result = createBubbleGraph(selectedData);
    };

    function createBubbleGraph(selectedData) {
        //Potential Errors
        // Failed to load resource: net::ERR_CONNECTION_REFUSED
        // http://derrick.io/make_data Failed to load resource: net::ERR_CONNECTION_REFUSED
        // d3.min.js:4 Uncaught TypeError: Cannot set property 'depth' of undefined
        // Get the user choice
        var requested_data = ''

        if (selectedData == 'color') {
            requested_data = '/color_data';
        }
        else if (selectedData == 'make') {
            requested_data = '/make_data';
        }
        else {
            requested_data = '/state_data'
        }

        // main config
        var BASE_URL = "http://cors.io/?u=http://derrick.io";
        BASE_URL += requested_data;
        var width = 960; // chart width
        var height = 700; // chart height
        // var width = 760; // chart width
        // var height = 500; // chart height
        var format = d3.format(",d");  // convert value to integer
        var color = d3.scale.category20b();  // create ordial scale with 20 colors

        // bubble config
        var bubble = d3.layout.pack()
        .sort(null)  // disable sorting, use DOM tree traversal
        .size([width, height])  // chart layout size
        .padding(5)

        // svg config
        // remove any existing svg
        d3.select("svg").remove();

        var svg = d3.select("#chart").append("svg") // append to DOM
        .attr("width", width)
        .attr("height", height)
        .attr("class", "bubble");

        // tooltip config
        var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("padding", "8px")
        .style("background-color", "rgba(0, 0, 0, 0.75)")
        .style("border-radius", "6px")
        .style("font", "10px verdana")
        .text("tooltip");

        // get the data
        d3.json(BASE_URL, function(error, quotes) {
        var node = svg.selectAll('.node')
        .data(bubble.nodes(quotes).filter(function(d) {
            return !d.children;
        }))
        .enter().append('g')
        .attr('class', 'node')
        .attr('transform', function(d) {
            // console.log(d.x + ' ' + d.y);
            return 'translate(' + d.x + ',' + d.y + ')'
        });

        node.append("circle")
        .attr("r", function(d) {
            return d.r;
        })
        .style('fill', function(d) {
            return color(d.symbol);
        })

        .on("mouseover", function(d) {
            tooltip.text(d.name + ": " + (d.value));
            tooltip.style("visibility", "visible");
        })
        .on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
        })
        .on("mouseout", function(){
            return tooltip.style("visibility", "hidden");
        });

        node.append('text')
        .attr("dy", ".3em")
        .style('text-anchor', 'middle')
        .text(function(d) { return d.symbol; });
        });
    }

    return vehicleData;
})()

