//******************************************************************
//******************************************************************
//******************************************************************
//  Weather Underground scripts

// http://api.wunderground.com/api/c5209dc3ae8416a7/geolookup/q/35080.json
// http://api.wunderground.com/api/c5209dc3ae8416a7/conditions/q/35080.json
// http://api.wunderground.com/api/c5209dc3ae8416a7/forecast/q/35080.json
// http://api.wunderground.com/api/c5209dc3ae8416a7/forecast10day/q/35080.json
// http://api.wunderground.com/api/c5209dc3ae8416a7/astronomy/q/35080.json


function doWunderWeather() {
	getCurrentCondition();
	getForecastConditions();
	getWunderAstronomy();
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
	if (cachedForecast == undefined || 1 == 1) {
		console.log("cookie undefined, getting forecast conditions");
		var url = "https://api.wunderground.com/api/c5209dc3ae8416a7/forecast/q/35080.json";
		$.ajax(url, {
			success : function(result) {
				var forecasts = parseForecastArray(result);
				renderWunderForecast(forecasts);
				renderWunderForecasts(forecasts);
				setCookie("wunderForecast", forecasts, 45);
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

function getWunderAstronomy() {
	var cachedAstronomy = getCookie("wunderAstronomy");
	//deleteCookie("wunderAstronomy");
	if (cachedAstronomy == undefined) {
		console.log("cookie undefined, getting astronomy conditions");
		var url = "https://api.wunderground.com/api/c5209dc3ae8416a7/astronomy/q/35080.json";
		$.ajax(url, {
			success : function(result) {
				var astronomy = parseAstronomy(result);
				renderWunderAstronomy(astronomy);
				setCookie("wunderAstronomy", astronomy, 45);
			},
			error : function() {
				// Handle error
				console.log("Error occurred retrieving astronomy data.")
			}
		});
	} else {
		renderWunderAstronomy(cachedAstronomy);
	}
	setTimeout(getWunderAstronomy, 12 * 60 * 60 * 1000);
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

function parseForecastArray(result) {
	var forecasts = {};
	var j = 0;
	console.log("length: " + result.forecast.simpleforecast.forecastday.length);
	var arr = result.forecast.simpleforecast.forecastday;
	for (var i = 0; i < arr.length; i++) {
		console.log(arr[i]);
		forecasts[i] = parseForecastCondition(arr[i]);
	}
	return forecasts;
}

function parseForecastCondition(forecast) {
	var condition = new wunderCondition();
	condition.title = forecast.date.weekday_short;
	condition.tempHigh = forecast.high.fahrenheit;
	condition.tempLow = forecast.low.fahrenheit;
	condition.shortText = forecast.conditions;
	condition.precip = forecast.pop;
	var url = forecast.icon_url;
	url = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
	condition.icon = wunderIcons[url];
	return condition;
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

function parseAstronomy(result) {
	var phase = result.sun_phase;
	var astronomy = new wunderAstronomy();
	astronomy.sunriseHour = phase.sunrise.hour;
	astronomy.sunriseMinute = phase.sunrise.minute;
	astronomy.sunsetHour = phase.sunset.hour;
	astronomy.sunsetMinute = phase.sunset.minute;

	return astronomy;
}

function renderWunderAstronomy(astronomy) {
	$("#wunder-sunrise").text(astronomy.sunriseHour + ":" + astronomy.sunriseMinute + "am");
	$("#wunder-sunset").text((astronomy.sunsetHour - 12) + ":" + astronomy.sunsetMinute + "pm");
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
	$("#wunder-today-high").text(forecast[0].tempHigh + "°");
	$("#wunder-today-low").text(forecast[0].tempLow + "°");
	$("#wunder-today-condition").text(forecast[0].shortText);
	$("#wunder-today-precip").text(forecast[0].precip + "%");
	$("#wunder-today-icon").addClass(forecast[0].icon);
}

function renderWunderForecasts(forecasts) {
	var condition;
	for (var i = 0; i < forecast.length; i++) {
		console.log("render forecast " + i);
		condition = forecasts[i];
		console.log(" condition: " + condition.title);
		$("#wunder-forecasts-title-" + i).text(condition.title);
		$("#wunder-forecasts-hi-" + i).text(condition.tempHigh);
		$("#wunder-forecasts-lo-" + i).text(condition.tempLow);
		$("#wunder-forecasts-icon-" + i).addClass(condition.icon);
	}
}

function formatWunderWind2(speed, direction, gust) {
	//console.log("speed: " + speed);
	//console.log("direction: " + direction);
	//console.log("gust: " + gust);
	var windString = "Calm";
	if (speed > 0) {
		//console.log("ws: " + windString);
		var windDir = wunderWind[direction] == undefined ? direction : wunderWind[direction];
		//console.log("windDir: " + windDir);
		windString = Math.round(speed) + " " + windDir;
		//console.log("ws2: " + windString);
		//if (gust > speed) {
			//windString += " (gusts to " + Math.round(gust) + ")";
			//console.log("ws: " + windString);
		//}
	}
	console.log("returning: " + windString);
	return windString;
}

function formatWunderWind(speed, direction, gust) {
	//console.log("speed: " + speed);
	//console.log("direction: " + direction);
	//console.log("gust: " + gust);
	var windString = "Calm";
	if (speed > 0) {
		windString = Math.round(speed) + " " + direction;
	}
	console.log("returning: " + windString);
	return windString;
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
	this.tempHigh = "";
	this.tempLow = "";
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

var wunderAstronomy = function() {
	this.sunriseHour = 0;
	this.sunriseMinute = 0;
	this.sunsetHour = 0;
	this.sunsetMinute = 0;
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
