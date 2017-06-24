'use strict';

/***********************
*
* REQUIRE ALL MODULES
*
************************/

// Greensock
// TO USE THIS, ADD THE GREENSOCK LINKS IN PACKAGE.JSON (FOLLOW INSTRUCTIONS THERE)
// AND THEN UNCOMMENT THIS. BUT FOR NOW, THIS IS NOT NEEDED
// require('tween-lite');
// require('ease-pack');
// require('css-plugin');
// require('scroll-to-plugin');
// require('timeline-lite');

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
