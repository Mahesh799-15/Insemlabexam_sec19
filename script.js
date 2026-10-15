// Turn the weather code into: [text, icon, background theme]
function getWeatherInfo(code, isDay) {
  if (code === 0) return isDay ? ["Clear sky", "☀️", "sunny"] : ["Clear night", "🌙", "night"];
  if (code === 1) return isDay ? ["Mainly clear", "🌤️", "sunny"] : ["Mainly clear", "🌙", "night"];
  if (code === 2) return isDay ? ["Partly cloudy", "⛅", "sunny"] : ["Partly cloudy", "☁️", "night"];
  if (code === 3) return ["Cloudy", "☁️", "cloudy"];
  if (code === 45 || code === 48) return ["Fog", "🌫️", "fog"];
  if (code >= 51 && code <= 57) return ["Drizzle", "🌦️", "rain"];
  if (code >= 61 && code <= 67) return ["Rain", "🌧️", "rain"];
  if (code >= 71 && code <= 77) return ["Snow", "❄️", "snow"];
  if (code >= 80 && code <= 82) return ["Rain showers", "🌧️", "rain"];
  if (code === 85 || code === 86) return ["Snow showers", "🌨️", "snow"];
  if (code >= 95) return ["Thunderstorm", "⛈️", "storm"];
  return ["Unknown", "🌡️", "sunny"];
}

// Show an error message
function showError(message) {
  var errorBox = document.getElementById("error");
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  document.getElementById("result").classList.add("hidden");
}

// Main function: fetch + async/await
async function getWeather() {
  var city = document.getElementById("cityInput").value.trim();
  var loading = document.getElementById("loading");
  var result = document.getElementById("result");

  // Reset screen
  document.getElementById("error").classList.add("hidden");
  result.classList.add("hidden");

  // Error: empty input
  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  loading.classList.remove("hidden");

  try {
    // Step 1: city name -> latitude and longitude
    var geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1";
    var geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) { throw new Error("Geocoding failed"); }
    var geoData = await geoResponse.json();

    // Error: city not found
    if (!geoData.results || geoData.results.length === 0) {
      showError('City "' + city + '" not found. Check the spelling.');
      return;
    }

    var place = geoData.results[0];

    // Step 2: latitude and longitude -> weather
    var weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + place.latitude +
      "&longitude=" + place.longitude +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day";
    var weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) { throw new Error("Weather failed"); }
    var weatherData = await weatherResponse.json();
    var current = weatherData.current;

    // Step 3: show on page
    var info = getWeatherInfo(current.weather_code, current.is_day === 1);

    document.getElementById("cityName").textContent = place.name + ", " + place.country;
    document.getElementById("weatherIcon").textContent = info[1];
    document.getElementById("temperature").textContent = Math.round(current.temperature_2m) + "°C";
    document.getElementById("weather").textContent = info[0];
    document.getElementById("humidity").textContent = current.relative_humidity_2m + "%";
    document.getElementById("feelsLike").textContent = Math.round(current.apparent_temperature) + "°C";
    document.getElementById("wind").textContent = Math.round(current.wind_speed_10m) + " km/h";

    // Change the background to match the weather
    document.body.setAttribute("data-theme", info[2]);

    result.classList.remove("hidden");
  } catch (error) {
    // Error: no internet or API failed
    showError("Could not get weather. Check your internet and try again.");
  } finally {
    loading.classList.add("hidden");
  }
}