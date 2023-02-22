//geojsonTutorial.js

//Example 2.3: The complete adaptedTutorial.js script to create a Leaflet map with the MegaCities.geojson data
/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/MeteoriteLandings_Europe.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json).addTo(map);
        })
};

document.addEventListener('DOMContentLoaded',createMap)

//create proportional symbols based on one of the attributes in the dataset.
//Implement styled retrieve popups for the features on your Leaflet map.
//In your main.js script, create a slider and step buttons for sequencing your Leaflet map.
//Integrate your sequencing controls with your map to resymbolize the features correctly and change the popup or information panel content on each retrieve interaction.
//