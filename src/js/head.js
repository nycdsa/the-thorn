'use strict';

class Head {
	constructor() {
		console.log('this is blocking');
	}
}

new Head();