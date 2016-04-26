//******************************************************************
//******************************************************************
//******************************************************************
//  Weather Underground scripts

// http://api.wunderground.com/api/c5209dc3ae8416a7/geolookup/q/94107.json
// http://api.wunderground.com/api/c5209dc3ae8416a7/conditions/q/94107.json
// http://api.wunderground.com/api/c5209dc3ae8416a7/forecast/q/94107.json
// http://api.wunderground.com/api/c5209dc3ae8416a7/forecast10day/q/35080.json

function doWunderWeather() {
	getCurrentCondition();
	getForecastConditions();
}

function getCurrentCondition() {
	console.log("getCurrentCondition...");
	deleteCookie("wunderCurrent");
	var cachedCondition = getCookie("wunderCurrent");
	if (cachedCondition == undefined) {
		console.log("cookie undefined, getting current conditions");
		var url = "https://api.wunderground.com/api/c5209dc3ae8416a7/conditions/q/35080.json";
		$.ajax(url, {
			success : function(result) {
				var current = parseCondition(result);
				renderWunderCurrentCondition(current);
				setCookie("wunderCurrent", current, 20);
			},
			error : function() {
				// Handle error
				// alert("error occurred retrieving weather data");
				console.log("Error occurred retrieving weather data.")
			}
		});
	} else {
		console.log("using cached condition");
		renderWunderCurrentCondition(cachedCondition);
	}
	setTimeout(getCurrentCondition, 20 * 60 * 1000);
}

function getForecastConditions() {
	var cachedForecast = getCookie("wunderForecast");
	//deleteCookie("wunderForecast");
	if (cachedForecast == undefined) {
		console.log("cookie undefined, getting forecast conditions");
		var url = "https://api.wunderground.com/api/c5209dc3ae8416a7/forecast/q/35080.json";
		$.ajax(url, {
			success : function(result) {
				var forecast = parseForecast(result);
				renderWunderForecast(forecast);
				setCookie("wunderForecast", forecast, 45);
			},
			error : function() {
				// Handle error
				console.log("Error occurred retrieving weather data.")
			}
		});
	} else {
		renderWunderForecast(cachedForecast);
	}
	setTimeout(getForecastConditions, 60 * 60 * 1000);
}

function parseCondition(result) {
	var current = result.current_observation;
	var condition = new wunderCondition();
	condition.location = current.display_location.full;
	condition.updated = current.observation_time;
	condition.temp = current.temp_f;
	condition.feelsLike = current.feelslike_f;
	condition.humidity = current.relative_humidity;
	condition.windMph = current.wind_mph;
	condition.windDir = current.wind_dir;
	condition.windGust = current.wind_gust_mph;
	condition.shortText = current.weather;
	// console.log("icon..." + current.icon);
	// condition.icon = wunderIcons[current.icon];
	var url = current.icon_url;
	url = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
	condition.icon = wunderIcons[url];
	console.log("icon: " + condition.icon);

	return condition;
}

function parseForecast(result) {
	var forecasts = {};
	var j = 0;
	console.log("length: " + result.forecast.simpleforecast.forecastday.length);
	var arr = result.forecast.simpleforecast.forecastday;
	for (var i = 0; i < arr.length; i++) {
		console.log(arr[i]);
		j = i * 2;
		forecasts[j++] = parseForecastDay(arr[i]);
		forecasts[j] = parseForecastNight(arr[i]);
	}
	return forecasts;
}

function parseForecastDay(day) {
	var condition = new wunderCondition();
	condition.title = day.date.weekday;
	condition.temp = day.high.fahrenheit;
	condition.shortText = "";
	return condition;
}

function parseForecastNight(day) {
	var condition = new wunderCondition();
	condition.title = day.date.weekday + " Night";
	condition.temp = day.low.fahrenheit;
	condition.shortText = "";
	return condition;

}

function renderWunderCurrentCondition(condition) {
	$("#wunder-location").text(condition.location);
	$("#wunder-updated").text(condition.updated);
	$("#wunder-current-temp").html("&nbsp;" + Math.round(condition.temp) + "°");
	$("#wunder-current-feels").html("Feels " + Math.round(condition.feelsLike) + "°");
	$("#wunder-current-condition").text(condition.shortText);
	$("#wunder-current-wind").text(formatWunderWind(condition.windMph, condition.windDir, condition.windGust));
	$("#wunder-current-icon").addClass(condition.icon);
}

function renderWunderForecast(forecast) {
	$("#wunder-today-high").text(forecast[0].temp + "°");
	$("#wunder-today-low").text(forecast[1].temp + "°");
}

function formatWunderWind(speed, direction, gust) {
	var windString = "Calm";
	if (speed > 0) {
		windString = Math.round(speed) + " " + wunderWind[direction] == undefined ? direction : wunderWind[direction];
		if (gust > speed) {
			windString += " (gusts to " + Math.round(gust) + ")";
		}
	}
	return windStirng;
}

function setCookie(cname, cvalue, minutes) {
	var d = new Date();
	d.setTime(d.getTime() + (minutes * 60 * 1000));
	document.cookie = cname + "=" + JSON.stringify(cvalue) + "; expires="
			+ d.toUTCString();
}

function getCookie(name) {
	var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
	result && (result = JSON.parse(result[1]));
	return result;
}

function deleteCookie(name) {
	document.cookie = [ name,
			'=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.',
			window.location.host.toString() ].join('');
}

var wunderCondition = function() {
	this.location = "";
	this.updated = "";
	this.title = "";
	this.temp = "";
	this.feelsLike = "";
	this.humidity = "";
	this.shortText = "";
	this.longText = "";
	this.precip = "";
	this.windMph = 0;
	this.windDir = "";
	this.windGust = "";
	this.icon = "";
};

var wunderWind = {
	North : "N",
	East : "E",
	South : "S",
	West : "W"
};

var wunderIcons = {
	chanceflurries : "wi-snow",
	chancerain : "wi-rain",
	chancesleet : "wi-day-sleet",
	chancesnow : "wi-snow",
	chancetstorms : "wi-storm-showers",
	clear : "wi-day-sunny",
	cloudy : "wi-cloudy",
	flurries : "wi-snow",
	fog : "wi-fog",
	hazy : "wi-day-haze",
	mostlycloudy : "wi-day-cloudy",
	mostlysunny : "wi-day-sunny-overcast",
	partlycloudy : "wi-day-sunny-overcast",
	partlysunny : "wi-day-cloudy",
	rain : "wi-rain",
	sleet : "wi-day-sleet",
	snow : "wi-snow",
	sunny : "wi-day-sunny",
	tstorms : "wi-storm-showers",
	nt_chanceflurries : "wi-snow",
	nt_chancerain : "wi-rain",
	nt_chancesleet : "wi-night-rain-mix",
	nt_chancesnow : "wi-snow",
	nt_chancetstorms : "wi-storm-showers",
	nt_clear : "wi-night-clear",
	nt_cloudy : "wi-cloudy",
	nt_flurries : "wi-snow",
	nt_fog : "wi-fog",
	nt_hazy : "wi-night-fog",
	nt_mostlycloudy : "wi-night-cloudy",
	nt_mostlysunny : "wi-night-partly-cloudy",
	nt_partlycloudy : "wi-night-partly-cloudy",
	nt_partlysunny : "wi-night-cloudy",
	nt_rain : "wi-rain",
	nt_sleet : "wi-night-rain-mix",
	nt_snow : "wi-snow",
	nt_sunny : "wi-day-sunny",
	nt_tstorms : "wi-storm-showers"
};
