'use strict';

/***********************
*
* REQUIRE ALL MODULES
*
************************/

// Greensock
require('tween-lite');
require('ease-pack');
require('css-plugin');
require('scroll-to-plugin');
require('timeline-lite');
// Custom modules
const TestModule = require('./modules/test-module');

/***********************
*
* INITIATE ALL MODULES
*
************************/
class Main {
	constructor() {
		this.initializeModules();
	}
	initializeModules() {
		new TestModule();
	}
}

new Main();
