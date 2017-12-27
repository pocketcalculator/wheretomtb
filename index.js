const GOOGLE_MAPS_GEOCODING_API_KEY = 'AIzaSyB3Vcl4OPXv5kIw7P6zIQsroab_GQsOL38'
const GOOGLE_MAPS_GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
const ACCUWEATHER_API_KEY = '9wIeIXMRJpPqGKhqWXSAeuiLp8zRbqdC'
const ACCUWEATHER_GET_LOCATION_KEY_URL = 'https://dataservice.accuweather.com/locations/v1/cities/geoposition/search'
const ACCUWEATHER_CURRENT_CONDITIONS_URL = 'https://dataservice.accuweather.com/currentconditions/v1/'
const MTB_PROJECT_API_KEY = '6523910-ecc597968f8123f52f6697bda4652415'
const MTB_PROJECT_URL = 'https://www.mtbproject.com/data/get-trails'

const trails = []
// name = name,
// summary = summary,
// img = imgSmall,
// precipitation = precipitation

const searchQuery = {
  submittedAddress: [],
  searchRadius: 10,
  trailLength: 5
}

//const lat = '36.0598781'
//const lon = '-84.3311592'

function getUserLocation(searchQuery) {
  const settings = {
    url: GOOGLE_MAPS_GEOCODING_URL,
    data: {
      address: searchQuery.submittedAddress,
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
      maxDistance: searchQuery.searchRadius,
      minLength: searchQuery.trailLength,
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
      trail.precipitation = data[0].PrecipitationSummary.Past24Hours.Imperial.Value
      trails.push(trail)
      if ( trails.length >= count ) {
        console.log('Done!')
        $( 'main' ).html(`<section id="map"></section>`)
        initMap(trails)
      }
    }
  }
  $.ajax(settings)
}

function initMap(trails) {
  console.log(trails)
  let trail1 = {lat: trails[0].latitude, lng: trails[0].longitude};
  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: trail1
  });

  let trail1_contentString = `<div id="content">
      <div id="siteNotice">
      </div>
      <h1 id="firstHeading" class="firstHeading">${trails[0].name}</h1>
      <div id="bodyContent">
      <p>${trails[0].summary}</p>
      <img src="${trails[0].imgSmall}">
      <p>${trails[0].precipitation} inches of precipitation in past 24 hours</p>
      </div>
      </div>`

  let infowindow = new google.maps.InfoWindow({
    content: trail1_contentString
  });

  let marker = new google.maps.Marker({
    position: trail1,
    map: map,
    title: `${trails[0].name}`
  });
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
}

function handleSearchButton() {
  console.log('Changing!')
  $( '#submit' ).click(function(){
    event.preventDefault()
    searchQuery.submittedAddress = $( '#address' ).val()
    searchQuery.searchRadius = $( '#searchRadius' ).val()
    console.log(searchQuery)
    getUserLocation(searchQuery)
  $( 'main' ).empty()
  })
}

handleSearchButton()
