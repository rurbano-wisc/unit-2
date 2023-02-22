/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
var minValue;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [46, 77],
        zoom: 4
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
//markers, popups and everythin
//function to attach popups to each mapped feature
    //call getData function
    getData();
};

function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var city of data.features){
        //loop through each year
        for(var year = 1985; year <= 2015; year+=5){
              //get population for current year
              var value = city.properties["Pop_"+ String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}

// var sizeInfo = {
//     field:"mass_g",
//     minSize:1,
//     maxSize:10,
//     minDataValue:.1,
//     maxDataValue:28000000
//   };


//calculate the radius of each proportional symbol
function calcPropRadius(sizeInfo) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(sizeInfo/minValue,0.5715) * minRadius

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
// // create meteor icons
// var meteorLowIcon = L.icon({
//     iconUrl: 'img\meteor.svg',
//     iconSize: [25,25]
//   });
  
//   var meteorMediumIcon = L.icon({
//     iconUrl: 'img\meteor.svg',
//     iconSize: [25,25]
//   });
  
//   var meteorHighIcon = L.icon({
//     iconUrl: 'img\meteor.svg',
//     iconSize: [25,25]
//   });
            
//   // function to use different icons based the weight of meteorites
//   function meteorMass(feature){
//     var icon;
//     if (feature.properties.mass_g >= 28000000) icon = meteorHighIcon;
//     else if (feature.properties.mass_g >= 4000000) icon = meteorMediumIcon;
//     else icon = meteorLowIcon;
  
//     return icon;
//   }
          
//   // create the GeoJSON layer and call the styling function with each marker
//   var meteorMassLayer = L.geoJSON(getData,  {
//     pointToLayer: function (feature, latlng) {
//       return L.marker(latlng, {icon: meteorMass(feature)});
//     }
//   });

function pointToLayer(feature, latlng) {
    var geojsonMarkerOptions = {
        fillColor: "#FF7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    return L.circleMarker(latlng, geojsonMarkerOptions);
}








//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/MeteoriteLandings_EurAsia.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                pointToLayer: pointToLayer,
                onEachFeature: onEachFeature
            }).addTo(map);
        })
};

document.addEventListener('DOMContentLoaded',createMap)


