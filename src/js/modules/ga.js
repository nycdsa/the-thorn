'use strict';

var toArray = require('to-array');

function GoogleAnalytics() {
    this.links;
    this._setup();
    this._addListeners();
}

module.exports = GoogleAnalytics;

GoogleAnalytics.prototype._setup = function() {
    this.links = toArray(document.querySelectorAll('a'));
};

GoogleAnalytics.prototype._addListeners = function() {
    var i = this.links.length;
    while (i--) {
        this.links[i].addEventListener('click', this._onClick);
    }
};

GoogleAnalytics.prototype._onClick = function(e) {
    var target = e.target || e.srcElement;
    var url = target.getAttribute('href');
    if (target.getAttribute('target') === '_blank') {
        ga('send', 'event', 'outbound', 'click', url);
    } else {
        ga('send', 'event', 'inbound', 'click', url);
    }
};
