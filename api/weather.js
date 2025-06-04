import axios from 'axios';
import { API_KEY } from '@env';

const forecastEndpoint = params => `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;
const locationsEndpoint = params => `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${params.cityName}`;

const apiCall = async (endpoint)=>{
    const options = {
        method: 'GET',
        url: endpoint
    }
    try {
        const response = await axios.request(options);
        return response.data;
    } catch(err) {
        console.log('Error: ', err);
    }
}

export const fetchWeatherForecast = params => {
    return apiCall(forecastEndpoint(params));
}
export const fetchLocations = params => {
    return apiCall(locationsEndpoint(params));
}


