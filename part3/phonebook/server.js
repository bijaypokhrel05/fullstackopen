// importing the express depedencies
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));
//using morgan middleware for request logger
app.use(morgan('dev'));

//for using the post request we have to use json middleware
let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (req, res) => {
    res.json(persons);
})

app.get('/info', (req, res) => {
    const date = new Date();
    res.send(`<p>Phonebook has info of ${persons.length} people</p>
        <p>${date.toString()}</p>`);
})

app.get('/api/persons/:id', (req, res) => {
    const phoneId = req.params.id;
    const person = persons.find(person => person.id === phoneId);

    if (person) {
        res.json(person);
        console.log(`Successfully fetched the data with id - ${phoneId}`);
    } else {
        res.status(404).json({error: "Person not found!"});
    }
})


app.delete('/api/persons/:id', (req, res) => {
    const phoneId = Number(req.params.id);
    const personExists = persons.some(person => person.id !== phoneId);

    if (personExists) {
        return res.status(404).json({'error': "Person not found"});
    }

    persons = persons.filter(person => person.id !== phoneId);
    res.status(204).end();
})

app.post('/api/persons', (req, res) => {
    const body = req.body;

    const personObj = {
        id: Math.floor(Math.random() * persons.length),
        name: body.name,
        phone: body.phone
    };

    if (!body.name || !body.phone) {
        persons = persons.concat(personObj);
        res.json(personObj);
    } else {
        res.status(400).json({error: "name must be unique"});
    }
})


const port = process.env.PORT?process.env.PORT:3001;

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
