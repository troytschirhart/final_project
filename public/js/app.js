// =============================================================================
//  APP.JS => THIS FILE CONTAINS ALL OF THE FUNCTIONS THAT CALL CONTROLLERS
// =============================================================================

// ===================================== Set Up
const app = angular.module('MoneyApp', [])

// =============================================================================
//  AUTHCONTROLLER IS THE CONTROLLER FOR USER AUTHENTICATION FUNCTIONS
// =============================================================================
app.controller('AuthController', ['$http', function ($http) {
    // Define 'includePath' to enable the use of partials
    this.includePath = 'partials/home.html'
    this.changeInclude = (path) => {
        this.includePath = 'partials/' + path + 'html'
    }

    // Declare 'controller' variable to be at the level of the app.controller
    const controller = this

    // =========================================================================
    //  THE FUNCTIONS START HERE
    // =========================================================================

    // ================================= Create User
    this.createUser = function(){
        $http({
            method: 'POST',
            url: '/users',
            data: {
                username: this.newUsername,
                password: this.newPassword
            }
        }).then(
            function(response){
                console.log(response);
                controller.newUsername = null;
                controller.newPassword = null
            },
            function(error){
                console.log(error);
            }
        )
    }


    // ================================= User Login
    this.logIn = function(){
        console.log(this.username);
        console.log(this.password);
        $http({
            method: 'POST',
            url: '/sessions',
            data: {
                username: this.username,
                password: this.password
            }
        }).then(
            function(response){
                console.log(response);
                controller.username = null;
                controller.password = null;
                // controller.goApp();
            },
            function(error){
                alert("login failed");
                console.log(error);
            }
        )
    }

    // ================================= Go to the Main app
    this.goApp = function(){
        $http({
            method: 'GET',
            url: '/app'
        }).then(
            function(response){
                controller.loggedInUsername = response.data.username
                controller.loggedInID = response.data._id
                // controller.getUserJobs()
            },
            function(error){
                console.log(error);
            }
        )
    }

    // ================================= User Logout
    this.logOut = function(){
        $http({
            method: 'DELETE',
            url: '/sessions'
        }).then(
            function(response){
                console.log(response);
                controller.loggedInUsername = null;
                // controller.
            },
            function(error){
                console.log(error);
            }
        )
    }



}])


// =============================================================================
//  MONEYCONTROLLER IS THE CONTROLLER FOR FINANCIAL FUNCTIONS
// =============================================================================
app.controller('MoneyController', ['$http', function ($http) {
    // Define 'includePath' to enable the use of partials
    this.includePath = 'partials/home.html'
    this.changeInclude = (path) => {
        this.includePath = 'partials/' + path + 'html'
    }

    // Declare 'controller' variable to be at the level of the app.controller
    const controller = this

    // =========================================================================
    //  THE FUNCTIONS START HERE
    // =========================================================================

    // ================================= Create User
    this.printHi = function(stock){
        console.log('hi');
        stock = this.stock;
        stockURL = 'https://api.iextrading.com/1.0/tops/last?symbols=' + stock;
        console.log(stockURL);
        $http({
            method: 'GET',
            url: stockURL
        }).then(
            function(response){
                console.log(response);
                console.log('$' + response.data[0].price);
            },
            function(error){
                console.log(error);
            }
        )
    }


    // ================================= User Login
    this.printBye = function(){
        console.log('bye');
    }

    // ================================= Go to the Main app
    this.goApp = function(){
        $http({
            method: 'GET',
            url: '/app'
        }).then(
            function(response){
                controller.loggedInUsername = response.data.username
                controller.loggedInID = response.data._id
                // controller.getUserJobs()
            },
            function(error){
                console.log(error);
            }
        )
    }

    // ================================= User Logout
    this.logOut = function(){
        $http({
            method: 'DELETE',
            url: '/sessions'
        }).then(
            function(response){
                console.log(response);
                controller.loggedInUsername = null;
                // controller.
            },
            function(error){
                console.log(error);
            }
        )
    }



}])
