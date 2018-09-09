$("document").ready(function() {

  var distances = new Array();
  distances[0] = new Array(350, 45);
  distances[1] = new Array(500, 135);
  distances[2] = new Array(300, -45);
  distances[3] = new Array(0, -45);
    // ----------------Markers ---------------------
    var red,  na, allm; // These will be the markers for map
    var blue  =  L.markerClusterGroup();
    //Seperate the markers into red/blue/other
    var bluemarker  = [];
    var redmarker   = [];
    var namarker    = [];
    var overlaymarkers;
    var allMarkers = [];
    var markers = {};
    var baseMaps;
    var LineLayerGroup;
  // all the markers
  var baseMaps;
  var LineLayerGroup;
  // map context
  var mymap;
  var DAYTON = [39.7589, -84.1916];  // Var to point the map too
  var Streetmap, Stamen_Terrain, Esri_WorldImagery, Roads;


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
          //$('#selectedAddress').text("Map markers: "+this.getLatLng().lat);
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
              mymap.removeLayer(LineLayerGroup);
              LineLayerGroup = drawLine(bluemarker,distances, mymap);
          });
          //$('#selectedAddress').text("Got Markers: "+ location.team);
          if (location.team      == "Blue"){
              bluemarker.push(marker);
          }else if (location.team == "Red") {
              redmarker.push(marker);
          }else{
              namarker.push(marker);
          }
      }

      red   = L.markerClusterGroup().addLayers(redmarker);
      //blue  =  L.markerClusterGroup().addLayers(bluemarker);
      blue.addLayers(bluemarker);
      //blue  = L.layerGroup(bluemarker);
      na    =  L.markerClusterGroup().addLayers(namarker);
      allmarker = redmarker.concat(bluemarker);
      allmarker = allmarker.concat(namarker);
      //allm  =  L.markerClusterGroup().addLayers(allmarker);
      return allmarker
    }

   function updateDistances() {
     //Distance
      for (i = 0; i < 3; i++) {
        var name = "DisInput_0"+i.toString();
        var textd  = document.getElementById(name).value;
        if (textd.length>0){
          distances[i][0]= Number(textd);
      //    $('#selectedAddress').text(distances);
      }
      // Add to map
      mymap.removeLayer(LineLayerGroup);
      LineLayerGroup = drawLine(bluemarker,distances, mymap);
     }
  }

$('#Direction_01').on('change',function(e){
    textd =  this.options[this.selectedIndex].value;
  //  $('#selectedAddress').text(textd);
    distances[1][1]= textd;
    updateDistances();
});

$('#Direction_00').on('change',function(e){
    textd =  this.options[this.selectedIndex].value;

    distances[0][1]= textd;
    updateDistances();
});

$('#Direction_02').on('change',function(e){
    textd =  this.options[this.selectedIndex].value;

    distances[2][1]= textd;
    updateDistances();
});



    $('#DisInput_01').on('change',function(e){
        updateDistances();
    });
    $('#DisInput_02').on('change',function(e){
        updateDistances();
    });
    $('#DisInput_00').on('change',function(e){
        updateDistances();
    });
    function updateLatLng(lat,lng,reverse) {
     //$('#selectedAddress').text("here"+lat);
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
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });//.addTo(mymap);
    Stamen_Terrain = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
  	  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  	  subdomains: 'abcd',
  	  ext: 'png'
    });

    // https: also suppported.
    Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	   attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',

    });
    //---------------------------------------
    // Map choices.----------
    baseMaps = {
     "Street":Streetmap,
     "TopoMap":Stamen_Terrain,
     "WorldImagery":Esri_WorldImagery

    };
    // Set the Map ------------------------
    mymap = L.map('map',{
          layers:[Streetmap]
        }).setView(DAYTON, 15);
   L.control.layers(baseMaps).addTo(mymap);
   /*mymap.on('click', function(e) {
       alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
   })*/
   mymap.on('click', function(e) {
        var popLocation= e.latlng;
        var popup = L.popup()
        .setLatLng(popLocation)
        .setContent('<h2>Dog Location !?!</h2><p>Lat: ' + e.latlng.lat.toFixed(3) +
               "<br />Long: " + e.latlng.lng.toFixed(3) +'</p>')
        .openOn(mymap);
    });
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
          LineLayerGroup= drawLine(bluemarker,distances, mymap);
      //    $('#selectedAddress').text("Got DRAW");
          });//$.get()
          }


   function initSite() {
     $('#last_update').text(lastupdated);
     createMap();
     getmarkers();
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
