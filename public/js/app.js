// =============================================================================
//  APP.JS => THIS FILE CONTAINS ALL OF THE FUNCTIONS THAT CALL CONTROLLERS
// =============================================================================

// ===================================== Set Up
const app = angular.module('MoneyApp', [])

// =============================================================================
//  APP.CONTROLLER IS THE CONTROLLER FOR ALL FUNCTIONS
// =============================================================================
app.controller('MoneyController', ['$http', function ($http) {
    // Define 'includePath' to enable the use of partials
    this.includePath = 'partials/about.html'
    this.changeInclude = (path) => {
        this.includePath = 'partials/' + path + 'html'
    }

    // Declare 'controller' variable to be at the level of the app.controller
    const controller = this

    // =========================================================================
    //  THE FUNCTIONS START HERE
    // =========================================================================







}])
