//quickstartTutorial.js
//initialize the map using OpenStreetMap tiles and set its view coordinates & a zoom level
var map = L.map('map').setView([51.505, -0.09], 13);

//add tile layer to map                                    //added ? and access token
//<<is this beginning part needed?
var tileLayer L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?pk.eyJ1IjoicnVyYmFubyIsImEiOiJjbGFoanRxYWkwY3c5M3dta2RhdzNlYXppIn0.HebbeRpuABArQDdvwTJhEQ', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
        //credit to streetmap

//used to add markers
var marker = L.marker([51.5, -0.09]).addTo(map);

//used to add circles
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

//used to add polygons
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//add popups
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//handles automatic closing of a previously opened popup when opening a new one 
var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

//dealing with events
function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

map.on('click', onMapClick);

//popup instead of alert
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);