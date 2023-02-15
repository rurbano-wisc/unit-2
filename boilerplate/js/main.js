// center map

//create a Leaflet map with the geojson data
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        //focus over center of data distribution
        center: [47, 48],
        zoom: 4
    });

    //add OSM base tilelayer, no access token needed
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/MeteoriteLandings_EurAsian.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            
        
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json).addTo(map);
        })
};

document.addEventListener('DOMContentLoaded',createMap)

//style point features

//var geojsonMarkerOptions = {
//    radius: 8,
//    fillColor: '#ff7800',
//    color: '#000',
//    weight: 1,
//    opacity: 1,
//    fillOpacity: .8
//};
//L.geoJSON(someGeojsonFeature, {
//    pointToLayer: function (feature,latlng){
//        return L.circleMarker(latlng, geojsonMarkerOptions);
//    }
//})addTo(map);
    //Example 2.3 load the data    
        .then(function(json){            
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        });  

