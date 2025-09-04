require('dotenv').config();
const mongoose = require('mongoose');

const password = process.env.PASSWORD || process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

mongoose.connect(`mongodb+srv://bijaypokhrel05:${password}@cluster0.w7whl48.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`).
then(() => console.log('MongoDB is successfully connected!'));

const phoneSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model("Person", phoneSchema);

if (process.argv.length === 3) {
    Person.find({}).then(persons => {
        console.log(persons)
        console.log("phonebook");
        persons.forEach(person => {
            console.log(`${person.name} ${person.number}`);
        })
        mongoose.connection.close();
    })
}  
else {
    const person = new Person({ name, number });
    person.save().then(() => {
        console.log(`added ${name} number ${number} to phonebook`);
        mongoose.connection.close();
    })
}



