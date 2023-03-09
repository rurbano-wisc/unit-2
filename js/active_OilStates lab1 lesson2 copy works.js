// Rachael Urbano GEOG 575                  //Leaflet Map Showing Oil Activity post 1980 
//declare map variable globally so all functions have access; which apparently the min value and control layers this needs to be done as well
var map;
var minValue;
// var controlLayers = L.control.layers();
//pretty black basemap with green overtones of landcover
var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});
// set up to allow the potential for additional basemaps--abandoned
    var basemaps = {
        "Stadia Basemap": Stadia_AlidadeSmoothDark,
        // "Basic OpenStreetMaps": basicOSM
    };
//function to instantiate the Leaflet map; Create the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [35.5, -100],
        zoom: 5
    });
    Stadia_AlidadeSmoothDark.addTo(map);
//function to attach popups to each mapped feature; call getData function
    getData();
};

//array that is very important to like everything and needs to be piped in lots of places so don't forget >>>>>>>   NumWells_    <<<<<<<<<<<
//function calcStats(data){
function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var STate of data.features){
        //loop through each year
        for(var year = 1980; year <= 2015; year+=5){
              //get NumWells_ for current year8
              var value = STate.properties["NumWells_"+ String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    // //get min, max, mean stats for our array
    // dataStats.min = Math.min(...allValues);
    // dataStats.max = Math.max(...allValues);
    // //calculate meanValue
    // var sum = allValues.reduce(function(a, b){return a+b;});
    // dataStats.mean = sum/ allValues.length;
    // //get minimum value of array--no longer need filter cleaned the data up :( do I need this though?
    // var minValue = Math.min(...allValues)
    // return minValue
    //filters out my values that are causing issues
    var greaterThan1_allValues = allValues.filter(function(value){
        return value > 1;
    });
    //tested the greaterThan1_allValues; please don't ding me for leaving these notes as they help me remember why I have the order of stuff
    // console.log(greaterThan1_allValues)
    //get minimum value of our array; god I have to build out the attribute stuff off this I believe
    var minValue = Math.min(...greaterThan1_allValues)
    return minValue;
}
//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = .40;
    //Flannery Apperance Compensation formula :| meh
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    return radius;
};
//once grab data apply these functions--IS THIS DUPLICATE, can comment out and doesn't effect
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    //if it has properties otherwise not considered
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
                                                        //value of property
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        //if/then properties can be applied to grab certain fields
        }
        layer.bindPopup(popupContent);
        }
};
//PopupContent Constructor
function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[1];
    //this is my array value right? I think this is where it's having issues. 
    this.NumWells_ = this.properties[attribute];
    this.formatted = "<p><b>State:</b> " + this.properties.STate + "</p><p><b>Number of Oil Wells " + this.year + ":</b> " + this.NumWells_ + "</p>";
};
   //POINT TO LAYER
function pointToLayer(feature, latlng, attributes){
    //Step 4. Determine the attribute for scaling the proportional symbols
    var attribute = attributes[0];
    //create marker oilWellOptions
    var oilWellOptions = {
        fillColor: "yellow",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6
    };
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);
    //Give each feature's circle marker a radius based on its attribute value
    oilWellOptions.radius = calcPropRadius(attValue);
    //create circle marker layer
    var layer = L.circleMarker(latlng, oilWellOptions);
    //build popup content string
    var popupContent = new PopupContent(feature.properties, attribute);
    //bind the popup to the circle marker
    layer.bindPopup(popupContent.formatted, {
        offset: new L.Point(0, -oilWellOptions.radius)
    });
     //return the circle marker to the L.geoJson pointToLayer option
     return layer;
    };   
//Add circle markers for point features to the map
//Example 2.1 line 34...Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};
//Create new sequence controls
function createSequenceControls(attributes){
    var SequenceControl = L.Control.extend({
        // need to be oilWellOptions? wth is this options for?
        options: {
            position: 'bottomleft'
        },
        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');
            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range"></input>')
            //add step buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/reverse.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/forward.png"></button>');
            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);
            return container;  
        }
    });
    map.addControl(new SequenceControl());    // add listeners after adding control}
    //set slider attributes
    document.querySelector(".range-slider").max = 7;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    //click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            //increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //if past the last attribute, wrap around to first attribute
                index = index > 7 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //if past the first attribute, wrap around to last attribute
                index = index < 0 ? 7 : index;
            };
            //update slider
            document.querySelector('.range-slider').value = index;
            updatePropSymbols(attributes[index]);
        })
    })
    //input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){            
        //Step 6: get the new index value
        var index = this.value;
        updatePropSymbols(attributes[index]);
    });
};
//build an attributes array from the data known as processData
function processData(data){
    //empty array to hold attributes
    var attributes = [];
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("NumWells") > -1){
            attributes.push(attribute);
        };
    };
    //check result; comment out for everything to work
    // console.log(attributes);
    return attributes;
};
//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    fetch("data/active_OilWells_2.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create an attributes array
            var attributes = processData(json);
            // calcStats(json);
            minValue = calculateMinValue(json);
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        })
};
// also does not work for adding a layer
// var geojson = new L.GeoJSON.AJAX("data\petroleumRefineries.geojson",{style:StratStyle});
// geojson.on('data:loaded', function(){
// geojson.addTo(mymap);
// });
//Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            var props = layer.feature.properties;
            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            //add city to popup content string; properly condensed!!
            var popupContent = new PopupContent(props, attribute);
            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent.formatted).update();
            
        };
    });
};
//create legend goes here?
function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            var year = attributes.split("_")[1];
            container.innerHTML = '<p class="temporalLegend">Number of oil wells in <span class="year">1980</span></p>';
            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="130px">';
            container.innerHTML += svg;
            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){
                var radius = calcPropRadius(dataStats[circles[i]]);  
                var cy = 130 - radius; 
                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="yellow" fill-opacity="0.8" stroke="#000000" cx="65"/>';
                //evenly space out labels            
                var textY = i * 20 + 20;
                 //text string            
            svg += '<text id="' + circles[i] + '-text" x="115" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " wells" + '</text>'; 
            };
            //close svg string
            svg += "</svg>";
            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend',svg);
                return container;
            }
        });
    // controlLayers.addTo(map);
    map.addControl(new LegendControl());

};
document.addEventListener('DOMContentLoaded',createMap)

// <!-- svg thing -->
// <!-- <svg id="Layer_1" width="180px" height="180px">
//     <circle fill="yellow" fill-opacity="0.8" stroke="#000000" stroke-miterlimit="10" cx="90" cy="90.001" r="89.5"/>
// </svg>  -->
// <!-- outer html of svg 
// <circle fill="yellow" fill-opacity="0.8" stroke="#000000" stroke-miterlimit="10" cx="90" cy="90.001" r="89.5"></circle> -->
