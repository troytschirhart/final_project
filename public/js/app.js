// =============================================================================
//  APP.JS => THIS FILE CONTAINS ALL OF THE FUNCTIONS THAT CALL CONTROLLERS
// =============================================================================

// ===================================== Set Up
const app = angular.module('MoneyApp', [])


// =============================================================================
//  MONEYCONTROLLER IS THE CONTROLLER FOR AUTHENTICATION AND MONEY FUNCTIONS
// =============================================================================
app.controller('MoneyController', ['$http', function ($http) {
    // Define 'includePath' to enable the use of partials
    this.includePath = 'partials/home.html'
    this.changeInclude = (path) => {
        this.includePath = 'partials/' + path + '.html'
        console.log(this.includePath);
    }

    // Declare 'controller' variable to be at the level of the app.controller
    const controller = this
    controller.stocks = []

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
        console.log('username: ' + this.username);
        console.log('password: ' + this.password);
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
                controller.loggedInID = response.data._id
                console.log('login id at login: ' + controller.loggedInID);
                controller.changeInclude('spreadsheet');
                controller.getUserStocks()
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
                controller.loggedInID = null;
                controller.getUserStocks()
            },
            function(error){
                console.log(error);
            }
        )
    }




// =============================================================================
//  START OF THE FINANCIAL FUNCTIONS
// =============================================================================


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
                shares: this.newShares,
                price: 0,
                value: 0
            }
        }).then(
            function(response) {
                controller.pushStock(response); // push into user's positionList
            }, function(error) {
                console.log(error);
            }
        )
        controller.changeInclude('spreadsheet')
    }

    // ================================= Push new stock to user's positionList
    this.pushStock = function(newStock){
        console.log('newStock: ' + newStock);
        $http({
            method: 'PUT',
            url: '/users/' + controller.loggedInID,
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
                controller.getUserStocks()
            }
        )
    }

    // ================================= Read stocks from user's positionList
    this.getUserStocks = function(){
        console.log('get stocks - controller.loggedInID: ', controller.loggedInID);
        $http({
            method: 'GET',
            url: '/users/' + controller.loggedInID
        }).then(
            function(response){
                controller.stocks = response.data

                controller.sum = 0;
                for (let i = 0; i < response.data.length; i++) {
                    response.data[i].value = response.data[i].shares * response.data[i].price
                    controller.sum = controller.sum + response.data[i].value + 3.1415
                }
                controller.sum = Math.round(controller.sum * 100) / 100

                console.log('stocks to be displayed on the page: ');
                for (let i = 0; i < controller.stocks.length; i++) {
                    console.log(controller.stocks[i]._id + '     ' +
                    controller.stocks[i].symbol + '     ' +
                    controller.stocks[i].shares + '     ' + sum
                    );
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
                shares: this.shares,
                price: this.price,
                value: this.value
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
            url: '/users/' + controller.loggedInID + '/' + updatedStock.data._id,
            data: {
                stock: updatedStock.data
            }
        }).then(
            function(response){
                console.log('response received from replacement: ', response)
                controller.symbol = null;
                controller.shares = null;
                controller.indexOfEditFormToShow = null;
                controller.getUserStocks()
            }, function(error){
                console.log(error);
                controller.getUserStocks()
            }
        )
    }

    // ================================= delete a stock from user's positionList
    this.deleteStock = function(stock){
        $http({
            method: 'DELETE',
            url: '/users/' + controller.loggedInID + '/' + stock._id
        }).then(
            function(response){
                console.log(response);
                controller.getUserStocks()
            }, function(error){
                console.log(error);
                controller.getUserStocks()
            }
        )
    }


    // ================================= pull a stock price
    this.pullPrice = function(stock){
        console.log('hi');
        console.log(stock);
        // stock = this.stock;
        console.log(stock);
        stockURL = 'https://api.iextrading.com/1.0/tops/last?symbols=' + stock;
        console.log(stockURL);
        $http({
            method: 'GET',
            url: stockURL
        }).then(
            function(response){
                console.log(response);
                console.log('$' + response.data[0].price);
                return (response.data[0].price)
            },
            function(error){
                console.log(error);
            }
        )
    }

}]) // End of the money controller
