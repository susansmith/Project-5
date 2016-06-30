/* Set up initial points of interest using an array */
var DataPoints = [
  {name: "Huc-A-Poos",
    id: 0,
    lat: 32.0203352,
    lng: -80.8594327,
    info: '1213 U.S. Highway 80<br>Tybee Island, GA'
  },

  {name: "North Beach Bar and Grill",
    id: 1,
    lat: 32.0218171,
    lng: -80.8460605,
    info: '33 Meddin Dr.<br>Tybee Island, GA'
  },

  {name: "MacElwee's Seafood House",
    id: 2,
    lat: 32.0124572,
    lng: -80.8443111,
    info: '101 Lovell Ave<br>Tybee Island, GA'
  },

  {name: "A-J's Dockside Restaurant",
    id: 3,
    lat: 31.9973192,
    lng: -80.8569794,
    info: '1315 Chatham Ave<br>Tybee Island, GA'
  },

  {name: "Spanky's Beachside",
    id: 4,
    lat: 31.9914566,
    lng: -80.8497592,
    info: '1605 Strand Ave<br>Tybee Island, GA'
  }
];

/* declare map as a global variable */
var map;
/* declare searchString as global Knockout observable */
var searchString = ko.observable();
/* create observable array */
LocationList = ko.observableArray([]);

/* global function to bounce icons when clicked */
function toggleBounce() {
  var self = this;
  if (self.getAnimation() !== null) {
    self.setAnimation(null);
  }
  else {
      self.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout (function () {
        self.setAnimation(null)
      }, 1450);
    };
}; /* end of function toggleBounce */

/* global function for errors with Google Maps */
function googleError() {
  alert ('Google Maps is unavailable');
}

/* initialize map with center on Tybee Island and create five markers */
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 32.0063231, lng: -80.8561358},
    zoom: 14
  });
  /* get Foursquare data */
  get4sq();
  /* apply knockout bindings to view model */
  ko.applyBindings(new ViewModel());
  /* create markers */
  createMarkers(map);
}; /* end of function initMap */

/* function to get Foursquare data */
function get4sq() {
    /* Define Foursquare Developer client ID and Secret */
    var clientID = 'K15ISE4ANS2550SGMSHGZVDW2I2NECCD0MCCAXG353AMT1Z0';
    var clientSECRET = 'TQPJ21GUX3L0LUSL2SMPAHWHD32OITQ133U2UJJVN4KWGROI';

    DataPoints.forEach(function(item) {
    /* get Foursquare data via ajax call */
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: 'https://api.foursquare.com/v2/venues/search',
      data: 'client_id='+clientID+'&client_secret='+clientSECRET+'&v=20130815&ll='+item.lat+','+item.lng+'&query='+item.name,
      async: true,
      success: function(info) {
        item.url = info.response.venues[0].url;
        },
      error: function(info) {
        alert('Foursquare data is not available');
      }
    });  /* end of Foursquare ajax call */
  }); /* end of forEach function */
} /* end of get4sq function */

/* function to create markers by cycling through the array */
function createMarkers(chart) {
    /* define a beach ball image to use for the map markers */
    var image = 'img/beachball_small.png';

    /* iterate through each data point to create a marker*/
    for (var i = 0; i < DataPoints.length; i++) {
      /* create marker */
       var marker = new google.maps.Marker({
        position: {lat: DataPoints[i].lat, lng: DataPoints[i].lng},
        map: chart,
        icon: image,
        animation: google.maps.Animation.DROP,
        title: DataPoints[i].name,
        content: DataPoints[i].info,
        id: DataPoints[i].id,
        visible: true
      }); /* end of marker */

      /* push markers to array */ 
      LocationList()[i].spot(marker);

      /* create new infowindow */
      var window = new google.maps.InfoWindow();

      /* click listener to bounce icons when clicked */
      marker.addListener('click', toggleBounce);

      /* click listener to show info window */
      marker.addListener('click', function() {
        window.setContent('<center><strong>'+this.title+'</strong><br>'+this.content+'<br>'+'<a href="' + 
         DataPoints[this.id].url  + '" target="_blank">' + DataPoints[this.id].url + '</a></center>');
        window.open(map, this);
        });

    }; /* end of for loop that creates markers */
}; /* end of createMarkers function */

/* Constructor */
var MakePlace = function(place) {
  this.name = place.name;
  this.lat = place.lat;
  this.lng = place.lng;
  this.info = place.info;
  this.spot = ko.observable();
  this.url = ko.observable(place.url);
  this.isSearchResult = ko.observable(true);
}

/***************************************/
/*create View Model */
var ViewModel = function() {
  /* ensure 'this' refers to the ViewModel */
  var self = this;

  /* iterate over initial array and create new place objects in the observable array */
  DataPoints.forEach(function(placeItem){
    LocationList.push (new MakePlace(placeItem));
  });

  this.currentPlace = ko.observable(LocationList()[0]);

  /* function to bounce map marker when list item is clicked */
  this.clicky = function(clickedPlace) {
    /* sets the current place to the clicked place */
    self.currentPlace(clickedPlace);
    /* triggers bounce and infowindow */
    google.maps.event.trigger(this.spot(), 'click');
  }; /* end of clicky */

  /* function to filter markers when searched */
  self.searchy = ko.computed(function() {
    for (var i = 0; i < LocationList().length; i++) {
      /* translates list name to all lower case */
      var LowerName = LocationList()[i].name.toLowerCase();
      /* if there's nothing in the box, all items are visible */
      if (searchString() == null) {
        LocationList()[i].isSearchResult(true);
        /* if the name includes the search string, item remains visible */
      } else if (LowerName.includes(searchString())) {
        LocationList()[i].isSearchResult(true);
        LocationList()[i].spot().setVisible(true);
        /* otherwise the item is hidden */
      } else {
        LocationList()[i].isSearchResult(false);
        LocationList()[i].spot().setVisible(false);
      };
    }; /* end of searchy for loop */
  }); /* end of searchy */
}; /* end of ViewModel */