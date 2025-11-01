import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch countries when search changes
  useEffect(() => {
    if (search.trim() === '') {
      setCountries([]);
      setSelectedCountry(null);
      setWeather(null);
      return;
    }

    setLoading(true);
    axios
      .get(`https://restcountries.com/v3.1/name/${search}`)
      .then(response => {
        setCountries(response.data);
        setLoading(false);
        // If only one country, show it automatically
        if (response.data.length === 1) {
          setSelectedCountry(response.data[0]);
        } else {
          setSelectedCountry(null);
        }
      })
      .catch(error => {
        console.log('Error fetching countries:', error);
        setCountries([]);
        setLoading(false);
      });
  }, [search]);

  // Fetch weather when a country is selected
  useEffect(() => {
    if (!selectedCountry || !selectedCountry.capital || selectedCountry.capital.length === 0) {
      setWeather(null);
      return;
    }

    const capital = selectedCountry.capital[0];
    // Using OpenWeatherMap API - Get your free API key from https://openweathermap.org/api
    // Create a .env file in the root directory and add: REACT_APP_WEATHER_API_KEY=your_api_key_here
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
    
    if (!API_KEY) {
      console.log('Weather API key not found. Please set VITE_WEATHER_API_KEY in your .env file');
      console.log('Get your free API key from: https://openweathermap.org/api');
      // For demo purposes, we'll use a mock response
      setWeather({
        temp: 'N/A',
        condition: 'API key required',
        windSpeed: 'N/A',
        note: 'Please add your OpenWeatherMap API key to view weather data'
      });
      return;
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${API_KEY}&units=metric`;

    axios
      .get(weatherUrl)
      .then(response => {
        setWeather({
          temp: response.data.main.temp,
          condition: response.data.weather[0].description,
          windSpeed: response.data.wind?.speed || 0,
          humidity: response.data.main.humidity,
          icon: response.data.weather[0].icon
        });
      })
      .catch(error => {
        console.log('Weather API error:', error);
        if (error.response && error.response.status === 401) {
          setWeather({
            temp: 'N/A',
            condition: 'Invalid API key',
            windSpeed: 'N/A',
            note: 'Please check your API key'
          });
        } else {
          setWeather({
            temp: 'N/A',
            condition: 'Weather data unavailable',
            windSpeed: 'N/A',
            note: 'Could not fetch weather data'
          });
        }
      });
  }, [selectedCountry]);

  const handleShowCountry = (country) => {
    setSelectedCountry(country);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="container">
      <h1>Country Finder</h1>
      <div className="search-section">
        <label htmlFor="search">Find countries: </label>
        <input
          id="search"
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Enter country name..."
        />
      </div>

      {loading && <p>Loading...</p>}

      {countries.length > 10 && (
        <p>Too many matches, specify another filter</p>
      )}

      {countries.length > 1 && countries.length <= 10 && (
        <div className="country-list">
          {countries.map(country => (
            <div key={country.cca2} className="country-item">
              <span>{country.name.common}</span>
              <button onClick={() => handleShowCountry(country)}>show</button>
            </div>
          ))}
        </div>
      )}

      {selectedCountry && (
        <div className="country-details">
          <h2>{selectedCountry.name.common}</h2>
          <div className="flag-section">
            <img 
              src={selectedCountry.flags.png} 
              alt={`Flag of ${selectedCountry.name.common}`}
              className="flag"
            />
          </div>
          <div className="info-section">
            <p><strong>Capital:</strong> {selectedCountry.capital?.join(', ') || 'N/A'}</p>
            <p><strong>Area:</strong> {selectedCountry.area.toLocaleString()} km²</p>
            <p><strong>Languages:</strong></p>
            <ul>
              {Object.values(selectedCountry.languages || {}).map(language => (
                <li key={language}>{language}</li>
              ))}
            </ul>
          </div>

          {weather && selectedCountry.capital && (
            <div className="weather-section">
              <h3>Weather in {selectedCountry.capital[0]}</h3>
              <p><strong>Temperature:</strong> {weather.temp}°C</p>
              <p><strong>Condition:</strong> {weather.condition}</p>
              <p><strong>Wind:</strong> {weather.windSpeed} m/s</p>
              {weather.humidity && (
                <p><strong>Humidity:</strong> {weather.humidity}%</p>
              )}
              {weather.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.condition}
                  className="weather-icon"
                />
              )}
              {weather.note && (
                <p className="weather-note"><em>{weather.note}</em></p>
              )}
            </div>
          )}
        </div>
      )}

      {countries.length === 0 && search.trim() !== '' && !loading && (
        <p>No countries found</p>
      )}
    </div>
  );
};

export default App;
