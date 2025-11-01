import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'

const App = () => {
  const [persons, setPersons] = useState([]);
  const [search, setSearch] = useState('');

  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [notification, setNotification] = useState({ message: null, type: null });

  const baseUrl = 'api/persons';

  // Notification helper functions
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: null, type: null });
    }, 5000);
  };

  // GET all persons
  useEffect(() => {
    axios.get(baseUrl)
      .then(response => setPersons(response.data))
      .catch(err => {
        console.log(err);
        showNotification('Failed to fetch contacts from server', 'error');
      });
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
            showNotification(`Updated ${newName}'s number`, 'success');
          })
          .catch(err => {
            if (err.response && err.response.status === 404) {
              showNotification(`Information of ${newName} has already been removed from server`, 'error');
              setPersons(persons.filter(person => person.id !== existingPerson.id));
            } else if (err.response && err.response.status === 400) {
              showNotification(err.response.data.error || 'Validation error', 'error');
            } else {
              showNotification(`Failed to update ${newName}`, 'error');
            }
          });
      }
      return;
    }

    const newPerson = { name: newName, number: newNumber };
    axios.post(baseUrl, newPerson)
      .then(response => {
        setPersons([...persons, response.data]);
        setNewName('');
        setNewNumber('');
        showNotification(`Added ${newName}`, 'success');
      })
      .catch(err => {
        if (err.response && err.response.data.error) {
          showNotification(err.response.data.error, 'error');
        } else {
          showNotification(`Failed to add ${newName}`, 'error');
        }
      });
  }

  // DELETE a person
  function handleDelete(id, name) {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      axios.delete(`${baseUrl}/${id}`)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id));
          showNotification(`Deleted ${name}`, 'success');
        })
        .catch(err => {
          if (err.response && err.response.status === 404) {
            showNotification(`Information of ${name} has already been removed from server`, 'error');
            setPersons(persons.filter(person => person.id !== id));
          } else {
            showNotification(`Failed to delete ${name}`, 'error');
          }
        });
    }
  }

  // Filter persons by search
  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(search.toLowerCase())
  );

  // Notification component
  const Notification = ({ notification }) => {
    if (!notification.message) return null;

    const notificationStyle = {
      padding: '10px',
      marginBottom: '20px',
      borderRadius: '5px',
      border: `2px solid ${notification.type === 'success' ? 'green' : 'red'}`,
      backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
      color: notification.type === 'success' ? '#155724' : '#721c24',
    };

    return (
      <div style={notificationStyle}>
        {notification.message}
      </div>
    );
  };

  return (
    <div className="container">
      <h2>Phonebook</h2>
      <Notification notification={notification} />
      <div className="filter-section">
        <label htmlFor="filter">Filter shown with: </label>
        <input
          id="filter"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <h2>Add a New</h2>
      <form onSubmit={submitHandler} className="form">
        <div className="form-group">
          <label htmlFor="name">Name: </label>
          <input 
            id="name"
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="number">Number: </label>
          <input 
            id="number"
            value={newNumber} 
            onChange={e => setNewNumber(e.target.value)} 
          />
        </div>
        <div>
          <button type="submit" className="btn-add">add</button>
        </div>
      </form>

      <h2>Numbers</h2>
      <div className="numbers-list">
        {filteredPersons.map(person => (
          <div key={person.id} className="person-item">
            <span className="person-name">{person.name}</span>
            <span className="person-number">{person.number}</span>
            <button 
              onClick={() => handleDelete(person.id, person.name)}
              className="btn-delete"
            >
              delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
