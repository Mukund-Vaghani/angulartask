require('dotenv').config()
const express = require('express');
var app = express();


app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/', require('./middleware/validation').validateApiKey);
app.use('/', require('./middleware/validation').validateToken);

var auth = require('./model/v1/auth/route');
app.use('/api/v1/auth',auth);

try{
    app.listen(process.env.PORT);
    console.log('app listing on port :',process.env.PORT)
}catch{
    console.log('connection failed');
}