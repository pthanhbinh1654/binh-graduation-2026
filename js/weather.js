import { i18n } from './i18n.js';

const CACHE_KEY = 'cantho_weather_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getWmoDetails(code) {
  if (code === 0) return { icon: '☀️', vi: 'Trời quang, nắng đẹp', en: 'Clear sky, sunny' };
  if (code === 1 || code === 2) return { icon: '🌤️', vi: 'Ít mây, nắng dịu', en: 'Partly cloudy' };
  if (code === 3) return { icon: '☁️', vi: 'Nhiều mây', en: 'Overcast' };
  if (code >= 45 && code <= 48) return { icon: '🌫️', vi: 'Có sương mù', en: 'Foggy' };
  if (code >= 51 && code <= 55) return { icon: '🌦️', vi: 'Mưa phùn nhẹ', en: 'Light drizzle' };
  if (code >= 61 && code <= 65) return { icon: '🌧️', vi: 'Có mưa', en: 'Rainy' };
  if (code >= 80 && code <= 82) return { icon: '🌦️', vi: 'Mưa rào thoáng qua', en: 'Passing showers' };
  if (code >= 95) return { icon: '⛈️', vi: 'Có dông sét', en: 'Thunderstorm' };
  return { icon: '⛅', vi: 'Thời tiết ôn hòa', en: 'Pleasant weather' };
}

export function initWeather(lat, lng, targetDateIso, getLang = () => 'vi') {
  const container = document.getElementById('weather-content');
  if (!container) return;

  const targetDateStr = targetDateIso.slice(0, 10); // "2026-10-31"

  function render(weatherData) {
    const lang = getLang();
    const t = i18n[lang].weather;

    container.innerHTML = '';

    if (!weatherData) {
      // Out of range or loading fallback
      const box = document.createElement('div');
      box.className = 'weather-fallback-note';
      box.textContent = t.outOfRange;
      container.appendChild(box);
      return;
    }

    if (weatherData.error) {
      const box = document.createElement('div');
      box.className = 'weather-fallback-note';
      box.textContent = t.error;
      container.appendChild(box);
      return;
    }

    if (weatherData.outOfRange) {
      const box = document.createElement('div');
      box.className = 'weather-fallback-note';
      box.textContent = t.outOfRange;
      container.appendChild(box);
      return;
    }

    // In range data
    const wmo = getWmoDetails(weatherData.weathercode);
    const wrap = document.createElement('div');
    wrap.className = 'weather-loaded-content';

    const iconDiv = document.createElement('div');
    iconDiv.className = 'weather-main-icon';
    iconDiv.textContent = wmo.icon;

    const statsDiv = document.createElement('div');
    statsDiv.className = 'weather-stats';

    const tempDiv = document.createElement('div');
    tempDiv.className = 'weather-temp';
    tempDiv.textContent = `${Math.round(weatherData.tempMin)}°C - ${Math.round(weatherData.tempMax)}°C`;

    const condDiv = document.createElement('div');
    condDiv.className = 'weather-sub';
    condDiv.textContent = `${t.condition} ${wmo[lang]}`;

    const rainDiv = document.createElement('div');
    rainDiv.className = 'weather-sub';
    rainDiv.textContent = `${t.rainProb} ${weatherData.rainProb}%`;

    statsDiv.appendChild(tempDiv);
    statsDiv.appendChild(condDiv);
    statsDiv.appendChild(rainDiv);

    wrap.appendChild(iconDiv);
    wrap.appendChild(statsDiv);
    container.appendChild(wrap);
  }

  async function fetchForecast() {
    // Check cache
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          render(parsed.data);
          return parsed.data;
        }
      }
    } catch (_) {}

    // Show skeleton while fetching
    container.innerHTML = `
      <div class="skeleton-box" style="width: 60%; margin: 0 auto 12px;"></div>
      <div class="skeleton-box" style="width: 40%; margin: 0 auto;"></div>
    `;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=Asia/Ho_Chi_Minh`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();

      let result = null;
      if (data && data.daily && Array.isArray(data.daily.time)) {
        const index = data.daily.time.indexOf(targetDateStr);
        if (index !== -1) {
          result = {
            tempMax: data.daily.temperature_2m_max[index],
            tempMin: data.daily.temperature_2m_min[index],
            rainProb: data.daily.precipitation_probability_max ? data.daily.precipitation_probability_max[index] : 0,
            weathercode: data.daily.weathercode[index]
          };
        } else {
          result = { outOfRange: true };
        }
      } else {
        result = { outOfRange: true };
      }

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: result }));
      } catch (_) {}

      render(result);
      return result;
    } catch (err) {
      const errorResult = { error: true };
      render(errorResult);
      return errorResult;
    }
  }

  let latestData = null;
  fetchForecast().then(data => { latestData = data; });

  return () => {
    render(latestData);
  };
}
