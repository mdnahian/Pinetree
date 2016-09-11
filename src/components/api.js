var root_url = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyA5gm5FSc4PcT81BDtPdjWsSrtbYUqTeGI";

module.exports = function(latitude, longitude) {
	var latlng = latitude+", "+longitude;
	var url = `${root_url}&latlng=${latlng}`;

	return fetch(url)
		.then(response => {
			return response.json();
		})
		.then(json => {
			return {
				city: json.results[0].address_components[2].long_name,
				state: json.results[0].address_components[4].short_name
			}
		});
}