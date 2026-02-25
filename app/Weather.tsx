'use client'

export type Weather = {
  coord: {
    lon: number;
    lat: number;
  };

  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];

  base: string;

  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };

  visibility: number;

  wind: {
    speed: number;
    deg: number;
  };

  clouds: {
    all: number;
  };

  dt: number;

  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };

  timezone: number;
  id: number;
  name: string;
  cod: number;
};


import { useEffect, useState } from "react";

export default function Weather() {
    const [isAllow, setIsAllow] = useState(false);
    const [weatherData, setWeatherData] = useState<Weather | null>(null);
    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>({
        lon: -27.0369,
        lat: 37.0902,
    });    

    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            try {
            const res = await fetch(
                `/api/weather?lat=${lat}&lon=${lon}`,
                { cache: "no-store" }
            );
            const data = await res.json();
            setWeatherData(data);
            } catch (e) {
            console.log("날씨 요청 실패:", e);
            }
        };

        const fallback = () => {
            const lat = 37.5665;   // 서울 기본값
            const lon = 126.9780;
            // const lat = 64.0;   // 서울 기본값
            // const lon = 149.0;
            setIsAllow(false);
            setCoords({ lat, lon });
            fetchWeather(lat, lon);
        };

        if (!navigator.geolocation) {
            fallback();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            setIsAllow(true);
            setCoords({ lat, lon });
            fetchWeather(lat, lon);
            },
            (error) => {
            console.log("위치 실패:", error);
            fallback();
            },
            {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 60000,
            }
        );
        }, []);

    const getOutdoorScore = (data: Weather) => {
        let score = 100;

        const temp = data.main.temp;
        const feels = data.main.feels_like;
        const humidity = data.main.humidity;
        const wind = data.wind.speed;
        const weatherId = data.weather[0].id;

        // 기온 패널티
        if (temp < 0) score -= 25;
        else if (temp < 10) score -= 10;
        else if (temp > 30) score -= 15;

        // 체감온도 차이
        if (Math.abs(temp - feels) > 5) score -= 5;

        // 습도
        if (humidity > 80) score -= 10;
        if (humidity < 20) score -= 5;

        // 풍속
        if (wind > 8) score -= 10;

        // 비/눈 (2xx,3xx,5xx,6xx)
        if (weatherId >= 200 && weatherId < 700) score -= 30;

        return Math.max(score, 0);
    };
    
    const weatherLate = (score: number) => {
        if (score > 85) {
            return 'high';
        }
        if (score > 65) {
            return 'mid';
        }
        else {
            return 'bad';
        }
    }

    return (
        <div className="page">
            {weatherData === null ? 
            <div className="bg day">
                <svg className="spinner" viewBox="0 0 50 50">
                    <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="5"
                    />
                </svg>
                <div className="text">
                    Loading ...
                </div>
            </div> :
            <div>
                <div className={`bg ${weatherData &&
                    weatherData.dt >= weatherData.sys.sunrise &&
                    weatherData.dt < weatherData.sys.sunset ? 'day' : 'night'}`}>


                    <div className="cloud">
                        <div className="cl c1"></div>
                        <div className="cl c2"></div>
                        <div className="cl c3"></div>
                    </div>

                    <div className="city"></div>

                    <div className="obj">
                        <div className="star s1">
                            
                        </div>
                        <div className="star s2">
                            
                        </div>
                        <div className="star s3">
                            
                        </div>

                        <div className="moon">

                        </div>
                    </div>

                    {
                        Number(weatherData?.weather[0].id) === 500 &&
                        <div className="rain"></div>
                    }
                </div>
                <div className="exp">
                    <div className="location">
                        {weatherData?.name}
                    </div>
                    <div className="status">
                        
                        <div className="item">
                            <div className="key">외출 점수</div>
                            <div className="value">
                                <span className={`weatherSpan ${weatherLate(getOutdoorScore(weatherData))}`}>
                                    {getOutdoorScore(weatherData)}점 (<span className="weatherRate">{weatherLate(getOutdoorScore(weatherData)) === 'high' ? '좋음' : ''}{weatherLate(getOutdoorScore(weatherData)) === 'mid' ? '보통' : ''}{weatherLate(getOutdoorScore(weatherData)) === 'bad' ? '나쁨' : ''}</span>)
                                </span>
                            </div>
                        </div>
                        <div className="item">
                            <div className="key">
                                상태
                            </div>
                            <div className="value">
                                {weatherData?.weather[0]?.description}
                            </div>
                        </div>
                        <div className="item">
                            <div className="key">
                                온도
                            </div>
                            <div className="value">
                                {(weatherData?.main?.temp)}도
                            </div>
                        </div>
                        <div className="item">
                            <div className="key">체감</div>
                            <div className="value">
                                {weatherData?.main?.feels_like}°C
                            </div>
                        </div>
                        <div className="item">
                            <div className="key">습도</div>
                            <div className="value">
                            {weatherData?.main?.humidity}%
                            </div>
                        </div>
                        <div className="item">
                            <div className="key">풍속</div>
                            <div className="value">
                                {weatherData?.wind?.speed} m/s
                            </div>
                        </div>
                        <div className="item">
                            <div className="key">가시거리</div>
                            <div className="value">
                                {(weatherData?.visibility ?? 0) / 1000} km
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
            }
            
            
        </div>
    );
}