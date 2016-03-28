// Get parameters
var apiRoot = getURLParameter('api').trim();
var username = getURLParameter('user').trim().toLowerCase();
var password = getURLParameter('pass').trim();
// Generate hash for authentication key
var shaObj = new jsSHA('SHA-256', 'TEXT');
shaObj.update(username + '//' + password);
var hash = shaObj.getHash('HEX');
// Array containing teachers
var teachers = new Array();
// Request teachers
var requestTeachers = new XMLHttpRequest();
requestTeachers.open('GET', apiRoot + '/teachers?k=' + hash + '&_=' + new Date().getTime(), true);
requestTeachers.onload = function() {
	if (this.status >= 200 && this.status < 400) {
		var data = JSON.parse(this.response);
		for (var i = 0; i < data.length; i++) {
			teachers[data[i].id] = data[i].name;
		}
		getChanges();
	}
	else {
		document.body.innerHTML = 'Something went wrong with getting teachers. Please try it again later.';
	}
};
requestTeachers.onerror = function() {
	document.body.innerHTML = 'Something went wrong with getting teachers. Please try it again later.';
};
requestTeachers.send();
// Request changes
function getChanges() {
	var requestChanges = new XMLHttpRequest();
	requestChanges.open('GET', apiRoot + '/changes?startBy=now&endBy=i1w&k=' + hash + '&_=' + new Date().getTime(), true);
	requestChanges.onload = function() {
		if (this.status >= 200 && this.status < 400) {
			var data = JSON.parse(this.response);
			data.sort(function(a, b) {
				var dateA = new Date(a.startBy.substring(0, 10));
				var dateB = new Date(b.startBy.substring(0, 10));
				// Sort by date ascending
				return dateA - dateB;
			});
			var output;
			for (var i = 0; i < data.length; i++) {
				var teacher = teachers[data[i].teacher];
				var coveringTeacher = '';
				if (data[i].coveringTeacher != 0) {
					coveringTeacher = teachers[data[i].coveringTeacher];
				}
				output = ((output != null) ? output : '') +
					teacher + '<br />' +
					data[i].startBy + '<br />' +
					data[i].endBy + '<br />' +
					data[i].type + '<br />' +
					data[i].text + '<br />' +
					coveringTeacher + '<br />' +
					'<p>-/-</p>';
			}
			output = ((output != null) ? output : '') +
				'&copy; 2016 <a href="https://altnico.github.io">Nico Alt</a><br />' + 
				'<a href="https://gitlab.com/legionboard/kiss" target="_blank">LegionBoard KISS</a> Version <a class="version" href="https://gitlab.com/legionboard/kiss/tags" target="_blank">0.1.0</a>'
			document.body.innerHTML = output;
		}
		else {
			document.body.innerHTML = 'Something went wrong with getting changes. Please try it again later.';
		}
	};
	requestChanges.onerror = function() {
		document.body.innerHTML = 'Something went wrong with getting changes. Please try it again later.';
	};
	requestChanges.send();
}
function getURLParameter(sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) {
			return sParameterName[1];
		}
	}
}
