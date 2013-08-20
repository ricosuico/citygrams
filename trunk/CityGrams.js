(function() {

var map = null;
var dataMarks = [];
var markers = [];
var refreshInterval = 30;
var distance = 5000;
var currentZindex = 100;
var defaultZoom = 13;

var lat = 38.7201; var lng = -9.130; //lisboa

function addMarker( markers, data ) {
    var latLng = new google.maps.LatLng(data.lat, data.lon);
    var marker = new google.maps.Marker({
        position: latLng,
        draggable: false,
        icon: data.thumbnail,
        animation: google.maps.Animation.DROP,
        zIndex: ++currentZindex,
        data: data
    });
    markers.push(marker);
    google.maps.event.addListener(marker, 'click', function(evt) {
        var content = '<img width="612" height="620" src="' + marker.data.standard_resolution + '"/><br/><span class="overlayLegend">' + marker.data.desc + '</span>';
        $('#overlay').html(content).show();
    });
    google.maps.event.addListener(marker, 'mouseover', function(evt) {
        if (marker.getZIndex() === currentZindex) return;
        marker.setZIndex(++currentZindex);
        marker.setMap(map);
    });
    marker.setMap(map);
}



function refreshMap() {
    for (var dd = 0; dd < dataMarks.length; dd++) {
        var markerNotFound = true;
        for( var ff = 0; ff < markers.length; ff++) {
            if (dataMarks[dd].id === markers[ff].data.id) {
                markerNotFound = false;
                break;
            }
        }
        if (markerNotFound) {
            addMarker(markers, dataMarks[dd]);
        }
    }
    var numMarkersOnScreen = markers.length;
    for(var i = 0; i < numMarkersOnScreen - 20; i++) {
        var mrk2remove = markers.shift();
        mrk2remove.setMap(null);
    }
}



function initialize() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: defaultZoom,
        center: new google.maps.LatLng(lat, lng),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    var searchBox = new google.maps.places.SearchBox(document.getElementById('searchBox'));
    
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();
        var location = places[0].geometry.location;
        map.setCenter(location);
        lat = location.lat(); lng = location.lng();
        var numMarkersOnScreen = markers.length;
        for(var i = 0; i < numMarkersOnScreen; i++) {
            var mrk2remove = markers.shift();
            mrk2remove.setMap(null);
        }
        map.setZoom(defaultZoom);
        reloadData();
    });

}

function reloadData() {
    var min_timestamp = Math.round(new Date().getTime() / 1000) - refreshInterval;
    var URL = "https://api.instagram.com/v1/media/search?lat=" + lat + "&lng=" + lng + "&distance=" + distance + "&min_timestamp=" + min_timestamp + "&client_id=22aaafad8e8447cf883c2cbb55663de5&_=1376665555131";
    $.ajax({url:URL, async:false, crossDomain: true, dataType: 'jsonp'}).done(function(result){
        for(var i = 0; i < result.data.length; i++) {
            var mark = {
                lat: result.data[i].location.latitude,
                lon: result.data[i].location.longitude,
                desc: result.data[i].caption === null ? '' : result.data[i].caption.text,
                thumbnail: result.data[i].images.thumbnail.url,
                standard_resolution: result.data[i].images.standard_resolution.url,
                id: result.data[i].id
            };
            dataMarks.push(mark);
        }
        refreshMap();
    });
}

function closeOverlay() {
    $('#overlay').hide();
}

$(document).ready(function(){
    reloadData();
    setInterval(reloadData, refreshInterval * 1000);
    initialize();
    $('#overlay').click(closeOverlay);
});
    
})();