require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
const password = process.env.PASSWORD;
const url = `mongodb+srv://bijaypokhrel05:${password}@cluster0.w7whl48.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`;

// connecting the mongoDB
mongoose.connect(url).then(() => console.log('MongoDB is successfully connected!'))
.catch(err => console.log('Error:', err));

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true
    },
    number: {
        type: String,
        minlength: 8,
        validate: function (number) {
            return /^\d{2, 3}-\d+$/.test(number);
        },
        required: true
    }
});

personSchema.set('toJSON', {
    transform: (document, responseObj) => {
        responseObj.id = String(responseObj._id)
        delete responseObj._id;
        delete responseObj.__v;
    }
})

const Person = mongoose.model("Person", personSchema);

module.exports = Person;
