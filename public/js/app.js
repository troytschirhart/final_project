// =============================================================================
//  APP.JS => THIS FILE CONTAINS ALL OF THE FUNCTIONS THAT CALL CONTROLLERS
// =============================================================================

// ===================================== Set Up
const app = angular.module('MoneyApp', [])
let session_loggedInID = null;

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
    //  AUTHENTICATION FUNCTIONS START HERE
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
                controller.username = controller.newUsername;
                controller.password = controller.newPassword;
                controller.logIn();
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
                controller.goApp();
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
                session_loggedInID = response.data._id
                console.log('login id at login: ' + session_loggedInID);
                // controller.getUserStocks()                                      uncomment when working
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
                // controller.getUserStocks()                                    uncomment when working
            },
            function(error){
                console.log(error);
            }
        )
    }

}]) // End of the authorization controller


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
    const controller = this;


    // =========================================================================
    //  MONEY FUNCTIONS START HERE
    // =========================================================================

    // ================================= Create Stock
    this.createStock = function(){
        $http({
            method: 'POST',
            url: '/stocks',
            data: {
                symbol: this.newSymbol,
                shares: this.newShares
            }
        }).then(
            function(response) {
                controller.pushStock(response); // push into user's positionList
            }, function(error) {
                console.log(error);
            }
        )
    }

    // ================================= Push new stock to user's positionList
    this.pushStock = function(newStock){
        console.log('newStock: ' + newStock);
        $http({
            method: 'PUT',
            url: '/users/' + session_loggedInID,
            data: {
                stock: newStock.data
            }
        }).then(
            function(response){
                console.log('push new stock response: ' + response);
                controller.newSymbol = null;
                controller.newShares = null;
                controller.getUserStocks()
            }, function(error){
                console.log(error);
                // controller.getUserStocks()                                    uncomment when working
            }
        )
    }

    // ================================= Read stocks from user's positionList
    this.getUserStocks = function(){
        console.log(session_loggedInID);
        $http({
            method: 'GET',
            url: '/users/' + session_loggedInID
        }).then(
            function(response){
                console.log('getUserStocks response length: ' + response.data.length);
                console.log('getUserStocks response data: ' + response.data[0]._id);
                controller.stocks = response.data
                console.log('stocks to be displayed on the page: ');
                for (let i = 0; i < controller.stocks.length; i++) {
                    console.log(controller.stocks[i]._id + '     ' +
                    controller.stocks[i].symbol);
                }
            }, function(error) {
                console.log(error);
            }
        )
    }

    // ================================= Update stocks from user's positionList
    this.editStock = function(stock) {
        console.log('stock: ' + stock);
        $http({
            method: 'PUT',
            url: '/stocks/' + stock._id,
            data: {
                symbol: this.symbol,
                shares: this.shares
            }
        }).then(
            function (response) {
                console.log('updated stock received from controller: ', response);
                controller.replaceStock(response) // delete the old, add the new
            }, function(error) {
                console.log(error);
            }
        )
    }

    // ================================= replace updated stock on positionList
    this.replaceStock = function(updatedStock){
        console.log('updatedStock to be sent in as a replacement: ' +
            updatedStock.data._id);
        $http({
            method: 'PUT',
            url: '/users/' + session_loggedInID + '/' + updatedStock.data._id,
            data: {
                stock: updatedStock.data
            }
        }).then(
            function(response){
                console.log('response received from replacement: ', response);
                controller.symbol = null;
                controller.shares = null;
                controller.indexOfEditFormToShow = null;
                // controller.getUserStocks()                                    uncomment when working
            }, function(error){
                console.log(error);
                // controller.getUserStocks()                                    uncomment when working
            }
        )
    }

    // ================================= delete a stock from user's positionList
    this.deleteStock = function(stock){
        $http({
            method: 'DELETE',
            url: '/users/' + session_loggedInID + '/' + stock._id
        }).then(
            function(response){
                console.log(response);
                // controller.getUserStocks()                                    uncomment when working
            }, function(error){
                console.log(error);
                // controller.getUserStocks()                                    uncomment when working
            }
        )
    }


    // ================================= pull a stock price
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

}]) // End of the money controller
