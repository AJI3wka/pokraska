// When the window has finished loading create our google map below
google.maps.event.addDomListener(window, 'load', init);

function init() {
    // Basic options for a simple Google Map
    // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var bounds = new google.maps.LatLngBounds();
    var center = new google.maps.LatLng(56.830433, 60.6584259);
    bounds.extend(center);
    var loc = new google.maps.LatLng(56.830433, 60.6584259);
    bounds.extend(loc);
    var loc1 = new google.maps.LatLng(59.9656123, 30.3722275);
    bounds.extend(loc1);
    var loc2 = new google.maps.LatLng(55.845907, 37.4753752);
    bounds.extend(loc2);
    var loc3 = new google.maps.LatLng(44.714886, 37.783957);
    bounds.extend(loc3);
    var loc4 = new google.maps.LatLng(61.25411, 73.414571);
    bounds.extend(loc4);

    var mapOptions = {
        // How zoomed in you want the map to start at (always required)
        zoom: 17,
        scrollwheel: false,
        streetViewControl: false,
        panControl: false,
        disableDefaultUI: true,
        panControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        },

        // The latitude and longitude to center the map (always required)
        center: center, // New York

        // How you would like to style the map. 
        // This is where you would paste any style found on Snazzy Maps.
        styles:

            [{
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#444444"
            }]
        }, {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{
                "color": "#f2f2f2"
            }]
        }, {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "poi.business",
            "elementType": "geometry.fill",
            "stylers": [{
                "visibility": "on"
            }]
        }, {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{
                "saturation": -100
            }, {
                "lightness": 45
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                "color": "#b4d4e1"
            }, {
                "visibility": "on"
            }]
        }]
    };

    // Get the HTML DOM element that will contain your map 
    // We are using a div with id="map" seen below in the <body>
    var mapElement = document.getElementById('map');

    var map = new google.maps.Map(mapElement, mapOptions);


    // var marker = new google.maps.Marker({
    //     position: loc,
    //     map: map,
    //     icon: {
    //         url: '../img/point.png',
    //         size: new google.maps.Size(47, 71),
    //         origin: new google.maps.Point(0, 0),
    //         anchor: new google.maps.Point(23, 71)
    //     },
    //     title: 'Fortis'
    // });

    map.fitBounds(bounds);//autozoom



    var overlay;

        
        //var gmap = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
        
        function HTMLMarker(lat,lng,txt,id){
            this.lat = lat;
            this.lng = lng;
            this.pos = new google.maps.LatLng(lat,lng);
            this.txt = txt;

            this.id_t = id
        }
        
        HTMLMarker.prototype = new google.maps.OverlayView();
        HTMLMarker.prototype.onRemove= function(){}
        
        //init your html element here
        HTMLMarker.prototype.onAdd= function(){
            this.div = document.createElement('DIV');
            this.div.className = "arrow_box";
            if (this.id_t == 2) {
                this.div.innerHTML = "<div class='map_point active' data-id="+this.id_t+">"+this.txt+"</div>";

            }else{
               this.div.innerHTML = "<div class='map_point' data-id="+this.id_t+">"+this.txt+"</div>";

            }
            var panes = this.getPanes();
            panes.overlayImage.appendChild(this.div);
            google.maps.event.addDomListener(this.div, "click", function(event) { 

                document.querySelectorAll('.map_point').forEach(function(item) {
                  item.classList.remove('active')
                });

                
                event.target.classList.add('active');
                console.log(event.target);
            
                document.querySelectorAll('.map_id').forEach(function(item) {
                    if(item.getAttribute('data-id')== event.target.getAttribute('data-id')){

                        item.classList.add('active')
                    }else{

                        item.classList.remove('active')
                    }
                });


            });
        }
        
        HTMLMarker.prototype.draw = function(){
            var overlayProjection = this.getProjection();
            var position = overlayProjection.fromLatLngToDivPixel(this.pos);
            var panes = this.getPanes();
            this.div.style.left = position.x + 'px';
            this.div.style.top = position.y - 20 + 'px';
        }
        
        //to use it
        var htmlMarker = new HTMLMarker(56.830433, 60.6584259,'Е',0);
        htmlMarker.setMap(map);
        var htmlMarker1 = new HTMLMarker(59.9656123, 30.3722275,'СП',1);
        htmlMarker1.setMap(map);
        var htmlMarker2 = new HTMLMarker(55.845907, 37.4753752,'М',2);
        htmlMarker2.setMap(map);
        var htmlMarker3 = new HTMLMarker(44.714886, 37.783957,'Н',3);
        htmlMarker3.setMap(map);
        var htmlMarker4 = new HTMLMarker(61.25411, 73.414571,'СУ',4);
        htmlMarker4.setMap(map);

      

}
