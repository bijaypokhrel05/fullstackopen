# Countries App - Full Stack Open Part 2-e Exercises

This application is part of the Full Stack Open course exercises (2.22-2.24).

## Features

- **Exercise 2.22**: Fetch and display countries from REST Countries API with search functionality
- **Exercise 2.23**: Show detailed country information (capital, population, languages, flag)
- **Exercise 2.24**: Display weather information for the capital city using OpenWeatherMap API

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Set up weather API:
   - Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
   - Create a `.env` file in the root directory
   - Add: `VITE_WEATHER_API_KEY=your_api_key_here`
   - Note: The app will work without the API key but weather data will not be displayed

3. Run the development server:
```bash
npm run dev
```

## Usage

1. Enter a country name in the search box
2. If multiple countries match, click "show" to view details
3. If only one country matches, details are shown automatically
4. Weather information for the capital city will be displayed (if API key is configured)

## API Endpoints Used

- REST Countries API: https://restcountries.com/v3.1/name/{name}
- OpenWeatherMap API: https://api.openweathermap.org/data/2.5/weather
