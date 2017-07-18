'use strict';

var moment = require('moment');

var attr = 'data-send-time'
var sel = '[' + attr + ']'
var dates = Array.prototype.slice.apply(document.querySelectorAll(sel))

console.log('dates', dates)

dates.forEach(function(dateEl) {
	var dateStr = dateEl.getAttribute(attr)
	var date = moment(dateStr).calendar()
	dateEl.innerText = date
})
