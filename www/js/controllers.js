angular.module('starter.controllers', ['angular-skycons'])
.constant('FORECASTIO_KEY', 'bfada7e322068f55ccbb16681e23d008')

.constant('AIRNOWAPI_KEY', '7BCA95CD-4196-4FAB-B72D-F2911D8E4336')

.controller('AddCtrl', function($scope, $cordovaGeolocation, $ionicLoading, $ionicPlatform, $interval, Weather, $http, birthdayService) {
  var lat, long, sunTime, $solarNoon;
  var today = new Date();
  var vm = this;

  $scope.addTime = function(angle, riseName, setName) {
    SunCalc.addTime(angle, riseName, setName);
  };

  ionic.Platform.ready(function(){

    // Initialize the database
    birthdayService.initDB();

    // Get all birthday records from the database.
    birthdayService.getAllBirthdays().then(function(birthdays) {
      vm.birthdays = birthdays;
      console.log("birthdays", birthdays);
      SunCalc.timesData(birthdays);
      SunCalc.getTimes(today, lat, long);
    });

    $scope.birthday = {
      sunAngle: $scope.sunAngle,
      riseName: '',
      setName: ''
    };



    $scope.saveBirthday = function() {
      birthdayService.addBirthday($scope.birthday);
        SunCalc.timesData(vm.birthdays);
        SunCalc.getTimes(today, lat, long);
        console.log('result in controller', SunCalc.getTimes(today, lat, long));
        $scope.birthday = {
          sunAngle: '',
          riseName: '',
          setName: ''
        };
    };

    $ionicLoading.show({
            template: '<ion-spinner class="spinner-energized" icon="lines"></ion-spinner><br/>Acquiring location!'
        });
         
        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            lat  = position.coords.latitude;
            long = position.coords.longitude;
            var sunTime = SunCalc.getTimes(today, lat, long);
            var $solarNoon = Date.parse(SunCalc.getTimes($scope.clock, lat, long).solarNoon);
            
            console.log("Suntime is: ", sunTime);

            $scope.sunTimes = sunTime;
            $scope.MorningAstroTwilight = sunTime.nightEnd;
            $scope.NauticalDawn = sunTime.nauticalDawn;
            $scope.Dawn = sunTime.dawn;
            $scope.Sunrise = sunTime.sunrise;
            $scope.SunriseEnd = sunTime.sunriseEnd;
            $scope.SunsetStart = sunTime.sunsetStart;
            $scope.Sunset = sunTime.sunset;
            $scope.Dusk = sunTime.dusk;
            $scope.NauticalDusk = sunTime.nauticalDusk;
            $scope.Night = sunTime.night;

            initMap();

            Weather.getCurrentWeather(lat,long).then(function(resp) {
              $scope.current = resp.data;
              console.log('GOT CURRENT', $scope.current);
            }, function(error) {
              alert('Unable to get current conditions');
              console.error(error);
            });

            var url = "http://www.airnowapi.org/aq/forecast/latLong/?format=application/json&";
            $scope.pollutiondata = {currently:null, tomorrow:null};

            $http.get(url + "latitude=" + lat + "&longitude=" + long + "&date=&distance=50&API_KEY=7BCA95CD-4196-4FAB-B72D-F2911D8E4336").success(function(data) {
                $scope.pollutiondata.currently = data[1];
                $scope.AQI = $scope.pollutiondata.currently.AQI;
                $scope.pollutiondata.tomorrow = data[3];
                console.log('GOT pollutiondata.currently', $scope.pollutiondata);
                if ($scope.AQI <= 50) {
                  $('#pollution-data').addClass('good');
                } else if ($scope.AQI > 50 && $scope.AQI <= 100) {
                  $('#pollution-data').addClass('moderate');
                } else if ($scope.AQI > 100 && $scope.AQI <= 150) {
                  $('#pollution-data').addClass('sensitive');
                } else if ($scope.AQI > 150 && $scope.AQI <= 200) {
                  $('#pollution-data').addClass('unhealthy');
                } else if ($scope.AQI > 200 && $scope.AQI <= 300) {
                  $('#pollution-data').addClass('veryunhealthy');
                } else if ($scope.AQI > 300 && $scope.AQI <= 500) {
                  $('#pollution-data').addClass('hazardous');
                }
              });
 
            $ionicLoading.hide();           
             
        }, function(err) {
            $ionicLoading.hide();
            console.log(err);
        });

        $scope.lat = lat;
        $scope.long = long;
        $scope.date = new Date();

        function initMap() {
          var geocoder = new google.maps.Geocoder;

          geocodeLatLng(geocoder);
        }

        function geocodeLatLng(geocoder) {
          var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};
          geocoder.geocode({'location': latlng}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              if (results[0]) {
                $scope.city = results[0].formatted_address;
              } else {
                window.alert('Could not detect address');
              }
            } else {
              window.alert('Geocoder failed due to: ' + status);
            }
          });
        }

        $scope.currentLocation = function() {
          console.log("clicked");
          $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            lat  = position.coords.latitude;
            long = position.coords.longitude;
            
            initMap(); 

            console.log("Your latitude is " + lat);
            console.log("Your longitude is " + long);             
             
          }, function(err) {
            console.log(err);
          });
        }

        // Rewrite this

        var tick = function() {
          $scope.clock = Date.now();
          var currentSunPosition = SunCalc.getPosition($scope.clock, lat, long);
          var currentAltitudeDeg = Math.degrees(currentSunPosition.altitude);

          if($scope.clock < $solarNoon) {
            $('#lbl-morning').addClass('dusky--timeofday');
            $('#lbl-evening').removeClass('dusky--timeofday');
          } else if($scope.clock == $solarNoon) {
            $('#lbl-morning').removeClass('dusky--timeofday');
            $('#lbl-evening').removeClass('dusky--timeofday');
          } else {
            $('#lbl-morning').removeClass('dusky--timeofday');
            $('#lbl-evening').addClass('dusky--timeofday');
          }
          $scope.sunAngle = Math.roundspec(currentAltitudeDeg, 2);
          $scope.birthday.sunAngle = $scope.sunAngle;
        }
        tick();
        $interval(tick, 500);
  });
  
})

.controller('CalendarCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('ManageCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('LocationCtrl', function($scope) {
  $scope.locations = ['Current Location','B','C','D','E','F','G','H','I','END'];

  $scope.onSwipeRight = function() {
    $scope.locations.splice(this.$index, 1);
  }
});
