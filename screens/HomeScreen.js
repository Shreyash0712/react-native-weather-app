import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid';
import { debounce } from 'lodash';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '../constants';
import * as Progress from 'react-native-progress';
import { getData, storeData } from '../utils/asyncStorage';
import * as Animatable from 'react-native-animatable';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '3',
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);
    });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'New Delhi';
    if (myCity) cityName = myCity;

    fetchWeatherForecast({
      cityName,
      days: '3',
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
  const { current, location } = weather;

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
    
        <Image
            source={require('../assets/bg4.png')}
            className="absolute h-full w-full"
            blurRadius={30}
        />

      {loading ? (
        <View className="flex-1 flex-row justify-center items-center">
          <Progress.CircleSnail thickness={10} size={140} color="white" />
        </View>
      ) : (
        <SafeAreaView
          style={{ paddingTop: insets.top, paddingHorizontal: 16 }}
          className="flex-1 relative"
        >
          {/* Search bar */}
          <View
            className={`flex-row justify-end items-center px-0.5 ${
                showSearch ? 'bg-white/30 rounded-full' : ''
            }`}
            >
            {showSearch && (
                <Animatable.View
                animation="fadeInRight"
                duration={400}
                style={{ flex: 1 }}
                className="mr-2"
                >
                <TextInput
                    onChangeText={handleTextDebounce}
                    autoFocus
                    placeholder="Search City..."
                    placeholderTextColor="black"
                    className="py-2 px-4 text-black rounded-full"
                />
                </Animatable.View>
            )}

            <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                className="bg-white/50 rounded-full p-3 m-1"
            >
                <MagnifyingGlassIcon size={25} color="black" />
            </TouchableOpacity>

            {locations.length > 0 && showSearch && (
                <View className="absolute w-full bg-gray-300 top-16 rounded-3xl z-50">
                {locations.map((loc, index) => {
                    const showBorder = index + 1 !== locations.length;
                    const borderClass = showBorder ? ' border-b-2 border-b-gray-400' : '';
                    return (
                    <TouchableOpacity
                        onPress={() => handleLocation(loc)}
                        key={index}
                        className={
                        'flex-row items-center border-0 p-3 px-4 mb-1' + borderClass
                        }
                    >
                        <MapPinIcon size={20} color="gray" />
                        <Text className="text-black text-lg ml-5">
                        {loc?.name}, {loc?.country}
                        </Text>
                    </TouchableOpacity>
                    );
                })}
                </View>
            )}
            </View>



          {/* Current weather display */}
          <View className="mx-4 flex justify-around flex-1 mb-2">
            <Animatable.Text
              animation="fadeInDown"
              delay={300}
              duration={800}
              className="text-white text-center text-2xl font-bold"
            >
              {location?.name},{' '}
              <Text className="text-lg font-semibold text-gray-300">
                {location?.country}
              </Text>
            </Animatable.Text>

            <View className="justify-center flex-row">
              <Animatable.Image
                animation="bounceIn"
                delay={400}
                duration={1000}
                source={
                  weatherImages[current?.condition?.text] || weatherImages['other']
                }
                className="w-48 h-48"
              />
            </View>

            <Animatable.View
              animation="fadeInUp"
              delay={500}
              duration={1000}
              className="space-y-2"
            >
              <Text className="text-center font-bold text-white text-6xl ml-5">
                {current?.temp_c}&#176;C
              </Text>
              <Text className="text-center tracking-widest text-white text-2xl">
                {current?.temp_f}&#176;F
              </Text>
              <Text className="text-center tracking-widest text-white text-xl mt-5">
                {current?.condition?.text}
              </Text>
            </Animatable.View>

            <Animatable.View
              animation="fadeIn"
              delay={600}
              duration={1000}
              className="flex-row justify-between mx-4"
            >
              <View className="flex-row space-x-2 items-center">
                <Image source={require('../assets/icons/wind.png')} className="h-6 w-6" />
                <Text className="font-semibold text-white text-base ml-2">
                  {current?.wind_kph}km
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image source={require('../assets/icons/drop.png')} className="h-6 w-6" />
                <Text className="font-semibold text-white text-base ml-2">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image source={require('../assets/icons/sun.png')} className="h-6 w-6" />
                <Text className="font-semibold text-white text-base ml-2">
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </Animatable.View>
          </View>

          {/* Forecast */}
          <View className="mb-2 space-y-3">
            <Animatable.View
                animation="fadeIn"
                delay={650}
                duration={800}
                className="flex-row items-center mx-5 space-x-2 mb-5"
                >
                <CalendarDaysIcon size={22} color="white" />
                <Text className="text-white text-base ml-2">Daily Forecast</Text>
            </Animatable.View>

            <View className="flex-row justify-between px-4 mb-10">
              {weather?.forecast?.forecastday?.slice(0, 3).map((item, index) => {
                let date = new Date(item.date);
                let options = { weekday: 'long' };
                let dayName = date.toLocaleDateString('en-US', options).split(',')[0];
                return (
                  <Animatable.View
                    key={index}
                    animation="fadeInUp"
                    delay={700 + index * 200}
                    duration={1000}
                    className="flex-1 items-center rounded-3xl p-3 py-6 mx-1 space-y-1 bg-white/15"
                  >
                    <Image
                      source={
                        weatherImages[item?.day?.condition?.text] ||
                        weatherImages['other']
                      }
                      className="h-11 w-11"
                    />
                    <Text className="text-white">{dayName}</Text>
                    <Text className="text-white text-xl font-semibold">
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </Animatable.View>
                );
              })}
            </View>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
