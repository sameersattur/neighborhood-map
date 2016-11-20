// Adding styles to the map
var styles = [{
    "featureType": "water",
    "stylers": [{
        "color": "#19a0d8"
    }]
}, {
    "featureType": "administrative",
    "elementType": "labels.text.stroke",
    "stylers": [{
        "color": "#ffffff"
    }, {
        "weight": 6
    }]
}, {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [{
        "color": "#e85113"
    }]
}, {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{
        "color": "#efe9e4"
    }, {
        "lightness": -40
    }]
}, {
    "featureType": "road.arterial",
    "elementType": "geometry.stroke",
    "stylers": [{
        "color": "#efe9e4"
    }, {
        "lightness": -20
    }]
}, {
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": [{
        "lightness": 100
    }]
}, {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{
        "lightness": -100
    }]
}, {
    "featureType": "road.highway",
    "elementType": "labels.icon"
}, {
    "featureType": "landscape",
    "elementType": "labels",
    "stylers": [{
        "visibility": "off"
    }]
}, {
    "featureType": "landscape",
    "stylers": [{
        "lightness": 20
    }, {
        "color": "#efe9e4"
    }]
}, {
    "featureType": "landscape.man_made",
    "stylers": [{
        "visibility": "off"
    }]
}, {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{
        "lightness": 100
    }]
}, {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{
        "lightness": -100
    }]
}, {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{
        "hue": "#11ff00"
    }]
}, {
    "featureType": "poi",
    "elementType": "labels.text.stroke",
    "stylers": [{
        "lightness": 100
    }]
}, {
    "featureType": "poi",
    "elementType": "labels.icon",
    "stylers": [{
        "hue": "#4cff00"
    }, {
        "saturation": 58
    }]
}, {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{
        "visibility": "on"
    }, {
        "color": "#f0e4d3"
    }]
}, {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [{
        "color": "#efe9e4"
    }, {
        "lightness": -25
    }]
}, {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [{
        "color": "#efe9e4"
    }, {
        "lightness": -10
    }]
}, {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{
        "visibility": "simplified"
    }]
}]

// functions for opening and closing side menu  
function openSideMenu() {
    document.getElementById("sideMenu").style.width = "250px";
}

function closeSideMenu() {
    document.getElementById("sideMenu").style.width = "0";
}

var maps;

// Creating locations array 
// Model 
var locations = [{
    name: 'Madikeri',
    lat: 12.4244,
    lng: 75.7382

}, {
    name: 'Gol Gumbaz',
    lat: 16.8303,
    lng: 75.7361

}, {
    name: 'Hampi',
    lat: 15.3350,
    lng: 76.4600

}, {
    name: 'Ranganathittu Bird Sanctuary',
    lat: 12.4244,
    lng: 76.6563

}, {
    name: 'Jog Falls',
    lat: 14.2294,
    lng: 74.8125

}, {
    name: 'Bannerghatta National Park',
    lat: 12.8009,
    lng: 77.5777

}];

self.active = ko.observable();

// View
var Location = function(locDetails) {
    var self = this;
    this.name = locDetails.name;
    this.lat = locDetails.lat;
    this.lng = locDetails.lng;
    this.wikiSnippet = "";
    this.visible = ko.observable(true);

    //Function to display error message in case of Wiki request timeout
    var wikiRequestTimeout = setTimeout(function() {
        self.wikiSnippet = "Unable to access Wikipedia";
    }, 1000);

    // URL for wiki search 
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + this.name + '&limit=1&format=json&callback=wikiCallback';
    $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        success: function(locDetails) {
            self.infoWindow.setContent("Still loading !");
            // add the wikiSnippet data
            self.wikiSnippet = locDetails[2];
            if (self.wikiSnippet == "") {
                self.wikiSnippet = "Wikipedia article is not available!";
            }
            clearTimeout(wikiRequestTimeout);
        },
    });


    this.contentString = '<div class="info-window-content"><div class="title"><b>' + locDetails.name + "</b></div>" +
        '<div class="content">' + self.wikiSnippet + "</div>";

    this.infoWindow = new google.maps.InfoWindow({
        content: self.contentString
    });

    // Adding the markers
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(locDetails.lat, locDetails.lng),
        map: maps,
        title: locDetails.name
    });

    // Display the markers
    this.showMarker = ko.computed(function() {
        if (this.visible() === true) {
            this.marker.setMap(maps);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    // show information when the marker is clicked
    this.marker.addListener('click', function() {
        self.contentString = '<div class="info-window-content"><div class="title"><b>' + locDetails.name + "</b></div>" +
            '<div class="content">' + self.wikiSnippet + "</div>";

        self.infoWindow.setContent(self.contentString);

        self.infoWindow.open(map, this);

        // infowindow disappears after specified time
        setTimeout(function() {
            self.infoWindow.close();
        }, 3500);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2000);
    });

    this.bounce = function(placeList) {
        google.maps.event.trigger(self.marker, 'click');
    }

};

// ViewModel
function ViewModel() {
    var self = this;
    this.searchTerm = ko.observable("");
    this.locationList = ko.observableArray([]);

    // Creating map
    maps = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: {
            lat: 15.3173,
            lng: 75.7139
        },
        mapTypeControl: false,
        styles: styles

    });


    // Add location
    locations.forEach(function(locationItem) {
        self.locationList.push(new Location(locationItem));
    });

    // Function for searching and filtering the locations in the list

    this.filteredList = ko.computed(function() {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function(locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

    // Function to resize the map according to screen size and make it responsive
    google.maps.event.addDomListener(window, "resize", function() {
        var center = maps.getCenter();
        google.maps.event.trigger(maps, "resize");
        maps.setCenter(center);

    });


}

function initMap() {
    var vm = new ViewModel();
    ko.applyBindings(vm);
}

// Google Error
function googleError() {
    alert("There is a problem loading google maps!!!");
}