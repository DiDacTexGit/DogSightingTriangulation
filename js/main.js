$("document").ready(function() {
  // all the markers
;
  var distances = new Array();
  distances[0] = new Array(300, 45);
  distances[1] = new Array(100, 0);
  distances[2] = new Array(200, -45);
  distances[3] = new Array(150, -45);
  // ----------------Markers ---------------------
  var red, blue, na, allm; // These will be the markers for map
    //Seperate the markers into red/blue/other
    var bluemarker  = [];
  var redmarker   = [];
  var namarker    = [];
  var overlaymarkers;
  var allMarkers = [];
  var markers = {};
  var baseMaps;
  var line;
  // map context
  var mymap;
  var DAYTON = [39.7589, -84.1916];  // Var to point the map too
  var Streetmap, Stamen_Terrain, Esri_WorldImagery, Roads;
  var start;
  var marker;

  function drawmarkers(infoTemplate, locations){
    var len      = locations.length;

    var location;
    for (i = 0; i < len; i++) {
        location  = locations[i];
        // Here we're defining a new icon to use on our map.
        var icondir     = 'icons/';
        var iconpre     = '.png';
        var iconname    = icondir.concat(location.icon,iconpre);
        var customIcon  = L.icon({
                   iconUrl: iconname,
                   iconSize: [65,65]
               });

        var marker = new L.marker([location.latitude, location.longitude], {
                icon: customIcon, draggable:'true'});
        marker.bindPopup(L.Util.template(infoTemplate,location));

        marker.on('dragend', function (e) {
          $('#selectedAddress').text("Map markers: "+this.getLatLng().lat);
            marker = this;
            location.latitude  = marker.getLatLng().lat;
            location.longitude = marker.getLatLng().lng;
            var strToParse = marker.getPopup().getContent();
            var el = document.createElement('html');
            el.innerHTML  = strToParse
            location.name = el.getElementsByTagName("H2")[0].innerHTML;
            location.description  = el.getElementsByTagName("p")[0].innerHTML.substring(5);
            location.phone = el.getElementsByTagName("p")[1].innerHTML.substring(6);
            marker.bindPopup(L.Util.template(infoTemplate,location));
            $('#selectedAddress').text("pp up: "+marker.getPopup().getContent());
            var newline =[];
            newline.push(marker);
            mymap.removeLayer(line);
            //removeLayer(LineLayer).removeFrom(mymap);
          //  L.layerGroup().clearLayers();
            line=drawLine(newline, mymap);

        });
        $('#selectedAddress').text("Got Markers: "+ location.team);
        if (location.team      == "Blue"){
            bluemarker.push(marker);
        }else if (location.team == "Red") {
            redmarker.push(marker);
        }else{
            namarker.push(marker);
        }
    }

    red   = L.markerClusterGroup().addLayers(redmarker);
    blue  =  L.markerClusterGroup().addLayers(bluemarker);
    //blue  = L.layerGroup(bluemarker);
    na    =  L.markerClusterGroup().addLayers(namarker);
    allmarker = redmarker.concat(bluemarker);
    allmarker = allmarker.concat(namarker);
    //allm  =  L.markerClusterGroup().addLayers(allmarker);
    return allmarker
  }


  function updateLatLng(lat,lng,reverse) {
   $('#selectedAddress').text("here"+lat);
    if(reverse) {
      marker.setLatLng([lat,lng]);
      mymap.panTo([lat,lng]);
    } else {
      //document.getElementById('latitude').value = marker.getLatLng().lat;
      //document.getElementById('longitude').value = marker.getLatLng().lng;
      mymap.panTo([lat,lng]);
  }

  }


  function read_in_markers(data){
    //Read in data and return markers
    // jQuery gives us back the data as a big string, so the first step
    // is to split on the newlines
    var lines     = data.split('\n');
    var i, values;
    var len       = lines.length;
    var locations =[];
    for (i = 0; i < len; i++) {
        // for each line, split on the tab character. The lat and long
        // values are in the first and second positions respectively.
        values    = lines[i].split('\t');
        // ignore header line of the csv as well as the ending newline
        // keep lines that have a numeric value in the first, second slot
        if (!isNaN(values[0]) && !isNaN(values[1])) {
            locations.push({
                latitude:   Number(values[0]),
                longitude:  Number(values[1]),
                name:         values[2],
                description:  values[3],
                team:         values[4],
                phone:        values[5],
                icon:         values[6]
            });
        }
    }
    return locations;
  }

  function createMap(){
    //-------------Different Types of Maps---------
    Streetmap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 22,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });//.addTo(mymap);
    Stamen_Terrain = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
  	  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  	  subdomains: 'abcd',
  	  minZoom: 0,
  	  maxZoom: 18,
  	  ext: 'png'
    });
    Roads = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/roads_and_labels/{z}/{x}/{y}.png', {
 	    attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    // https: also suppported.
    Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	   attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
     maxZoom:18
    });
    //---------------------------------------
    // Map choices.----------
    baseMaps = {
     "Street":Streetmap,
     "TopoMap":Stamen_Terrain,
     "WorldImagery":Esri_WorldImagery,
     "Roads_Labels":Roads
    };
    //
    // Set the Map ------------------------
    mymap = L.map('map',{
          layers:[Streetmap]
        }).setView(DAYTON, 15);
   //L.control.layers(baseMaps).addTo(mymap);
   }

   function getmarkers(){
      $.get('/data/callins.txt', function(data) {
         locations = read_in_markers(data);
         // infoTemplate is a string template for use with L.Util.template()
         var infoTemplate = '<h2>{name}</h2><p>Info: {description}</p>\
                             <p>Phone: {phone}</p>\
                             <p>Lat: {latitude}</p>\
                             <p>Long: {longitude}</p>';
       allmarker = drawmarkers(infoTemplate, locations);
       allm  =  L.markerClusterGroup().addLayers(allmarker);
       allm.addTo(mymap);
       // Now we can zoom the map to the extent of the markers
       mymap.fitBounds(allm.getBounds());
       //-------------Setting up the map ---------------
       overlaymarkers={
           "Red Team": red,
           //"Blue Team":blue,
           "<img src='icons/female_blue_sm.png'/>":blue,
           "Support":na,
           "All": allm
       }
       //L.control.l  ayers(overlaymarkers, baseMaps).addTo(mymap);
       line= drawLine(bluemarker, mymap);
       $('#selectedAddress').text("Got DRAW");
       });//$.get()
       $('#selectedAddress').text("Here "+bluemarker.length.toString()+" End");
     }


   function initSite() {
     $('#last_update').text(lastupdated);
     createMap();
     getmarkers();
    //$('#selectedAddress').text("here"+bluemarker.length.toString()+" End");
     //  getmarkers();
    // drawLine(bluemarker);
   };
 initSite();




  //HTML5 input placeholder fix for < ie10
  $('input, textarea').placeholder();

  function uiFixes() {
     //JS to fix the Twitter Typeahead styling, as it is unmodifyable in the bower folder
    $('.twitter-typeahead').css('display', '');
    //Fix for the Twitter Typeahead styling of the pre tag causing issues with horizontal scrolling in conentpanel
    $('pre').css("margin-left", "-50%");
  }

  uiFixes();

  //JS FAQ triggers

  function clickedFAQ(element) {
    var clickedFAQ = element.id;
    var expandFAQ = clickedFAQ + "-expand";
    var isExpandedFAQ = $("#"+expandFAQ).css("display");

    if (isExpandedFAQ === "block"){
      $("#"+expandFAQ).hide("slow");
      $("#"+expandFAQ+" *").hide("slow");
      $("#"+clickedFAQ+" h4 span.expanded-icon").replaceWith("<span class='expand-icon'>+</span>");
      console.log(clickedFAQ+" h4 span.expand-icon");
    }else{

      $("#"+expandFAQ).show();
      $("#"+expandFAQ+" *").show("fast");
      $("#"+clickedFAQ+" h4 span.expand-icon").replaceWith("<span class='expanded-icon'>&#8210;</span>");
    }
  }



  $("[id^=FAQ-]").click( function() {
    clickedFAQ(this);
  });
});
