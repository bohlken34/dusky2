var forecastioWeather = ['$q', '$resource', '$http', 'FORECASTIO_KEY',
  function($q, $resource, $http, FORECASTIO_KEY) {
    var url = "https://api.forecast.io/forecast/" + FORECASTIO_KEY + "/";

    var weatherResource = $resource(url, {
      callback: 'JSON_CALLBACK',
    }, {
      get: {
        method: 'JSONP'
      }
    });

    return {
      getCurrentWeather: function(lat, lng) {
        return $http.jsonp(url + lat + ',' + lng + '?callback=JSON_CALLBACK');
      }
    }
  }];

var BirthdayService = ['$q', 'Loki',
  function BirthdayService($q, Loki) {
    var _db;
    var _birthdays;

    function initDB() {
      var adapter = new LokiCordovaFSAdapter({"prefix": "loki"});
      _db = new Loki('birthdaysDB',
      {
        autosave: true,
        autosaveInterval: 1000,
        adapter: adapter
      });
      console.log("DATABASE INITIALIZED!", _db);
    };

    function getAllBirthdays() {

      return $q(function(resolve, reject) {
        
        var options = {
          proto: Object,
          inflate: function(src, dst) {
            var prop;
            for (prop in src) {
              if (prop === 'Date') {
                dst.Date = new Date(src.Date);
              } else {
                dst[prop] = src[prop];
              }
            }
          }
        };

        _db.loadDatabase(options, function() {
          _birthdays = _db.getCollection('birthdays');

          if (!_birthdays) {
            console.log('NO BIRTHDAYS IN DATABASE!');
            _birthdays = _db.addCollection('birthdays');

            _birthdays.insert({
              riseName: 'Sunrise',
              setName: 'Sunset',
              sunAngle: -0.833,
            });
            _birthdays.insert({
              riseName: 'End of Sunrise',
              setName: 'Start of Sunset',
              sunAngle: -0.3
            });
            _birthdays.insert({
              riseName: 'Dawn',
              setName: 'Dusk',
              sunAngle: -6
            });
            _birthdays.insert({
              riseName: 'Nautical Dawn',
              setName: 'Nautical Dusk',
              sunAngle: -12
            });
            _birthdays.insert({
              riseName: 'End of Astronomical Twilight',
              setName: 'Start of Astronomical Twilight',
              sunAngle: -18
            });
            _birthdays.insert({
              riseName: 'End of Golden Hour',
              setName: 'Start of Golden Hour',
              sunAngle: 6
            });
          }

          resolve(_birthdays.data);
          console.log('GET action! The database contains: ', _birthdays.data);
        });
      });
    };

    

    function addBirthday(birthday) {
      _birthdays.insert(birthday);
      console.log('ADD action! The database now contains: ', _birthdays.data);
    };

    function updateBirthday(birthday) {
      _birthdays.update(birthday);
      console.log('UPDATE action! The database now contains: ', _birthdays.data);
    };

    function deleteBirthday(birthday) {
      _birthdays.remove(birthday);
      console.log('DELETE action! The database now contains: ', _birthdays.data);
    };

    return {
      initDB: initDB,
      getAllBirthdays: getAllBirthdays,
      addBirthday: addBirthday,
      updateBirthday: updateBirthday,
      deleteBirthday: deleteBirthday
    };
  }
];

var LocationStorageService = ['$q', 'Loki',
  function LocationStorageService($q, Loki) {
    var _db;
    var _birthdays;

    function initDB() {
      var adapter = new LokiCordovaFSAdapter({"prefix": "loki"});
      _db = new Loki('locationsDB',
      {
        autosave: true,
        autosaveInterval: 1000,
        adapter: adapter
      });
      console.log("LOCATION DATABASE INITIALIZED!", _db);
    };

    function getAllLocations() {

      return $q(function(resolve, reject) {
        
        var options = {
          proto: Object,
          inflate: function(src, dst) {
            var prop;
            for (prop in src) {
              if (prop === 'Date') {
                dst.Date = new Date(src.Date);
              } else {
                dst[prop] = src[prop];
              }
            }
          }
        };

        _db.loadDatabase(options, function() {
          _locations = _db.getCollection('locations');

          if (!_locations) {
            console.log('NO LOCATIONS IN DATABASE');
            _locations = _db.addCollection('locations');
          }

          resolve(_locations.data);
          console.log('GET action! The location database contains: ', _locations.data);
        });
      });
    };

    

    function addLocation(location) {
      _locations.insert(location);
      console.log('ADD action! The location database now contains: ', _locations.data);
    };

    function updateLocation(location) {
      _locations.update(location);
      console.log('UPDATE action! The location database now contains: ', _locations.data);
    };

    function deleteLocation(location) {
      _locations.remove(location);
      console.log('DELETE action! The location database now contains: ', _locations.data);
    };

    return {
      initDB: initDB,
      getAllLocations: getAllLocations,
      addLocation: addLocation,
      updateLocation: updateLocation,
      deleteLocation: deleteLocation
    };
  }
];

var app = angular.module('starter.services', ['ngResource', 'ngCordova']);

app.factory('Location', function() {
  return {
    latitude: '',
    longitude: ''
  };
});

app.factory('GeoService', function($ionicPlatform, $cordovaGeolocation) {

  var positionOptions = {
    timout: 20000,
    enableHighAccuracy: true,
    maximumAge: 0
  };

  return {
    getPosition: function() {
      return $ionicPlatform.ready().then(function() {
        return $cordovaGeolocation.getCurrentPosition(positionOptions);
      })
    }
  };

});

app.factory('Weather', forecastioWeather);
// Create database service
app.factory('birthdayService', BirthdayService);
app.factory('locationStorageService', LocationStorageService);

app.factory('Pollution', function(lat, lng, $http, AIRNOWAPI_KEY) {
  var url = "http://www.airnowapi.org/aq/forecast/latLong/?format=application/json&";
  var pollutiondata = {content:null};

  var getCurrentPollution = function(lat, long) {
    $http.get(url + "latitude=" + lat + "&longitude=" + lng + "&date=&distance=50&API_KEY=" + AIRNOWAPI_KEY).success(function(data) {
      obj.content = data;
      return obj;
    });
  }
});

app.service('CameraService', ['$q', CameraService]);

function CameraService($q) {

  var me = this;

  me.options = {
    quality: 40,
    correctOrientation: true
  };

  function getPicture() {

    var q = $q.defer();

    me.options.encodingType = Camera.EncodingType.JPEG;
    me.options.sourceType = Camera.PictureSourceType.CAMERA;

    navigator.camera.getPicture(
      function(result){
        q.resolve(result);
      },
      function(err){
        q.reject(err);
      },
      me.options
    );

    return q.promise;
  }

  return {
    getPicture: getPicture
  }
};

app.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
