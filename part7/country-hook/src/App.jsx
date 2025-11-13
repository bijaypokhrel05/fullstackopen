import React, { useState, useEffect } from 'react'
import axios from 'axios'

const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  return {
    type,
    value,
    onChange
  }
}

const useCountry = (name) => {
  const [country, setCountry] = useState(null);
  const [notFound, setNotFound] = useState(true);

  useEffect(() => {
    const fetchCountry = async () => {
      const response = await axios.get(`https://studies.cs.helsinki.fi/restcountries/api/name/${name}`);
      setCountry(response.data);
      setNotFound(false);
    }
    fetchCountry();
  }, [name]);

  return {country, notFound};
}

const Country = ({ country, notFound }) => {
  if(notFound) return <div>not found...</div>
  if (!country) {
    return null
  }

  return (
    <div>
      <h3>{country.name.common} </h3>
      <div>capital {country.capital?.[0]} </div>
      <div>population {country.population}</div> 
      <img src={country.flags?.png} height='100' alt={`flag of ${country.name.common}`}/>  
    </div>
  )
}

const App = () => {
  const nameInput = useField('text')
  const [name, setName] = useState('')
  const { country, notFound } = useCountry(name)

  const fetch = (e) => {
    e.preventDefault()
    setName(nameInput.value)
  }

  return (
    <div>
      <form onSubmit={fetch}>
        <input {...nameInput} />
        <button>find</button>
      </form>

      <Country country={country} notFound={notFound}/>
    </div>
  )
}

export default App