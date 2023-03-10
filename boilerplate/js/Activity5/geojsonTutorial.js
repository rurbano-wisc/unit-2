//geojsonTutorial.js
//declare where map is
var map = L.map('map').setView([39.75621, -105], 13);

//openstreetmap in this case tileset added to map for reference
var tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?pk.eyJ1IjoicnVyYmFubyIsImEiOiJjbGFoanRxYWkwY3c5M3dta2RhdzNlYXppIn0.HebbeRpuABArQDdvwTJhEQ', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

tileLayer.addTo(map);
        //credit to streetmap

//simple geojsonFeature
//this is essentially equivalent to one row, marks coors field
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// objects added to map through geojson layer; created and added to map
L.geoJSON(geojsonFeature).addTo(map);

//geojson obj can be passed as an array of geojson objects
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

//create an empty GeoJSON layer, assign to a variable, add more features later
var myLayer = L.geoJSON().addTo(map);
myLayer.addData(geojsonFeature);


//style options
// simple object that styles all paths (polylines and polygons) the same way
//this creates line features at an angle specifically
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

//determines line style characteristics, in this case orange lines!
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

//adds the lines
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

//one function
//function that styles individual features based on their properties, in this case a rectangle of coordinates
//makes ND red based on envelope
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    //makes Colorado blue
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

//colors the features based on party value with a corresponding color
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);
//


//default simple markers are drawn for GeoJSON Points
//altered this by passing pointToLayer function in a GeoJSON options, in this case for circle markers that are orange

//rename to orangecircleOptions ??
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);


//called on each feature before adding it to a GeoJSON layer; commonly used to attach a popup to features when clicked
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}
//describe features with a set of properties 
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
//using onEachFeature which gets caled on each feature before adding to layer
L.geoJSON(geojsonFeature, {
    //parameter of method        :      //created at line134
    onEachFeature: onEachFeature
}).addTo(map);

//filters records, controls visibility of geojson features
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);