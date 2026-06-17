// --- ЕЛЕМЕНТИ DOM ---
const currents = document.getElementById('current');
const currentNext = document.getElementById('currentNext');
const city = document.getElementById('city');
const nameFilter = document.getElementById("name-filter");

const API_KEY = 'd9f9d6d297d14631bd5133321262905';

// --- ВСЕОБХІДНІ ФУНКЦІЇ ---

// Універсальна функція для підбору іконки за текстом стану погоди
function getWeatherIcon(stateText) {
    const state = stateText.toLowerCase();

    if (state.includes("clear") || state.includes("sunny")) return 'sun.png';
    if (state.includes("overcast")) return 'overcast.png';
    if (state.includes("cloudy") && !state.includes("partly")) return 'cloud.png';
    if (state.includes("mist")) return 'fog.png';
    if (state.includes("fog")) {
        return state.includes("freezing") ? 'freezing_fog.png' : 'fog.png';
    }
    if (state.includes("rain")) {
        return (state.includes("heavy") || state.includes("torrential")) ? 'heavy_rain.png' : 'light_rain.png';
    }
    if (state.includes("snow")) {
        return state.includes("heavy") ? 'heavy_snow.png' : 'light_snow.png';
    }
    if (state.includes("blizzard")) return 'heavy_snow.png';
    if (state.includes("thunder")) return 'thunderstorm.png';
    if (state.includes("ice")) return 'ice_pellets.png';
    if (state.includes("sleet") || state.includes("drizzle")) return 'sleet.png';
    if (state.includes("partly") && state.includes("cloudy")) return 'partly_cloudy.png';

    return 'sun.png'; // Дефолтна іконка, якщо нічого не підійшло
}

// Функція для підбору іконки напрямку вітру
function getWindArrow(dir) {
    if (dir.includes("NE")) return 'arrowNE.png';
    if (dir.includes("NW")) return 'arrowNW.png';
    if (dir.includes("SW")) return 'arrowSW.png';
    if (dir.includes("SE")) return 'arrowSE.png';
    if (dir.includes("N")) return 'arrowN.png';
    if (dir.includes("W")) return 'arrowW.png';
    if (dir.includes("E")) return 'arrowE.png';
    if (dir.includes("S")) return 'arrowS.png';
    return 'arrowN.png';
}

// Шаблон для одного дня в прогнозі (щоб не дублювати HTML)
function createDayForecastHTML(dayData) {
    const icon = getWeatherIcon(dayData.day.condition.text);
    return `
        <div class="nextDay">
            <h1>${dayData.date}</h1>
            <div class="weather">
                <img src="img/${icon}">
                <div>
                    <h3>${dayData.day.avgtemp_c} °C</h3>
                    <h3>${dayData.day.avgvis_km} kph</h3>
                </div>
            </div>
            <div class="line">-</div>
            <div class="astro">
                <div class="sunrise">
                    <img src="img/sunrise.png">
                    <div>
                        <h2>Sunrise</h2>
                        <h2>${dayData.astro.sunrise}</h2>
                    </div>
                </div>
                <div class="line"></div>
                <div class="sunset">
                    <img src="img/sunset.png">
                    <div>
                        <h2>Sunset</h2>
                        <h2>${dayData.astro.sunset}</h2>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- ГОЛОВНА ФУНКЦІЯ ОТРЫМАННЯ ПОГОДИ ---
function updateWeather() {
    const town = city.value;
    if (!town) return;

    // Об'єднуємо запити в один (прогноз на 3 дні вже включає в себе поточну погоду current)
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${town}&days=3&aqi=no&alerts=no`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log("Weather Data:", data);

            // 1. Рендеримо поточну погоду (Верхня частина)
            const currentState = data.current.condition.text;
            const weatherDataIcon = getWeatherIcon(currentState);
            const windyDirIcon = getWindArrow(data.current.wind_dir);

            currents.innerHTML = `
                <div class="left_card">
                    <h1>CURRENT WEATHER</h1>
                    <div class="temp">
                        <h3>${data.current.temp_c} °C</h3>
                    </div>
                    <div class="line"></div>
                    <div class="rainChance">
                        <img src="img/umbrella.png" alt="">
                        <div class="cont"> 
                            <h3>Rain chance</h3>
                            <h3>${data.current.humidity} %</h3>
                        </div>
                    </div>
                </div>
                
                <div class="center_card">
                    <img src="img/${weatherDataIcon}">
                    <h2>${currentState}</h2>
                    <p class="data">Today ${data.current.last_updated}</p>
                </div>
                
                <div class="right_card">
                    <h1>WIND</h1>
                    <div class="windSpeed">
                        <img src="img/windy.png" alt="">
                        <div class="cont"> 
                            <h3>Wind speed</h3>
                            <h3>${data.current.wind_kph} kph</h3>
                        </div>
                    </div>
                    <div class="line"></div>
                    <div class="windDir">
                        <img src="img/${windyDirIcon}">
                        <div class="cont">
                            <h3>Wind direction</h3>
                            <h3>${data.current.wind_dir}</h3>
                        </div>
                    </div>
                </div>
            `;

            // 2. Рендеримо прогноз на 3 дні (Нижня частина)
            const forecastDays = data.forecast.forecastday;
            currentNext.innerHTML = `
                <div class="conteiner">
                    ${forecastDays.map(day => createDayForecastHTML(day)).join('')}
                </div>
            `;
        })
        .catch(err => console.error("Помилка завантаження погоди:", err));
}

// --- СЛУХАЧІ ПОДІЙ (EVENTS) ---

// Оновлюємо погоду при зміні міста
city.addEventListener('change', updateWeather);

// Фільтр міст (Пошук)
nameFilter.addEventListener('input', function() {
    const filterValue = this.value.toLowerCase();
    let firstVisibleOption = null;

    for (let option of city.options) {
        const cityText = option.text.toLowerCase();
        const cityValue = option.value.toLowerCase();

        if (cityText.includes(filterValue) || cityValue.includes(filterValue)) {
            option.style.display = "";
            if (!firstVisibleOption) {
                firstVisibleOption = option;
            }
        } else {
            option.style.display = "none";
        }
    }

    // Якщо поточне вибране місто сховане фільтром, перемикаємо на перше доступне
    if (firstVisibleOption && city.selectedOptions[0].style.display === "none") {
        city.value = firstVisibleOption.value;
        updateWeather(); // Викликаємо оновлення погоди для нового міста
    }
});

// Перший запуск при завантаженні сторінки
updateWeather();

// Інтервал оновлення ставимо на 15 хвилин (900000 мс), щоб не спамити API
setInterval(updateWeather, 900000);