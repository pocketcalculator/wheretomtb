const GOOGLE_MAPS_GEOCODING_API_KEY = 'AIzaSyB3Vcl4OPXv5kIw7P6zIQsroab_GQsOL38'
const GOOGLE_MAPS_GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
const ACCUWEATHER_API_KEY = '9wIeIXMRJpPqGKhqWXSAeuiLp8zRbqdC'
const ACCUWEATHER_GET_LOCATION_KEY_URL = 'https://dataservice.accuweather.com/locations/v1/cities/geoposition/search'
const ACCUWEATHER_CURRENT_CONDITIONS_URL = 'https://dataservice.accuweather.com/currentconditions/v1/'
const MTB_PROJECT_API_KEY = '6523910-ecc597968f8123f52f6697bda4652415'
const MTB_PROJECT_URL = 'https://www.mtbproject.com/data/get-trails'

const trails = []

//const lat = '36.0598781'
//const lon = '-84.3311592'

function getUserLocation(address) {
  const settings = {
    url: GOOGLE_MAPS_GEOCODING_URL,
    data: {
      address,
      key:  GOOGLE_MAPS_GEOCODING_API_KEY
    },
    type: 'GET',
    dataType: 'JSON',
    success: function(data){
      getMTBData(data.results[0].geometry.location)
    }
  }
  $.ajax(settings)
}

function getMTBData(location) {
  const settings = {
    url: MTB_PROJECT_URL,
    data: {
      key: MTB_PROJECT_API_KEY,
      lat: location.lat,
      lon: location.lng
    },
    type: 'GET',
    dataType: 'JSON',
    success: function(data) {
      data.trails.forEach(function(trail, index, trails) {
        const location = {
          lat: trail.latitude,
          lng: trail.longitude
        }
        getAccuWeatherLocationKey(location, trail, trails.length)
      })
    }
  }
  $.ajax(settings)
}

function getAccuWeatherLocationKey(location, trail, count) {
  const coordinates = `${location.lat},${location.lng}`
  const settings = {
    url: ACCUWEATHER_GET_LOCATION_KEY_URL,
    data: {
      apikey: ACCUWEATHER_API_KEY,
      q: coordinates
    },
    type: 'GET',
    dataType: 'JSON',
    success: function(data) {
      getRainData(data.Key, trail, count)
    }
  }
  $.ajax(settings)
}

function getRainData(locationKey, trail, count) {
  const accuweatherRainURL = `${ACCUWEATHER_CURRENT_CONDITIONS_URL}${locationKey}`
  const settings = {
    url: accuweatherRainURL,
    data: {
      apikey: ACCUWEATHER_API_KEY,
      details: true
    },
    type: 'GET',
    dataType: 'JSON',
    success: function(data) {
      trail.precipitation = data[0].PrecipitationSummary.Past24Hours.Metric.Value
      trails.push(trail)
      if ( trails.length >= count ) {
        console.log(trails)
        console.log('Done!')
      }
    }
  }
  $.ajax(settings)
}

function initMap() {
  var uluru = {lat: -25.363, lng: 131.044};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: uluru
  });

  var contentString = `<div id="content">
      <div id="siteNotice">
      </div>
      <h1 id="firstHeading" class="firstHeading">Uluru</h1>
      <div id="bodyContent">
      <p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large
      sandstone rock formation in the southern part of the
      Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi)
      south west of the nearest large town, Alice Springs; 450&#160;km
      (280&#160;mi) by road. Kata Tjuta and Uluru are the two major
      features of the Uluru - Kata Tjuta National Park. Uluru is
      sacred to the Pitjantjatjara and Yankunytjatjara, the
      Aboriginal people of the area. It has many springs, waterholes,
      rock caves and ancient paintings. Uluru is listed as a World
      Heritage Site.</p>
      <p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">
      https://en.wikipedia.org/w/index.php?title=Uluru</a>
      (last visited June 22, 2009).</p>
      </div>
      </div>`

  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  var marker = new google.maps.Marker({
    position: uluru,
    map: map,
    title: 'Uluru (Ayers Rock)'
  });
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
}

function handleSearchButton() {
  console.log('Changing!')
  $( '#submit' ).click(function(){
    event.preventDefault()
    let submittedAddress = $( '#address' ).val()
    let searchRadius = $( '#searchRadius' ).val()
    getUserLocation(submittedAddress)
  $( 'main' ).empty()
  $( 'main' ).html(`<section id="map"></section>`)
  initMap()
  })
}

handleSearchButton()
