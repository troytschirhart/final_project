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
    }

    // Declare 'controller' variable to be at the level of the app.controller
    const controller = this
    controller.stocks = []  // initialize global variable for stocks array

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
                controller.getStockPrices()
                controller.changeInclude('spreadsheet');
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
    //  MONEY CRUD FUNCTIONS START HERE
    // =========================================================================

    // ================================= Create Stock
    this.createStock = function(){
        $http({
            method: 'POST',
            url: '/stocks',
            data: {
                symbol: this.newSymbol,
                name: this.newName,
                shares: this.newShares,
                cost: this.newCost,
                price: 0,
                value: 0,
                profit: 0
            }
        }).then(
            function(response) {
                // get the price of the added stock
                controller.addPrice(response);
            }, function(error) {
                console.log(error);
            }
        )
        controller.changeInclude('spreadsheet')
    }


    // ================================= Get price for a single stock from api
    this.addPrice = function(oneStock){

        // console.log('oneStock for price pull: ', oneStock.data.symbol);
        stockURL = 'https://api.iextrading.com/1.0/tops/last?symbols=' +
            oneStock.data.symbol;
        console.log(stockURL);
        $http({
            method: 'GET',
            url: stockURL
        }).then(
            function(response){
                // Store the stock's current price
                oneStock.data.price = response.data[0].price

                // Calculate and store the stock's value
                oneStock.data.value =
                    oneStock.data.price * oneStock.data.shares
                oneStock.data.value =
                    Math.trunc(oneStock.data.value * 100) / 100

                // Calculate and store the stock's profit
                oneStock.data.profit =
                    oneStock.data.value - oneStock.data.cost
                oneStock.data.profit =
                    Math.trunc(oneStock.data.profit * 100) / 100

                // push the new stock onto the top of the user's position array
                controller.pushStock(oneStock)
            },
            function(error){
                console.log(error);
            }
        )
    }


    // ================================= Push new stock to user's positionList
    this.pushStock = function(newStock){
        $http({
            method: 'PUT',
            url: '/users/' + controller.loggedInID,
            data: {
                stock: newStock.data
            }
        }).then(
            function(response){
                controller.newSymbol = null;
                controller.newName = null;
                controller.newShares = null;
                controller.newCost = null;
                setTimeout(function() {controller.getUserStocks()}, 1000)
            }, function(error){
                console.log(error);
                controller.getUserStocks()
            }
        )
    }


    // ================================= Read stocks from user's positionList
    this.getUserStocks = function(){
        $http({
            method: 'GET',
            url: '/users/' + controller.loggedInID
        }).then(
            function(response){
                controller.stocks = response.data

                // initialize then calculate total value (sum) and profit (net)
                controller.sum = 0;
                controller.net = 0;
                for (let i = 0; i < response.data.length; i++) {
                    controller.sum = controller.sum + response.data[i].value
                    controller.net = controller.net + response.data[i].profit
                }
                controller.sum = Math.trunc(controller.sum * 100) / 100
                controller.net = Math.trunc(controller.net * 100) / 100

            }, function(error) {
                console.log(error);
            }
        )
    }

    // ================================= Edit a stock from user's positionList
    this.editStock = function(stock) {
        $http({
            method: 'PUT',
            url: '/stocks/' + stock._id,
            data: {
                symbol: this.symbol,
                name: this.name,
                shares: this.shares,
                cost: this.cost,
                price: this.price,
                value: this.value,
                profit: this.profit
            }
        }).then(
            function (response) {

                // Get the current price of the edited stock
                controller.editPrice(response)

            }, function(error) {
                console.log(error);
            }
        )
    }

    // ================================= Get price for a single stock from api
    this.editPrice = function(oneStock){
        stockURL = 'https://api.iextrading.com/1.0/tops/last?symbols=' +
            oneStock.data.symbol;
        console.log(stockURL);
        $http({
            method: 'GET',
            url: stockURL
        }).then(
            function(response){
                // Store the stock's current price
                oneStock.data.price = response.data[0].price

                // Calculate and store the stock's value
                oneStock.data.value =
                    oneStock.data.price * oneStock.data.shares
                oneStock.data.value =
                    Math.trunc(oneStock.data.value * 100) / 100

                // Calculate and store the stock's profit
                oneStock.data.profit =
                    oneStock.data.value - oneStock.data.cost
                oneStock.data.profit =
                    Math.trunc(oneStock.data.profit * 100) / 100

                // Replace the stock in the user's position array
                controller.replaceStock(oneStock)

            },
            function(error){
                console.log(error);
            }
        )
    }

    // ================================= replace updated stock on positionList
    this.replaceStock = function(updatedStock){
        $http({
            method: 'PUT',
            url: '/users/' + controller.loggedInID + '/' + updatedStock.data._id,
            data: {
                stock: updatedStock.data
            }
        }).then(
            function(response){
                controller.symbol = null;
                controller.name = null;
                controller.shares = null;
                controller.cost = null;

                setTimeout(function() {controller.getUserStocks()}, 1000)
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
                setTimeout(function() {controller.getUserStocks()}, 1000)
            }, function(error){
                console.log(error);
                controller.getUserStocks()
            }
        )
    }


// =============================================================================
//  PULLING PRICES AND CALCULATING VALUES FOR ALL STOCKS AT ONCE
// =============================================================================

    // ================================= GRAB A PRICE FOR EACH STOCK
    this.getStockPrices = function(){
        $http({
            method: 'GET',
            url: '/users/' + controller.loggedInID
        }).then(
            function(response){
                // Set controller.stocks to the stocks array
                controller.stocks = response.data
                // Get the price for each stock
                controller.pullPrices()
            }, function(error) {
                console.log(error);
            }
        )
    }


    // ================================= PULL A PRICE FROM THE API
    this.pullPrices = function(){
        // loop through the array of stocks and pull the current price for each
        for (let i = 0; i < controller.stocks.length; i++) {
            stockURL = 'https://api.iextrading.com/1.0/tops/last?symbols=' +
                controller.stocks[i].symbol;
            console.log(stockURL);
            $http({
                method: 'GET',
                url: stockURL
            }).then(
                function(response){

                    // Store stock i's price
                    controller.stocks[i].price = response.data[0].price

                    // Calculate and store stock i's value
                    controller.stocks[i].value =
                        controller.stocks[i].price * controller.stocks[i].shares
                    controller.stocks[i].value =
                        Math.trunc(controller.stocks[i].value * 100) / 100

                    // Calculate and store stock i's profit
                    controller.stocks[i].profit =
                        controller.stocks[i].value - controller.stocks[i].cost
                    controller.stocks[i].profit =
                        Math.trunc(controller.stocks[i].profit * 100) / 100

                    // Update the money values in stock i
                    controller.updateStock(controller.stocks[i])
                },
                function(error){
                    console.log(error);
                }
            )
        }
    }



    // ================================= UPDATE stocks with price data
    this.updateStock = function(stock) {
        $http({
            method: 'PUT',
            url: '/stocks/' + stock._id,
            data: {
                symbol: stock.symbol,
                name: stock.name,
                shares: stock.shares,
                cost: stock.cost,
                price: stock.price,
                value: stock.value,
                profit: stock.profit
            }
        }).then(
            function (response) {
                // Switch the old stock with the updated stock
                controller.switchStock(response)
            }, function(error) {
                console.log(error);
            }
        )
    }


    // ================================= replace updated stock on positionList
    this.switchStock = function(updatedStock){
        $http({
            method: 'PUT',
            url: '/users/' + controller.loggedInID + '/' + updatedStock.data._id,
            data: {
                stock: updatedStock.data
            }
        }).then(
            function(response){
                setTimeout(function() {controller.getUserStocks()}, 1000)
            }, function(error){
                console.log(error);
                controller.getUserStocks()
            }
        )
    }


    // ================================= Lookup a stock symbol using search term
    this.symbolLookUp = function(){
        searchURL = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=' + this.searchTerm + '&apikey=IQMFD5277KOIHK9H'
        console.log('searchURL: ' + searchURL);
        $http({
            method: 'GET',
            url: searchURL
        }).then(
            function(response){
                controller.results = response.data.bestMatches
            },
            function(error){
                console.log(error);
            }
        )
    }


}]) // End of the money controller
