import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'

const App = () => {
  const [persons, setPersons] = useState([]);
  const [search, setSearch] = useState('');

  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');

  const baseUrl = 'api/persons';

  // GET all persons
  useEffect(() => {
    axios.get(baseUrl)
      .then(response => setPersons(response.data))
      .catch(err => console.log(err));
  }, []);

  // POST new person
  function submitHandler(e) {
    e.preventDefault();

    const existingPerson = persons.find(person => person.name === newName);

    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with new one?`)) {
        const updatedPerson = { ...existingPerson, number: newNumber };
        axios.put(`${baseUrl}/${existingPerson.id}`, updatedPerson)
          .then(response => {
            setPersons(persons.map(person =>
              person.id !== existingPerson.id ? person : response.data
            ));
            setNewName('');
            setNewNumber('');
          })
          .catch(err => console.log(err));
      }
      return;
    }

    const newPerson = { name: newName, number: newNumber };
    axios.post(baseUrl, newPerson)
      .then(response => {
        setPersons([...persons, response.data]);
        setNewName('');
        setNewNumber('');
      })
      .catch(err => console.log(err));
  }

  // DELETE a person
  function handleDelete(id, name) {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      axios.delete(`${baseUrl}/${id}`)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id));
        })
        .catch(err => {
          console.log(err);
          alert(`Failed to delete ${name}.`);
        });
    }
  }

  // Filter persons by search
  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <div>
        filter shown with <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <h2>Add a New</h2>
      <form onSubmit={submitHandler}>
        <div>
          name: <input value={newName} onChange={e => setNewName(e.target.value)} />
        </div>
        <div>
          number: <input value={newNumber} onChange={e => setNewNumber(e.target.value)} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>

      <h2>Numbers</h2>
      {filteredPersons.map(person => (
        <p key={person.id}>
          {person.name} {person.number}
          <button onClick={() => handleDelete(person.id, person.name)}>delete</button>
        </p>
      ))}
    </div>
  );
};

export default App;
