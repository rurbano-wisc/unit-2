/* Map of GeoJSON data from MegaCities.geojson */
//declare map variable globally so all functions have access
var map;
var minValue;
//function to instantiate the Leaflet map; Create the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [38, -98],
        zoom: 5
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
//markers, popups and everythin
//function to attach popups to each mapped feature
    //call getData function
    getData(map);
};

function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var STate of data.features){
        //loop through each year
        for(var year = 1980; year <= 2015; year+=5){
              //get NumWells_ for current year
              var value = STate.properties["NumWells_"+ String(year)];
              //add value to array
              allValues.push(value);
        }
    }
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
    var minRadius = .25;
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

//refactoring duplicate code
function createPopupContent(properties, attribute){
    //add STate to popup content string
    var popupContent = "<p><b>State:</b> " + feature.properties.STate + "</p>";
    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Number of wells in " + year + ":</b>" + feature.properties[attribute] + " </p>";
    return popupContent;
};

   //POINT TO LAYER
function pointToLayer(feature, latlng, attributes){
    //Step 4. Determine the attribute for scaling the proportional symbols
    var attribute = attributes[0];
    //create marker options
    var options = {
        fillColor: "BLACK",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //popup
    var popupContent = createPopupContent(feature.properties, attribute);
                    // var popupContent = "<p><b>State:</b> " + feature.properties.STate + "</p>"; 

                    // //add formatted attribute to popup content string
                    // var year = attribute.split("_")[1];
                    // popupContent += "<p><b>Number of wells in " + year + ":</b>" + feature.properties[attribute] + " </p>";

    //bind the popup to the circle marker
                    // layer.bindPopup(popupContent);
    layer.bindPopup(popupContent, { offset: new L.Point(0,-options.radius)  });
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
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

    //set slider attributes
    document.querySelector(".range-slider").max = 7;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');
    //imgs for buttons
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>");
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>");

    //Step 5: click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 7 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 7 : index;
            };

            //Step 8: update slider
            document.querySelector('.range-slider').value = index;
            updatePropSymbols(attributes[index]);
        })
    })

    //Step 5: input listener for slider
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
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add STate to popup content string
            var popupContent = createPopupContent(props,attribute);

                            // var popupContent = "<p><b>State:</b> " + props.STate + "</p>";

                            // //add formatted attribute to panel content string
                            // var year = attribute.split("_")[1];
                            // popupContent += "<p><b>Number of wells in " + year + ":</b> " + props[attribute] + "</p>";

            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        };
    });
};
document.addEventListener('DOMContentLoaded',createMap)