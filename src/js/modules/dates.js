var moment = require('moment');

'use strict';

var toArray = require('to-array');

function Dates() {
    this._setup();
}

module.exports = Dates;

Dates.prototype._setup = function() {
	var attr = 'data-send-time';
	var sel = '[' + attr + ']';
	var dates = Array.prototype.slice.apply(document.querySelectorAll(sel));
	dates.forEach(function(dateEl) {
		var dateStr = dateEl.getAttribute(attr);
		var date = moment(dateStr).format('dddd, MMMM D, YYYY');
		dateEl.innerText = date;
	});
};
