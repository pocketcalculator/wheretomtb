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

/* input address, retrieves lat & lon */
getUserLocation(30328)
/* input lat & lon, retrieves local bike trail list with lat & lon coordinates */
// getMTBData(lat,lon,console.log)
/* input lat & lon, retrieves Accuweather Location Key */
// getAccuWeatherLocationKey({lat:lat,lng:lon})
/* input Accuweather Location Key, retrieve weather data including precipitation stats for last 24 hours */
// getRainData(2121883,console.log)
