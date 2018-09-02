$("document").ready(function() {
  // all the markers
  var allmarkers = [];
  // ----------------Markers ---------------------
  var red, blue, na, allm; // These will be the markers for map
  var bluemarker  = [];  //Seperate the markers into red/blue/other
  var redmarker   = [];
  var namarker    = [];
  var overlaymarkers;
  var allmarker;
  var baseMaps;
  // map context
  var mymap;
  var DAYTON = [39.7589, -84.1916];  // Var to point the map too
  var Streetmap, Stamen_Terrain, Esri_WorldImagery, Roads;
  var start;


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
  // L.control.layers(baseMaps).addTo(mymap);
   }
function getmarkers(){
  $.get('/data/callins.txt', function(data) {
      // jQuery gives us back the data as a big string, so the first step
      // is to split on the newlines
      var lines     = data.split('\n');
      var i, values;
      var len       = lines.length;
      var locations = [];
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
      // infoTemplate is a string template for use with L.Util.template()
      var infoTemplate = '<h2>{name}</h2><p>Info: {description}</p><p>Phone: {phone}</p>';
      // Ok, now we have an array of locations. We can now plot those on our map!
      len      = locations.length;
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
          var marker;
              marker      = L.marker([location.latitude, location.longitude], {
                  icon: customIcon
              });
              marker.bindPopup(L.Util.template(infoTemplate,location));
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
    //L.control.layers(overlaymarkers, baseMaps).addTo(mymap);
    });//$.get()
  }
  function getnewLat(latitude,dist){
    //distance in meters
    var r_earth = 6378 //km
    dist = dist/1000; //convert to meters
    var new_latitude  = latitude  + (dist / r_earth) * (180 / Math.PI);
    //var new_longitude = longitude + (dx / r_earth) * (180 / pi) / cos(latitude * pi/180);
    return new_latitude;
  }
  function getnewLong(longitude,latitude,dist){
    //distance in meters
    var r_earth = 6378 ;//km
    dist = dist/1000; //convert to meters
    var new_longitude = longitude + (dist / r_earth) * (180 / Math.PI) / Math.cos(latitude * Math.PI/180);
    return new_logitude;
  }
  function toRad(n) {//https://gist.github.com/mathiasbynens/354587
 return n * Math.PI / 180;
};
function toDeg(n) {//https://gist.github.com/mathiasbynens/354587
 return n * 180 / Math.PI;
};
function destVincenty(lat1, lon1, brng, dist) {//https://gist.github.com/mathiasbynens/354587
 var a = 6378137,
     b = 6356752.3142,
     f = 1 / 298.257223563, // WGS-84 ellipsiod
     s = dist,
     alpha1 = toRad(brng),
     sinAlpha1 = Math.sin(alpha1),
     cosAlpha1 = Math.cos(alpha1),
     tanU1 = (1 - f) * Math.tan(toRad(lat1)),
     cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1,
     sigma1 = Math.atan2(tanU1, cosAlpha1),
     sinAlpha = cosU1 * sinAlpha1,
     cosSqAlpha = 1 - sinAlpha * sinAlpha,
     uSq = cosSqAlpha * (a * a - b * b) / (b * b),
     A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
     B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
     sigma = s / (b * A),
     sigmaP = 2 * Math.PI;
 while (Math.abs(sigma - sigmaP) > 1e-12) {
  var cos2SigmaM = Math.cos(2 * sigma1 + sigma),
      sinSigma = Math.sin(sigma),
      cosSigma = Math.cos(sigma),
      deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
  sigmaP = sigma;
  sigma = s / (b * A) + deltaSigma;
 };
 var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1,
     lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1, (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)),
     lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1),
     C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha)),
     L = lambda - (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM))),
     revAz = Math.atan2(sinAlpha, -tmp); // final bearing
  var LatLon =  [toDeg(lat2), lon1 + toDeg(L)];
 return LatLon;
};
  var marker = L.marker([39.7316757, -84.17587]);//.addTo(mymap);

  function drawLine(){
      var raw_dist = 500;
  
      var angle = 25;
      //var end_x = marker.getLatLng().lng // * Math.cos(angle * Math.PI / 180);
      //var end_y = start.getLatLng().lat;// + length// * Math.sin(angle * Math.PI / 180);
      LatLon = destVincenty(marker.getLatLng().lat, marker.getLatLng().lng, angle,raw_dist);
      //var LatLon=[39.7316757, -84.27587];
      //var end = L.marker([LatLon[0],LatLon[1]]).addTo(mymap);
      var end = L.marker([LatLon[0], LatLon[1]]).addTo(mymap);
      var line = L.polyline([marker.getLatLng(), end.getLatLng()]).addTo(mymap);
  }

   function initSite() {
     $('#last_update').text(lastupdated);
     //  getmarkers();
     createMap();
     getmarkers();
     drawLine();
   }

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
