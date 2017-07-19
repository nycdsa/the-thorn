'use strict';

var moment = require('moment');

var attr = 'data-send-time'
var sel = '[' + attr + ']'
var dates = Array.prototype.slice.apply(document.querySelectorAll(sel))

dates.forEach(function(dateEl) {
	var dateStr = dateEl.getAttribute(attr)
	var date = moment(dateStr).format('dddd, MMMM D, YYYY')
	dateEl.innerText = date
})
