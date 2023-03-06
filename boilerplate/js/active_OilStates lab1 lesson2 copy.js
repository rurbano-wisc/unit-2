// Rachael Urbano GEOG 575 
//Leaflet Map Showing Oil Activity post 1980 

//declare map variable globally so all functions have access; which apparently the min value and control layers this needs to be done as well
var map;
var minValue;
var controlLayers = L.control.layers();

var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});
// if I want to add OSM
// var basicOSM = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
// });
    var basemaps = {
        "Stadia Basemap": Stadia_AlidadeSmoothDark,
        // "Basic OpenStreetMaps": basicOSM
    };
//function to instantiate the Leaflet map; Create the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [37, -100],
        zoom: 5
    });
    Stadia_AlidadeSmoothDark.addTo(map);
//function to attach popups to each mapped feature; call getData function
    getData();
};

function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var STate of data.features){
        //loop through each year
        for(var year = 1980; year <= 2015; year+=5){
              //get population for current year
              var value = STate.properties["NumWells_"+ String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //filters out my values that are causing issues
    var greaterThan1_allValues = allValues.filter(function(value){
        return value > 1;
    });
    //tested the greaterThan1_allValues
    // console.log(greaterThan1_allValues)

    //get minimum value of our array
    var minValue = Math.min(...greaterThan1_allValues)
    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = .35;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    return radius;
};
//once grab data apply these functions
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
        fillOpacity: 0.8
    };
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    oilWellOptions.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, oilWellOptions);

    //build popup content string
    var popupContent = "<p><b>State:</b> " + feature.properties.STate + "</p>"; 

    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Number of wells in " + year + ":</b>" + feature.properties[attribute] + " </p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);
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
            //do I need to replace div with slidecontainer
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')
            
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
            minValue = calculateMinValue(json);
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        })
};
//Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            var props = layer.feature.properties;
            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            //add city to popup content string
            var popupContent = "<p><b>State:</b> " + props.STate + "</p>";
            //add formatted attribute to popup content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Number of wells in " + year + ":</b> " + props[attribute] + "</p>";
            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent).update();
            
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
            //I think I need to change something here
            var container = L.DomUtil.create('div', 'legend-control-container');
            container.innerHTML = '<p class="temporalLegend">Number of oil wells in <span class="year">1980</span></p>';
            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="130px">';
            //add attribute legend svg to container
            container.innerHTML += svg;
            return container;
        }
    });
    // controlLayers.addTo(map);
    map.addControl(new LegendControl());

};
document.addEventListener('DOMContentLoaded',createMap)