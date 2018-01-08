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
                <option value="">Trail Length</option>
                <option value="1">1+ Mile</option>
                <option value="3">3+ Miles</option>
                <option value="5">5+ Miles</option>
                <option value="10">10+ Miles</option>
              </select>
              <select name="radius" id="searchRadius" required>
                <option value="" disabled selected>Search Radius</option>
                <option value="5">5 Miles</option>
                <option value="10">10 Miles</option>
                <option value="20">20 Miles</option>
                <option value="50">50 Miles</option>
              </select>
              <input type="submit" value="GO!" id="submit"></input>
            </fieldset>
          </form>`
  $('main').html(formString)
  handleSearchButton()
}

function getUserLocation(searchQuery) {
  const locationErrorString = `<div class="errorMessage">
            <p>Invalid location.  Check your location and try again.</p>
            <button id="okButton">
              <span class="buttonLabel">OK</span>
            </button>
          </div>`
  const settings = {
    url: GOOGLE_MAPS_GEOCODING_URL,
    data: {
      address: searchQuery.submittedAddress,
      key:  GOOGLE_MAPS_GEOCODING_API_KEY
    },
    type: 'GET',
    dataType: 'JSON',
    success: function(data) {
      getMTBData(data.results[0].geometry.location)
    },
    error: function(error) {
      $('main').html(locationErrorString)
      handleOKButton()
    }
  }
  $.ajax(settings)
}

function getMTBData(location) {
  const getMTBDataErrorString = "Invalid location.  Check your location and try again."
  const noMTBDataString = "No trails found.  Modify your search criteria and try again."
  const errorMessage = `<div class="errorMessage">
            <p id="errorMessage" aria-live="assertive"></p>
            <button id="okButton">
              <span class="buttonLabel">OK</span>
            </button>
          </div>`
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
        $('main').html(errorMessage)
        handleOKButton()
        $('#errorMessage').text(noMTBDataString)
      }
    },
    error: function(error) {
      $('main').html(errorMessage)
      handleOKButton()
      $('#errorMessage').text(getMTBDataErrorString)
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
      $( 'main' ).html(`<div id="map"></div>`)
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
      trail.temperature = data[0].Temperature.Imperial.Value
      trail.precipitation24 = data[0].PrecipitationSummary.Past24Hours.Imperial.Value
      trail.precipitation9 = data[0].PrecipitationSummary.Past9Hours.Imperial.Value
      trails.push(trail)
      if ( trails.length >= count ) {
        console.log('Done!')
        initMap(trails)
      }
    }
  }
  $.ajax(settings)
}

function initMap(trails) {
  console.log(trails)
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 9,
    center: trails[0].coordinates
  })
  google.maps.event.addListener(map, 'idle', function() {
    $('.gm-style').removeClass('gm-style')
  })
  $('main').append('<ol id="accessibilityList" aria-live="assertive"></ol>')
  const accessibilityTrailList = []
  trails.forEach(function(trail, index) {
    let rideRecommendation = ''
    let weatherStatus = ''
    if ( trail.precipitation24 >= .50 || trail.precipitation9 >= .25 || trail.weather === "Thunderstorm" || trail.weather === "Rain" ) {
      weatherStatus = 'badWeather'
      rideStatusMessage = 'AVOID!'

    } else {
      weatherStatus = 'goodWeather'
      rideStatusMessage = 'RIDE!'
    }
    console.log(trail.name,trail.weather,rideStatusMessage)
    if (!trail.imgSmall) {
      trail.imgSmall = 'default-img.png'
    }
    const contentString = `<div id="content">
        <div id="siteNotice">
        </div>
        <span id="firstHeading" class="firstHeading">${trail.name}</span>
        <div id="bodyContent">
          <p id="trailSummary">${trail.location}. ${trail.length} miles. ${trail.summary}</p>
          <img class="thumbnail" src="${trail.imgSmall}">
          <div class="weatherConditions ${weatherStatus}">
            <p class="trailWeather">${trail.weather}.</p>
            <p class="trailWeather">${trail.temperature}<span id="degrees">&#8457.</span></p>
            <p id="rain">${trail.precipitation24} in.</p>
            <p id="rainDescription">of precipitation in past 24 hours.</p>
            <p id="rideStatus">${rideStatusMessage}</p>
          </div>
        </div>
      </div>`
    const accessibilityContentString =`<li>${trail.name}, ${trail.length}, ${trail.summary}, ${trail.weather}, ${trail.temperature}, ${trail.precipitation24}, ${rideStatusMessage}</li>`
    accessibilityTrailList.push(accessibilityContentString)
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
    $('#accessibilityList').html(accessibilityTrailList.join('\n'))
  });
}

function handleSearchButton() {
  console.log('Changing!')
  $( '.frontPageForm' ).submit(function(event){
    event.preventDefault()
    trails = []
    searchQuery.submittedAddress = $( '#address' ).val()
    searchQuery.trailLength = $( '#trailLength').val()
    searchQuery.searchRadius = $( '#searchRadius' ).val()
    console.log(searchQuery)
    getUserLocation(searchQuery)
  })
}

function handleOKButton() {
  $('#okButton').click(function(event) {
    initializeUI()
  })
}

function initializeUI() {
  $('main').empty()
  showForm()
}

$(initializeUI)
