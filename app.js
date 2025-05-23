const API_KEY = 'fb84b4739d5379b4bbc41fedbc43f08b';
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const weatherIcon = document.getElementById('weatherIcon');
const description = document.getElementById('description');
const forecast = document.getElementById('forecast');
const weatherInfo = document.getElementById('weatherInfo');
const error = document.getElementById('error');
const cityDropdown = document.getElementById('cityDropdown');
const recentCities = document.getElementById('recentCities');

function displayError(msg) {
    error.textContent = msg;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

function updateRecentCities(city) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    cities = [city, ...cities.filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 5);
    localStorage.setItem('recentCities', JSON.stringify(cities));
    renderRecentCities();
}

function renderRecentCities() {
    const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (cities.length === 0) {
        recentCities.classList.add('hidden');
        return;
    }
    recentCities.classList.remove('hidden');
    cityDropdown.innerHTML = `<option value="" disabled selected>Select a city</option>`;
    cities.forEach(city => {
        const option = document.createElement('option');
        option.textContent = city;
        option.value = city;
        cityDropdown.appendChild(option);
    });
}

async function getWeather(city) {
    hideError();
    try {
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!weatherRes.ok) throw new Error('City not found.');
        const weatherData = await weatherRes.json();

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastRes.json();

        displayWeather(weatherData);
        displayForecast(forecastData.list);
        updateRecentCities(city);
    } catch (err) {
        displayError(err.message);
    }
}

async function getWeatherByCoords(lat, lon) {
    hideError();
    try {
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherRes.json();

        const city = weatherData.name;
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastRes.json();

        displayWeather(weatherData);
        displayForecast(forecastData.list);
        updateRecentCities(city);
    } catch (err) {
        displayError('Unable to get location weather.');
    }
}

function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `Temperature: ${data.main.temp}°C`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    wind.textContent = `Wind: ${data.wind.speed} m/s`;
    description.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherInfo.classList.remove('hidden');
}

function displayForecast(list) {
    forecast.innerHTML = '';
    const daily = list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);
    daily.forEach(item => {
        const date = new Date(item.dt_txt).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
        forecast.innerHTML += `
      <div class="bg-blue-100 rounded-lg p-2 text-center">
        <p class="font-semibold">${date}</p>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" class="mx-auto w-10" />
        <p>${item.main.temp}°C</p>
        <p>${item.wind.speed} m/s</p>
        <p>${item.main.humidity}%</p>
      </div>`;
    });
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeather(city);
    else displayError('Please enter a city name.');
});

locationBtn.addEventListener('click', () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            () => displayError('Location access denied.')
        );
    } else {
        displayError('Geolocation not supported.');
    }
});

cityDropdown.addEventListener('change', () => {
    const city = cityDropdown.value;
    if (city) getWeather(city);
});

// Initialize
renderRecentCities();
