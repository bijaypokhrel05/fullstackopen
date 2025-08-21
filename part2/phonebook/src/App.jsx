import { useState } from 'react'
import data from '/db.json';

const App = () => {
  const [persons, setPersons] = useState(data.persons);
  const [search, setSearch] = useState('');

  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');


  function submitHandler(e) {
    e.preventDefault();
    const nameExists = persons.some(person => person.name === newName);
    if (nameExists) {
      alert(`${newName} is already added to phonebook`);
      return;
    } else {
      setPersons([...persons, { name: newName, number: newNumber }]);
    }
    setNewName('');
    setNewNumber('');
  }

  const filterPersons = persons.filter(person => {
    if (person.name.toLowerCase().includes(search.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  })



  return (
    <div>
      <h2>Phonebook</h2>
      <div>
        filter shown with<input type='text' value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <h2>add a new</h2>
      <form onSubmit={e => submitHandler(e)}>
        <div>
          name: <input value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <div>
          number: <input type='text' value={newNumber} onChange={(e) => setNewNumber(e.target.value)} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
      <h2>Numbers</h2>
      {filterPersons.map(person => <p key={person.name}>{person.name} {person.number}</p>)}
    </div>
  )
}

export default App