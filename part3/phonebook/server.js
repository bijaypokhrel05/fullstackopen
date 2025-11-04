// importing the express depedencies
require("dotenv").config();
const express = require('express');
const Person = require('./models/person.js');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.static('dist'));
app.use(express.json());
app.use(cors());
//using morgan middleware for request logger
app.use(morgan('dev'));

//for using the post request we have to use json middleware
// let persons = [
//     { 
//       "id": "1",
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": "2",
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": "3",
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": "4",
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons);
    })
})


app.get('/api/persons/:id', (req, res, next) => {
    const phoneId = req.params.id;
    const person = Person.findById(id).then(person => {
        if (person) {
            res.json(person);
        } else {
            res.status(404).send({error: "Person Not Found!"});
        }
    }).catch(err => next(err));
})



app.delete('/api/persons/:id', (req, res, next) => {
    const phoneId = Number(req.params.id);
    // if (!personExists) {
    //     return res.status(404).json({'error': "Person not found"});
    // }

    // persons = persons.filter(person => person.id !== phoneId);
    // res.status(204).end();
    Person.findByIdAndDelete(phoneId).then(person => {
        if(person) {
            res.status(204).end();
        } else {
            res.status(404).send('Person Not Found!');
        }
    }).catch(err => next(err));

})

app.post('/api/persons', (req, res, next) => {
    const body = req.body;

    if (!body.name || !body.phone) {
       return res.status(400).json({
        Error: 'No name and phone number'
       })
    } 

    const person = new Person(body);
    person.save().then(person => res.json(person))
    .catch(err => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body
  const id = req.params.id
  if (!body.name || !body.number) {
    return res.status(400).json({ error: "No name or number" })
  }

  const updatedPerson = { name: body.name, number: body.number }
  console.log(updatedPerson)
  Person.findByIdAndUpdate(id, updatedPerson, { new: true, runValidators: true, context: "query" }).then(updated => {
    console.log(updated)
    if (updated) {
      res.json(updated)
    } else {
      res.status(404).json({ Error: "Person Not Found" })
    }
  })
    .catch(err => next(err))
})

app.get('/info', (req, res) => {
    const date = new Date();
    Person.countDocuments({}).then(length => {
        res.send(`<p>Phonebook has info of ${length} people</p>
            <p>${date.toString()}</p>`);
    }).catch(err => next(err));
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}


const port = process.env.PORT?process.env.PORT:3001;

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
