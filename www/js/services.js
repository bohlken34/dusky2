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
              riseName: 'sunrise',
              setName: 'sunset',
              sunAngle: -0.833
            });
            _birthdays.insert({
              riseName: 'sunriseEnd',
              setName: 'sunsetStart',
              sunAngle: -0.3
            });
            _birthdays.insert({
              riseName: 'dawn',
              setName: 'dusk',
              sunAngle: -6
            });
            _birthdays.insert({
              riseName: 'nauticalDawn',
              setName: 'nauticalDusk',
              sunAngle: -12
            });
            _birthdays.insert({
              riseName: 'nightEnd',
              setName: 'night',
              sunAngle: -18
            });
            _birthdays.insert({
              riseName: 'goldenHourEnd',
              setName: 'goldenHour',
              sunAngle: 6
            });
          }

          resolve(_birthdays.data);
          console.log('The real value of birthdays is: ', _birthdays.data);
        });
      });
    };

    

    function addBirthday(birthday) {
      _birthdays.insert(birthday);
      console.log('ADD The real value of birthdays is: ', _birthdays.data);
    };

    function updateBirthday(birthday) {
      _birthdays.update(birthday);
    };

    function deleteBirthday(birthday) {
      _birthdays.remove(birthday);
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

var app = angular.module('starter.services', ['ngResource', 'ngCordova']);

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
