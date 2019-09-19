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
        // console.log(this.includePath);
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
                controller.addPrice(response); // push into user's positionList
            }, function(error) {
                console.log(error);
            }
        )
        controller.changeInclude('spreadsheet')
    }


    // ================================= Get price for a single stock from api
    this.addPrice = function(oneStock){

        console.log('oneStock for price pull: ', oneStock.data.symbol);
        stockURL = 'https://api.iextrading.com/1.0/tops/last?symbols=' +
            oneStock.data.symbol;
        console.log(stockURL);
        $http({
            method: 'GET',
            url: stockURL
        }).then(
            function(response){
                oneStock.data.price = response.data[0].price

                console.log('oneStock.price: ' + oneStock.data.price);

                oneStock.data.value =
                    oneStock.data.price * oneStock.data.shares
                oneStock.data.value =
                    Math.trunc(oneStock.data.value * 100) / 100

                oneStock.data.profit =
                    oneStock.data.value - oneStock.data.cost
                oneStock.data.profit =
                    Math.trunc(oneStock.data.profit * 100) / 100

                // controller.updateStock(oneStock)
                controller.pushStock(oneStock)

            },
            function(error){
                console.log(error);
            }
        )
    }




    // ================================= Push new stock to user's positionList
    this.pushStock = function(newStock){
        console.log('newStock: ', newStock);
        $http({
            method: 'PUT',
            url: '/users/' + controller.loggedInID,
            data: {
                stock: newStock.data
            }
        }).then(
            function(response){
                // console.log('push new stock response: ' + response);
                controller.newSymbol = null;
                controller.newName = null;
                controller.newShares = null;
                controller.newCost = null;

                //////////////////  Call single stock price updater here
                console.log('response from pushStock: ', response);
                // controller.editPrice(response)

                // setTimeout(function() {controller.getStockPrices()}, 1000)
                // setTimeout(function() {controller.getStockPrices()}, 2000)
                // setTimeout(function() {controller.getStockPrices()}, 3000)
                // setTimeout(function() {controller.getStockPrices()}, 4000)
                // setTimeout(function() {controller.getStockPrices()}, 5000)
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
        // console.log('Info below from submitting an edited stock');
        // console.log('stock._id: ' + stock._id);
        // console.log('stock.symbol: ' + stock.symbol);
        // console.log('stock.shares: ' + stock.shares);
        // console.log('stock.price: ' + stock.price);
        // console.log('stock.value: ' + stock.value);
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
                console.log('updated stock received from controller: ', response);
                // controller.replaceStock(response) // delete the old, add the new

                //////////////////  Call single stock price updater here
                console.log('response from editStock: ', response.data.shares);
                controller.editPrice(response)

            }, function(error) {
                console.log(error);
            }
        )
    }

    // ================================= Get price for a single stock from api
    this.editPrice = function(oneStock){

        console.log('oneStock for price pull: ', oneStock.data.symbol);
        stockURL = 'https://api.iextrading.com/1.0/tops/last?symbols=' +
            oneStock.data.symbol;
        console.log(stockURL);
        $http({
            method: 'GET',
            url: stockURL
        }).then(
            function(response){
                oneStock.data.price = response.data[0].price

                console.log('oneStock.price: ' + oneStock.data.price);

                oneStock.data.value =
                    oneStock.data.price * oneStock.data.shares
                oneStock.data.value =
                    Math.trunc(oneStock.data.value * 100) / 100

                oneStock.data.profit =
                    oneStock.data.value - oneStock.data.cost
                oneStock.data.profit =
                    Math.trunc(oneStock.data.profit * 100) / 100

                // controller.updateStock(oneStock)
                controller.replaceStock(oneStock)

            },
            function(error){
                console.log(error);
            }
        )
    }

    // ================================= replace updated stock on positionList
    this.replaceStock = function(updatedStock){
        console.log('updatedStock to be sent in as a replacement: ' +
            updatedStock.data._id + '     ' + updatedStock.data.symbol);
        console.log(updatedStock.data.price + '     ' + updatedStock.data.value
                    + '     ' + updatedStock.data.profit);
        $http({
            method: 'PUT',
            url: '/users/' + controller.loggedInID + '/' + updatedStock.data._id,
            data: {
                stock: updatedStock.data
            }
        }).then(
            function(response){
                console.log('response received from replacement for ' + updatedStock.data.symbol);
                console.log(response);
                controller.symbol = null;
                controller.name = null;
                controller.shares = null;
                controller.cost = null;


                // //////////////////  Call single stock price updater here
                // console.log('response from replaceStock: ' + response);
                // controller.editPrice(response)


                // setTimeout(function() {controller.getStockPrices()}, 500)
                // setTimeout(function() {controller.getStockPrices()}, 1000)
                // setTimeout(function() {controller.getStockPrices()}, 1500)
                // setTimeout(function() {controller.getStockPrices()}, 2000)
                // setTimeout(function() {controller.getStockPrices()}, 3000)
                // controller.getStockPrices()
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

// =============================================================================
//  PULLING PRICES AND CALCULATING VALUES FOR ONE STOCK ONLY
// =============================================================================








// =============================================================================
//  PULLING PRICES AND CALCULATING VALUES FOR ALL STOCKS AT ONCE
// =============================================================================

    // ================================= GRAB A PRICE FOR EACH STOCK
    this.getStockPrices = function(){
        // console.log('get stock prices - controller.loggedInID: ', controller.loggedInID);
        $http({
            method: 'GET',
            url: '/users/' + controller.loggedInID
        }).then(
            function(response){
                controller.stocks = response.data
                controller.pullPrices()

                // controller.sum = 0;
                // controller.net = 0;
                // for (let i = 0; i < response.data.length; i++) {
                //     controller.sum = controller.sum + response.data[i].value
                //     controller.net = controller.net + response.data[i].profit
                // }
                // controller.sum = Math.trunc(controller.sum * 100) / 100
                // controller.net = Math.trunc(controller.net * 100) / 100
                // console.log(controller.sum + '   ' + controller.net);


            }, function(error) {
                console.log(error);
            }
        )
    }


    // ================================= PULL A PRICE FROM THE API
    this.pullPrices = function(){
        // console.log('get stock prices - controller.loggedInID: ', controller.loggedInID);
        // console.log('pull price for: ' + controller.stocks[0].symbol);
        // console.log(controller.stocks[0]._id + '     ' +
        // controller.stocks[0].price + '     ' +
        // controller.stocks[0].value + '     ' +
        // controller.stocks[0].profit
        // );

        for (let i = 0; i < controller.stocks.length; i++) {
            stockURL = 'https://api.iextrading.com/1.0/tops/last?symbols=' +
                controller.stocks[i].symbol;
            console.log(stockURL);
            $http({
                method: 'GET',
                url: stockURL
            }).then(
                function(response){
                    // console.log('$' + response.data[0].price);
                    // controller.stocks[i].symbol = controller.stocks[i].symbol
                    // controller.stocks[i].name = controller.stocks[i].name
                    // controller.stocks[i].shares = controller.stocks[i].shares
                    // controller.stocks[i].cost = controller.stocks[i].cost
                    controller.stocks[i].price = response.data[0].price

                    controller.stocks[i].value =
                        controller.stocks[i].price * controller.stocks[i].shares
                    controller.stocks[i].value =
                        Math.trunc(controller.stocks[i].value * 100) / 100

                    controller.stocks[i].profit =
                        controller.stocks[i].value - controller.stocks[i].cost
                    controller.stocks[i].profit =
                        Math.trunc(controller.stocks[i].profit * 100) / 100

                    // console.log(controller.stocks[i].value);
                    // console.log(controller.stocks[i].profit);

                    // console.log(controller.stocks[i].price + '    ' + controller.stocks[i].value);

                    // console.log('to be sent to updateStock for: ' + controller.stocks[i].symbol);
                    // console.log(controller.stocks[i]._id + '     ' +
                    // controller.stocks[i].price + '     ' +
                    // controller.stocks[i].value + '     ' +
                    // controller.stocks[i].profit
                    // );

                    controller.updateStock(controller.stocks[i])

                },
                function(error){
                    console.log(error);
                }
            )
            // setTimeout(function() {console.log('delay: ' + i);}, 1000)
        }
        // controller.getUserStocks()

    }



    // ================================= UPDATE stocks with price data
    this.updateStock = function(stock) {
        console.log('Info below from pulling a stocks price');
        console.log('stock._id: ' + stock._id);
        console.log('stock.symbol: ' + stock.symbol);
        console.log('stock.shares: ' + stock.shares);
        console.log('stock.price: ' + stock.price);
        console.log('stock.value: ' + stock.value);
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
                console.log('updated stock received from controller: ', response);
                controller.switchStock(response) // delete the old, add the new
            }, function(error) {
                console.log(error);
            }
        )
    }


    // ================================= replace updated stock on positionList
    this.switchStock = function(updatedStock){
        console.log('switchStock to be sent in as a replacement: ' +
            updatedStock.data._id + '     ' + updatedStock.data.symbol);
        console.log(updatedStock.data.price + '     ' + updatedStock.data.value
                    + '     ' + updatedStock.data.profit);
        $http({
            method: 'PUT',
            url: '/users/' + controller.loggedInID + '/' + updatedStock.data._id,
            data: {
                stock: updatedStock.data
            }
        }).then(
            function(response){
                console.log('response received from replacement for ' + updatedStock.data.symbol);
                console.log(response);
                // controller.symbol = null;
                // controller.name = null;
                // controller.shares = null;
                // controller.cost = null;
                // setTimeout(function() {controller.getUserStocks()}, 100)
                // setTimeout(function() {controller.getUserStocks()}, 200)
                // setTimeout(function() {controller.getUserStocks()}, 300)
                // setTimeout(function() {controller.getUserStocks()}, 400)
                // setTimeout(function() {controller.getUserStocks()}, 500)
                // setTimeout(function() {controller.getUserStocks()}, 600)
                // setTimeout(function() {controller.getUserStocks()}, 700)
                // setTimeout(function() {controller.getUserStocks()}, 800)
                // setTimeout(function() {controller.getUserStocks()}, 900)
                setTimeout(function() {controller.getUserStocks()}, 1000)
                // $timeout(function() {controller.getUserStocks()}, 3000)
                // controller.getUserStocks()
            }, function(error){
                console.log(error);
                controller.getUserStocks()
            }
        )
    }

    // ================================= Calculate totals
    // this.calculateTotals = function(){
    //     console.log('get stocks - controller.loggedInID: ', controller.loggedInID);
    //     $http({
    //         method: 'GET',
    //         url: '/users/' + controller.loggedInID
    //     }).then(
    //         function(response){
    //             controller.stocks = response.data
    //
    //             controller.sum = 0;
    //             controller.net = 0;
    //             for (let i = 0; i < response.data.length; i++) {
    //                 // controller.stocks[i].value = controller.stocks[i].shares * controller.stocks[i].price
    //                 // controller.stocks[i].value = Math.trunc(controller.stocks[i].value * 100) / 100
    //                 // controller.stocks[i].profit = Math.trunc(controller.stocks[i].profit * 100) / 100
    //
    //                 controller.sum = controller.sum + response.data[i].value
    //                 controller.net = controller.net + response.data[i].profit
    //             }
    //             controller.sum = Math.trunc(controller.sum * 100) / 100
    //             controller.net = Math.trunc(controller.net * 100) / 100
    //             console.log(controller.sum + '   ' + controller.net);
    //
    //             // console.log('stocks to be displayed on the page: ');
    //             // for (let i = 0; i < controller.stocks.length; i++) {
    //             //     console.log(controller.stocks[i]._id + '     ' +
    //             //     controller.stocks[i].symbol + '     ' +
    //             //     controller.stocks[i].shares
    //             //     );
    //             // }
    //         }, function(error) {
    //             console.log(error);
    //         }
    //     )
    // }


    // Need a form for term entry and a submit button (maybe a clear button?)
    // Need to be able to display the results
    this.symbolLookUp = function(){
        console.log('searchTerm: ' + this.searchTerm);
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
