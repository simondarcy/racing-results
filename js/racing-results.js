//Single Page Racing results application
//Example day feed:
//example meeting feed:

root = (document.location.hostname=="localhost")?"sample-racing-data/":"../";

//Set up angular app
var myApp = angular.module('myApp', ['myApp', 'ngRoute', 'ngAnimate']);

myApp.run(function($rootScope) {
    $rootScope.date = "";
});

//App routing
myApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'templates/list.html?v=06072016',
            controller: 'DayCtrl'
        }).
        when('/day/:date', {
            templateUrl: 'templates/list.html?v=06072016',
            controller: 'DayCtrl'
        }).
        when('/meeting/:meetingId', {
            templateUrl: 'templates/meeting.html?v=06072016',
            controller: 'RacingCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });
    }]);



//Initial entry to the app
function HomeCtrl($scope){
    //get todays date and redirect
    MyDate = new Date();
    MyDateString = MyDate.getFullYear() + ('0' + (MyDate.getMonth() + 1)).slice(-2) +('0' + MyDate.getDate()).slice(-2);
    window.location.href="#day/"+MyDateString;
}



function formatDate(dateStr){
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    year = dateStr.substring(0, 4);
    month = dateStr.substring(4, 6);
    day = dateStr.substring(6, 8);
    theDate = new Date(year, month-1, day);

    formattedDate = days[theDate.getDay()] + " " + day + " "+ months[theDate.getMonth()];

    return formattedDate

}

//List out available races on a given day
function DayCtrl($scope, $http, $routeParams, $rootScope){
    //get index JSON file example 20160608.json

    //if app accessed without /day/{date}
    if (typeof $routeParams.date == "undefined"){
        MyDate = new Date();
        meetingDate = MyDate.getFullYear() + ('0' + (MyDate.getMonth() + 1)).slice(-2) +('0' + MyDate.getDate()).slice(-2);
    }
    else{
        meetingDate = $routeParams.date;
    }

    year = meetingDate.substring(0, 4);
    url = root + year + '/day-' + meetingDate + '.json';

    //reset the date param
    $rootScope.date = formatDate(meetingDate);

    $http.get(url)
        .success(function (data) {
            $scope.meetings =[];

            for (i=0; i < data.resultslist.today.length; i++){
                //Create an object for rendering in Angular template
                obj = {
                        "name":data.resultslist.today[i],
                        "url":'#meeting/'+meetingDate+'-'+data.resultslist.today[i].toLowerCase().replace(' ', '')
                      };
                //Add to meetings scope object
                $scope.meetings.push(obj);
            }

        })
        .error(function (data, status, headers, config) {
            //  Do some error handling here
            $scope.error = "Neigh races on this date, please select another."
        });

}//end day controller

function RacingCtrl($scope, $http, $routeParams, $rootScope) {

        url = root + $routeParams.meetingId+ '.json';

        $scope.backLink = '#day/'+$routeParams.meetingId.split('-')[0];


        $http.get(url)
            .success(function (data) {

                $scope.data = null;

                //Check if card data is avalable, cards usually available before results
                if ( data.MEET.CARD != undefined ) {
                    $scope.data = data.MEET.CARD.MEETING;
                }//end if card

                //check if result data is available, if so use this
                if(data.MEET.RESULT != undefined) {
                    $scope.data = data.MEET.RESULT.MEETING;
                    //this meeting data is better so update scope to use this
                }


                //If results and cards, merge. Yes this is a hack
                if(data.MEET.RESULT != undefined && data.MEET.CARD != undefined) {
                    //Bit of a hack but we want to add the Card to the result so if the result is not in yet we have something to
                    for (var i = 0; i < data.MEET.RESULT.MEETING.RACES.length; i++) {

                        race = data.MEET.RESULT.MEETING.RACES[i];
                        //Add card if race not completed, this will serve as a flag in the template
                        if (race.RUNNERS[0].NAME == null) {
                            data.MEET.RESULT.MEETING.RACES[i]['STATUS'] = "notstarted";
                            //update runners to use from RACE card and not result
                            data.MEET.RESULT.MEETING.RACES[i].RUNNERS = data.MEET.CARD.MEETING.RACES[i].RUNNERS
                        }
                    }
                }

            })
            .error(function (data, status, headers, config) {
                //  Do some error handling here
                $scope.error = data
            });
}


window.onload = function() {

    //Datepicker shizzle
    window.datepicker = new OsomDatepicker({
        selector: '#osom-datepicker',
        selectedDates: [new Date()],
        fromDate: new Date(2016, 5, 15), //Date in which we fist started publishing JSON results
        toDate: new Date(), //Today
        animation: 'horizontal',
        monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayNames: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        weekStart: 'Monday',
        onDateSelected: function (dates) {
            MyDate = dates[0];
            MyDateString = MyDate.getFullYear() + ('0' + (MyDate.getMonth() + 1)).slice(-2) + ('0' + MyDate.getDate()).slice(-2);
            document.getElementById('osom-wrapper').classList.remove('visible');
            window.location.href = '#day/' + MyDateString;
        }

    });
    datepicker.initialize();
    //Calendar button
    document.querySelector('.datepicker-btn').addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('osom-wrapper').classList.toggle('visible');
    });


    setTimeout(function(){ document.getElementById('horsey').style.left = "-100px;"  }, 5000);

};//End window on load