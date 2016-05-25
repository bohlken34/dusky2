angular.module('starter.controllers', ['angular-skycons', 'onezone-datepicker'])
.constant('FORECASTIO_KEY', 'bfada7e322068f55ccbb16681e23d008') // Forecast.io API key

.constant('AIRNOWAPI_KEY', '7BCA95CD-4196-4FAB-B72D-F2911D8E4336') // AirNow API key

.controller('AddCtrl', function($scope, /*$cordovaGeolocation,*/ $ionicPopup, $ionicLoading, $ionicPlatform, $interval, Weather, $http, birthdayService, GeoService, CameraService, Location) {
  var lat, long, sunTime, $solarNoon;
  var today = new Date();
  var vm = this;

  ionic.Platform.ready(function(){ // Waits for Ionic to load

    $ionicLoading.show({
            template: '<ion-spinner class="spinner-energized" icon="lines"></ion-spinner><br/>Initializing database!'
        });
    // Initialize the database
    console.log("initializing the database");
    birthdayService.initDB();
    console.log("the database has been initialized");
    $ionicLoading.hide();


    $scope.birthday = {
      originalDate: today,
      sunAngle: $scope.sunAngle,
      riseName: '',
      setName: '',
    };

    $scope.takePicture = function() {
      CameraService.getPicture().then(function(photo){
        $scope.birthday.photo = photo;
      });
    };

    $scope.saveBirthday = function() { // Adds birthday to database
      birthdayService.addBirthday($scope.birthday);
        SunCalc.timesData(vm.birthdays); // Passes database into app to use in getTimes()
        SunCalc.getTimes(today, lat, long);

        $scope.birthday = { // Reset birthday object to empty
          sunAngle: '',
          riseName: '',
          setName: '',
          photo: null
        };
    };

    $scope.showConfirm = function() {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Add a Photo',
        template: 'Would you like to add a photo to this time?',
        cancelText: 'No',
        okText: 'Yes'
      });
      confirmPopup.then(function(res) {
        if(res) {
          CameraService.getPicture().then(function(photo){
            $scope.birthday.photo = photo;
            console.log("Got dat photo!", $scope.birthday);
            $scope.saveBirthday();
            
          });
        } else {
          $scope.saveBirthday();
        }
      });
    };

    $ionicLoading.show({
            template: '<ion-spinner class="spinner-energized" icon="lines"></ion-spinner><br/>Acquiring location!'
        });
         
        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };
        //$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
          GeoService.getPosition().then(function(position) {
            lat  = $scope.birthday.originalLat = position.coords.latitude;
            long = $scope.birthday.originalLong = position.coords.longitude;

            $scope.location = Location;
            $scope.location.latitude = lat;
            $scope.location.longitude = long;

            console.log("LOCATION", Location);

            var sunTime = SunCalc.getTimes(today, lat, long);
            console.log("SUNTIME: ", sunTime);
            $solarNoon = Date.parse(sunTime[0].solarNoon);
            console.log("SOLAR NOON: ", $solarNoon);

            // Mess of times
            $scope.sunTimes = sunTime;
            
            $scope.MorningAstroTwilight = sunTime[5].riseTime;
            $scope.NauticalDawn = sunTime[4].riseTime;
            $scope.Dawn = sunTime[3].riseTime;
            $scope.Sunrise = sunTime[1].riseTime;
            $scope.SunriseEnd = sunTime[2].riseTime;
            $scope.SunsetStart = sunTime[2].setTime;
            $scope.Sunset = sunTime[1].setTime;
            $scope.Dusk = sunTime[3].setTime;
            $scope.NauticalDusk = sunTime[4].setTime;
            $scope.Night = sunTime[5].setTime;
    $ionicLoading.hide();

    $ionicLoading.show({
            template: '<ion-spinner class="spinner-energized" icon="lines"></ion-spinner><br/>Loading database!'
    });
            // Get all birthday records from the database.
            birthdayService.getAllBirthdays().then(function(birthdays) {
              vm.birthdays = birthdays; // adds birthdays to vm scope, which is global in this controller
              SunCalc.timesData(birthdays);
              //SunCalc.getTimes(today, lat, long);
              console.log("GOT ALL BIRTHDAYS");
            });
    $ionicLoading.hide();

    $ionicLoading.show({
            template: '<ion-spinner class="spinner-energized" icon="lines"></ion-spinner><br/>Reverse geocoding coordinates!'
        });
            initMap();
    $ionicLoading.hide();

    $ionicLoading.show({
            template: '<ion-spinner class="spinner-energized" icon="lines"></ion-spinner><br/>Retrieving weather data!'
        });
            Weather.getCurrentWeather(lat,long).then(function(resp) {
              $scope.current = resp.data;
              $scope.birthday.weatherSummary = $scope.current.currently.summary;
              $scope.birthday.weatherIcon = $scope.current.currently.icon;
              $scope.birthday.weather = $scope.current.currently;
              console.log('CURRENT WEATHER', $scope.current);
            }, function(error) {
              alert('Unable to get current conditions');
              console.error(error);
            });
    $ionicLoading.hide();

    $ionicLoading.show({
            template: '<ion-spinner class="spinner-energized" icon="lines"></ion-spinner><br/>Retrieving pollution data!'
        });
            var url = "http://www.airnowapi.org/aq/forecast/latLong/?format=application/json&";
            $scope.pollutiondata = {currently:null, tomorrow:null};

            $http.get(url + "latitude=" + lat + "&longitude=" + long + "&date=&distance=50&API_KEY=7BCA95CD-4196-4FAB-B72D-F2911D8E4336").success(function(data) {
                $scope.pollutiondata.currently = data[1];
                $scope.AQI = $scope.birthday.AQI = $scope.pollutiondata.currently.AQI;
                $scope.pollutiondata.tomorrow = data[3];
                console.log('POLLUTION DATA', $scope.pollutiondata);
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
          console.log("INITMAP()");
          geocodeLatLng(geocoder);
        }

        function geocodeLatLng(geocoder) {
          var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};
          console.log("GEOCODING!", latlng);
          geocoder.geocode({'location': latlng}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              if (results[0]) {
                $scope.city = $scope.birthday.address = $scope.location.address = results[0].formatted_address;
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

.controller('CalendarCtrl', function($scope, $ionicModal, birthdayService, GeoService, CameraService, Location) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  var lat, long, sunTime;
  var today = new Date();
  var vm = this;

  $scope.sunTime = [];

  $scope.onezoneDatepicker = {
    date: today, // MANDATORY
    mondayFirst: false,
    disablePastDays: true,
    disableSwipe: false,
    showDatepicker: true,
    showTodayButton: true,
    calendarMode: true,
    hideCancelButton: false,
    hideSetButton: false,
  };

  $scope.viewImage = function(image){
    $scope.birthday.photo = image;
  };

  $scope.location = Location;

  $scope.sunTime = SunCalc.getTimes(today, Location.latitude, Location.longitude);
  console.log("CALENDAR - SUNTIME IS: ", $scope.sunTime);

 /* GeoService.getPosition().then(function(position) {
    lat  = position.coords.latitude;
    long = position.coords.longitude;


    $scope.sunTime = SunCalc.getTimes(today, lat, long);
    console.log("SunTime Is: ", $scope.sunTime);

  });*/

  $scope.$on('$ionicView.beforeEnter', function() {

      birthdayService.getAllBirthdays().then(function(birthdays) {
        vm.birthdays = $scope.birthdays = birthdays; // adds birthdays to vm scope, which is global in this controller
        SunCalc.timesData(birthdays);
        $scope.sunTime = SunCalc.getTimes(today, Location.latitude, Location.longitude);
        console.log('The MANAGE view has been entered. \n $scope.sunTime is now: ', $scope.sunTime);
      }); 
  });

  $scope.$watch('onezoneDatepicker.date', function() {
    $scope.sunTime = SunCalc.getTimes($scope.onezoneDatepicker.date.getTime() + 86400000, Location.latitude, Location.longitude);
    console.log("SunTime has been updated to ", $scope.sunTime);
  });

  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function(times) {
    $scope.time = times;
    console.log("scope.time = ", $scope.time);
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // action
  });
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('ManageCtrl', function($scope, birthdayService) {
  $scope.shouldShowReorder = false;
  $scope.shouldShowDelete = true;

  ionic.Platform.ready(function(){
    var vm = this;
    // Initialize the database
    birthdayService.initDB();

    // Get all birthday records from the database.
    $scope.$on('$ionicView.beforeEnter', function() {

      birthdayService.getAllBirthdays().then(function(birthdays) {
        vm.birthdays = $scope.birthdays = birthdays; // adds birthdays to vm scope, which is global in this controller
        SunCalc.timesData(birthdays);
      });
      console.log('The MANAGE view has been entered. \n $scope.birthdays is now: ', $scope.birthdays);
    });

    $scope.editDefaults = {
      checked: false,
      show: 6
    };

    $scope.handleDefaults = function(checked) {
      if(checked == true) {
        $scope.editDefaults.show = 0;
      } else {
        $scope.editDefaults.show = 6;
      };
    };

    $scope.moveItem = function(item, fromIndex, toIndex) {
      console.log("item is ", item);
      console.log("fromIndex is ", fromIndex);
      console.log("toIndex is ", toIndex);
      $scope.birthdays.splice(fromIndex, 1);
      $scope.birthdays.splice(toIndex, 0, item);
      console.log($scope.birthdays);
      $scope.updateBirthday();
    };
  
    $scope.updateBirthday = function() { // Adds birthday to database
      birthdayService.updateBirthday($scope.birthdays);
        SunCalc.timesData(vm.birthdays); // Passes database into app to use in getTimes()
    };

    $scope.onItemDelete = function(item) {
      $scope.birthdays.slice($scope.birthdays.indexOf(item), 1);
      console.log("Deleted item! Scope.Birthdays = ", $scope.birthdays);
      birthdayService.deleteBirthday(item);
        SunCalc.timesData(vm.birthdays);
    };

  });
})

.controller('LocationCtrl', function($scope, GeoService, Location, locationStorageService) {

  ionic.Platform.ready(function(){

    $scope.location = Location;

    locationStorageService.initDB();

  });

});
