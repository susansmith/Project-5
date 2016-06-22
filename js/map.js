/* Set up initial points of interest using an array */
var DataPoints = [
  {name: "Huc-A-Poos",
   lat: 32.0203352,
   lng: -80.8594327,
   info: '1213 U.S. Highway 80<br>Tybee Island, GA'
  },

  {name: "North Beach Bar and Grill",
   lat: 32.0218171,
   lng: -80.8460605,
   info: '33 Meddin Dr.<br>Tybee Island, GA'
   },

  {name: "MacElwee's Seafood House",
   lat: 32.0124572,
   lng: -80.8443111,
   info: '101 Lovell Ave<br>Tybee Island, GA'
  },

  {name: "A-J's Dockside Restaurant",
  lat: 31.9973192,
  lng: -80.8569794,
  info: '1315 Chatham Ave<br>Tybee Island, GA'
  },

  {name: "Spanky's Beachside",
   lat: 31.9914566,
   lng: -80.8497592,
   info: '1605 Strand Ave<br>Tybee Island, GA'
  }
];


/* Global function to bounce icons when clicked */
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


/* initialize map with center on Tybee Island and create five markers */
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 32.0063231, lng: -80.8561358},
    zoom: 14
  });
  createMarkers(map, DataPoints);
}; /* end of function initMap */


/* function to create markers by cycling through the array */
function createMarkers(chart,stuff) {
    /* define a beach ball image to use for the map markers */
    var image = 'img/beachball_small.png';

    /* iterate through each data point to create a marker*/
    for (var i = 0; i < stuff.length; i++) {
      /* create marker */
       var marker = new google.maps.Marker({
        position: {lat: stuff[i].lat, lng: stuff[i].lng},
        map: chart,
        icon: image,
        animation: google.maps.Animation.DROP,
        title: stuff[i].name,
        content: stuff[i].info
      }); /* end of marker */

      /* push markers to array */ 
      stuff[i].spot = marker;
      console.log(stuff[i].spot); /* good! Marker is there */

      /* get Foursquare data */
      /* Define Foursquare Developer client ID and Secret */
      var clientID = 'K15ISE4ANS2550SGMSHGZVDW2I2NECCD0MCCAXG353AMT1Z0';
      var clientSECRET = 'TQPJ21GUX3L0LUSL2SMPAHWHD32OITQ133U2UJJVN4KWGROI';
      var FourURL;
      /* get Foursquare data via ajax call */
      $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'https://api.foursquare.com/v2/venues/search',
        data: 'client_id='+clientID+'&client_secret='+clientSECRET+'&v=20130815&ll='+stuff[i].lat+','+stuff[i].lng+'&query='+stuff[i].name,
        async: true,
        success: function(info) {
          FourURL = info.response.venues[0].url;
          console.log(FourURL); /* good, url information is correct */
          return FourURL;
        },
        error: function(info) {
          alert('Foursquare data is not available');
        }
      });  /* end of Foursquare ajax call */


      /* create new infowindow */
      var window = new google.maps.InfoWindow();

      /* click listener to bounce icons when clicked */
      marker.addListener('click', toggleBounce);

      /* click listener to show info window */
      marker.addListener('click', function() {
        window.setContent('<center><strong>'+this.title+'</strong><br>'+this.content+'<br>'+FourURL+'</center>');
        /* FourURL is only the last one retrieved */
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
  this.spot = place.spot;
  this.url = ko.observable();
}

/***************************************/
/*create View Model */
var ViewModel = function() {
  /* ensure 'this' refers to the ViewModel */
  var self = this;

  /* create observable array */
  LocationList = ko.observableArray([]);

  /* iterate over initial array and create new place objects in the observable array */
  DataPoints.forEach(function(placeItem){
    LocationList.push (new MakePlace(placeItem));
    createMarkers (map, LocationList);
  });

  console.log(LocationList()[0].info); /* good */
  console.log(LocationList()[0].spot); /* function */
  console.log(LocationList()[0].url); /* function */

  this.currentPlace = ko.observable(LocationList()[0]);

  /* function to bounce map marker when list item is clicked */
  this.clicky = function(clickedPlace) {
    self.currentPlace(clickedPlace);
    console.log (this.name); /* GOOD - changes when items are clicked */
    /* need to associate bounce and infoWindow here */
  }; /* end of clicky */

}; /* end of ViewModel */

/* apply knockout bindings to view model */
ko.applyBindings(new ViewModel());
