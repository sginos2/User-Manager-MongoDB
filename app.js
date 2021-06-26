const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/testUser', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('we connected to mongo!');
});

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    age: String
});

const userData = mongoose.model('User', userSchema);

app.set('views', path.join(__dirname, 'views'));
app.use(express.static('views'));
app.use(express.urlencoded({extended: false}));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/create', (req, res) => {
    userData.create({
        "firstName": `${req.body.firstName}`, 
        "lastName": `${req.body.lastName}`, 
        "email": `${req.body.email}`, 
        "age": `${req.body.age}`
    }, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        res.redirect('/table');
    });
});

app.get('/table', (req, res) => {
    userData.find({}, (err, data)=> {
        if (err) return console.log(`Oops! ${err}`);
        res.render('users', {
            users: data
        });
    });
});

app.get('/sortOY', (req, res) => {
    userData.find({}).sort({age: -1}).exec((err, data) => { 
        if (err) return console.log(`Oops! ${err}`);
        res.render('users', {
            users: data
        });
    });
});

app.get('/sortYO', (req, res) => {
    userData.find({}).sort({age: 1}).exec((err, data) => { 
        if (err) return console.log(`Oops! ${err}`);
        res.render('users', {
            users: data
        });
    });
});

app.post('/search', (req, res) => {
    let searchStr = req.body.search.trim();
    userData.find({"firstName": { $regex: searchStr, $options: 'i' }}, (err, data)=> {
        if (err) return console.log(`Oops! ${err}`);
        res.render('users', {
            users: data
        });
    });
});

app.post('/table', (req, res) => {
    let userId = req.body.userId;
    userData.findByIdAndDelete({_id: userId}, function(err, result){
        if (err) return console.log(`${err}`);
        res.redirect('/table');
    });
});

app.get('/edit/:userId', (req, res) => {
    let id = req.params.userId;
    userData.find({_id: `${id}`}, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        res.render('editIndex', {
            firstNameField: data[0].firstName,
            lastNameField: data[0].lastName,
            emailField: data[0].email,
            ageField: data[0].age,
            userId: id
        });
    });
});

app.post('/edit/:userId', (req, res) => {
    let id = req.params.userId;
    userData.findByIdAndUpdate({_id: id}, {
        "firstName": `${req.body.firstName}`,
        "lastName": `${req.body.lastName}`,
        "email": `${req.body.email}`,
        "age": `${req.body.age}`
    }, function(err, result){
        if (err) return console.log(`${err}`);
        console.log(result)
        res.redirect('/table');
    });
});

app.listen(4000, () => {
    console.log('listening on port 4000');
});