'use strict';

var GA = require('./modules/ga');
var Dates = require('./modules/dates');

var Main = (function() {

	var initializeModules = function() {
		new GA();
		new Dates();
	};

	return {
		init: function() {
			initializeModules();
		}
	}

}());

Main.init();