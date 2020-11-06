import React, { useState , useEffect } from 'react';
import './App.css';
import {
  FormControl,
  MenuItem,
  Select,
  Card,
  CardContent
} from '@material-ui/core'
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table'
import { sortData , prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import 'leaflet/dist/leaflet.css'
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';

function App() {
  const [countries,setCountries] = useState([]);
  const [country,setCountry] = useState("worldwide");
  const [countryInfo,setCountryInfo] = useState({});
  const [tableData,setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom,setMapZoom] = useState(3)
  const [mapCountries,setMapCountries] = useState([])
  const [casesType,setCasesType] = useState("cases")

  useEffect(()=>{
      fetch('https://disease.sh/v3/covid-19/all')
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data)
      })
    },[])

  useEffect(()=>{
    const getCountriesData = async () => {
      fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          let sortedData = sortData(data);
          setCountries(countries);
          setMapCountries(data);
          setTableData(sortedData);
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) =>{
    const countryCode = event.target.value;
    setCountry(countryCode)

    const url = countryCode === 'worldwide' 
      ? 'https://disease.sh/v3/covid-19/all' 
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url) 
    .then((response)=> response.json())
    .then(data=>{
      setCountry(countryCode)
      setCountryInfo(data)
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })
  }
  console.log("COUNTRY INFO >>>>>>" , countryInfo )

  return (
    <div className="app">
      <header id="home">
        <div className="app_left">
          <div className="app_header">
            <h1>Covid 19 Tracker</h1>
            <FormControl className="app_dropdown">
              <Select
                variant="outlined"
                value={country}
                onChange={onCountryChange}
              >
                <MenuItem value="worldwide">Worldwide</MenuItem>
                {
                  countries.map((country) => (
                    <MenuItem value={country.value}>{country.name}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </div>
          <div className="app_stats">
            
            <InfoBox
              isRed
              active={casesType === "cases"}
              onClick={(e)=>setCasesType('cases')}
              title="Coronavirus Cases" 
              cases={prettyPrintStat(countryInfo.todayCases)}  
              total={prettyPrintStat(countryInfo.cases)}
            />
            <InfoBox 
              active={casesType === "recovered"}
              onClick={(e)=>setCasesType('recovered')}
              title="Recovered" 
              cases={prettyPrintStat(countryInfo.todayRecovered)} 
              total={prettyPrintStat(countryInfo.recovered)}
            />
            <InfoBox
              isRed 
              active={casesType === "deaths"}
              onClick={(e)=>setCasesType('deaths')}
              title="Deaths" 
              cases={prettyPrintStat(countryInfo.todayDeaths)} 
              total={prettyPrintStat(countryInfo.deaths)}
            />
            
          </div>

          <div className="nav">
            <a href="#graph">
              <ArrowDropDownCircleIcon style={{marginLeft:"45vw"}} />
            </a>
          </div>
          
          <div style={{justifyItems:"center",justifyContent:"center"}} className="mapContainer">
            
            <Map
              casesType={casesType}
              countries={mapCountries}
              center={mapCenter}
              zoom={mapZoom}
            />
          </div>
        </div>
      </header>
      <header id="graph">
        <Card   className="app_right">
          <CardContent>
                <h3>Live cases by country</h3>
                <Table countries={tableData} />
                <h3 className="app_graphTitle">Worldwide new {casesType}</h3>
                <LineGraph className="app_graph" casesType={casesType}/>
          </CardContent>
        </Card >
      </header>
    </div>
  );
}

export default App;
