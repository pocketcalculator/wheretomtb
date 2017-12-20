const GOOGLE_MAPS_GEOCODING_API_KEY = 'AIzaSyB3Vcl4OPXv5kIw7P6zIQsroab_GQsOL38'
const GOOGLE_MAPS_GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
const ACCUWEATHER_API_KEY = '9wIeIXMRJpPqGKhqWXSAeuiLp8zRbqdC'
const ACCUWEATHER_GET_LOCATION_KEY_URL = 'https://dataservice.accuweather.com/locations/v1/cities/geoposition/search'
const ACCUWEATHER_CURRENT_CONDITIONS_URL = 'https://dataservice.accuweather.com/currentconditions/v1/'
const MTB_PROJECT_API_KEY = '6523910-ecc597968f8123f52f6697bda4652415'
const MTB_PROJECT_URL = 'https://www.mtbproject.com/data/get-trails'

const lat = '36.0598781'
const lon = '-84.3311592'

function getUserLocation(address,callback) {
  const settings = {
    url: GOOGLE_MAPS_GEOCODING_URL,
    data: {
      address,
      key:  GOOGLE_MAPS_GEOCODING_API_KEY
    },
    type: 'GET',
    dataType: 'JSON',
    success: callback
  }
  $.ajax(settings)
}

function getAccuWeatherLocationKey(lat,lon,callback) {
  const coordinates = lat + ',' + lon
  const settings = {
    url: ACCUWEATHER_GET_LOCATION_KEY_URL,
    data: {
      apikey: ACCUWEATHER_API_KEY,
      q: coordinates
    },
    type: 'GET',
    dataType: 'JSON',
    success: callback
  }
  $.ajax(settings)
}

function getRainData(locationKey,callback) {
  const ACCUWEATHER_RAIN_URL = ACCUWEATHER_CURRENT_CONDITIONS_URL + locationKey
  const settings = {
    url: ACCUWEATHER_RAIN_URL,
    data: {
      apikey: ACCUWEATHER_API_KEY,
      details: true
    },
    type: 'GET',
    dataType: 'JSON',
    success: callback
  }
  $.ajax(settings)
}

function getMTBData(lat,lon,callback) {
  const settings = {
    url: MTB_PROJECT_URL,
    data: {
      key: MTB_PROJECT_API_KEY,
      lat,
      lon
    },
    type: 'GET',
    dataType: 'JSON',
    success: callback
  }
  $.ajax(settings)
}

/* input address, retrieves lat & lon */
getUserLocation(30328,console.log)
/* input lat & lon, retrieves local bike trail list with lat & lon coordinates */
getMTBData(lat,lon,console.log)
/* input lat & lon, retrieves Accuweather Location Key */
getAccuWeatherLocationKey(lat,lon,console.log)
/* input Accuweather Location Key, retrieve weather data including precipitation stats for last 24 hours */
getRainData(2121883,console.log)
