const GOOGLE_MAPS_GEOCODING_API_KEY = 'AIzaSyB3Vcl4OPXv5kIw7P6zIQsroab_GQsOL38'
const GOOGLE_MAPS_GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
const ACCUWEATHER_API_KEY = 'KsDvhfHmutOyEZrgHhapjgBRJBrdpyov'
const ACCUWEATHER_GET_LOCATION_KEY_URL = 'https://dataservice.accuweather.com/locations/v1/cities/geoposition/search'
const ACCUWEATHER_CURRENT_CONDITIONS_URL = 'https://dataservice.accuweather.com/currentconditions/v1/'
const MTB_PROJECT_API_KEY = '6523910-ecc597968f8123f52f6697bda4652415'
const MTB_PROJECT_URL = 'https://www.mtbproject.com/data/get-trails'

let trails = []
// name = name,
// summary = summary,
// img = imgSmall,
// precipitation = precipitation

const searchQuery = {
  submittedAddress: [],
  searchRadius: 10,
  trailLength: 2.5
}

//const lat = '36.0598781'
//const lon = '-84.3311592'
function showForm() {
  const formString = `<form class="frontPageForm">
            <fieldset>
              <legend>Discover local bike trails with real-time weather conditions! </legend>
              <input type="text" name="address" id="address" placeholder="Address or Zip" required>
                <select name="trailLength" id="trailLength" required>
                  <option value="" disabled selected>Minimum Trail Length</option>
                  <option value="1">1 Mile</option>
                  <option value="3">3 Miles</option>
                  <option value="5">5 Miles</option>
                  <option value="10">10 Miles</option>
                </select>
                <select name="radius" id="searchRadius" required>
                  <option value="" disabled selected>Search Radius</option>
                  <option value="5">5 Miles</option>
                  <option value="10">10 Miles</option>
                  <option value="20">20 Miles</option>
                  <option value="50">50 Miles</option>
                </select>
                <button type="submit" name="submit" id="submit">GO!</button>
            </fieldset>
          </form>`
  $('main').html(formString)
}

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
      if ( data.trails.length > 0 ) {
        data.trails.forEach(function(trail, index) {
          const location = {
            lat: trail.latitude,
            lng: trail.longitude
          }
          trail.coordinates = location
          getAccuWeatherLocationKey(trail, data.trails.length)
        })
      }
      else {
        $('main').html(`<p>No results found.  Try expanding your search radius.</p>`)
      }
    }
  }
  $.ajax(settings)
}

function getAccuWeatherLocationKey(trail, count) {
  const coordinates = `${trail.coordinates.lat},${trail.coordinates.lng}`
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
      trail.weather = data[0].WeatherText
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
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: trails[0].coordinates
  })
  trails.forEach(function(trail, index) {
    const contentString = `<div id="content">
        <div id="siteNotice">
        </div>
        <h1 id="firstHeading" class="firstHeading">${trail.name}</h1>
        <div id="bodyContent">
        <p>${trail.location}. ${trail.length} miles. ${trail.summary}</p>
        <img class="thumbnail" src="${trail.imgSmall}">
        <p class="weatherConditions">${trail.weather}.  <span id="rain">${trail.precipitation} in.</span> of precipitation in past 24 hours</p>
        </div>
        </div>`
    const infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    const marker = new google.maps.Marker({
      position: trail.coordinates,
      map: map,
      title: `${trail.name}`
    });
    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });
  });
}

function handleSearchButton() {
  console.log('Changing!')
  $( '#submit' ).click(function(){
    event.preventDefault()
    trails = []
    searchQuery.submittedAddress = $( '#address' ).val()
    searchQuery.trailLength = $( '#trailLength').val()
    searchQuery.searchRadius = $( '#searchRadius' ).val()
    console.log(searchQuery)
    getUserLocation(searchQuery)
  $( 'main' ).empty()
  })
}

function initializeUI() {
  showForm()
  handleSearchButton()
}

$(initializeUI)
