'use strict'

//Importamos librerias
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

//Importamos componentes
const Routes = require('./components/Routes/network.js');
const Factory = require('./components/Factory/network.js');
const config = require('./config');

//Inicializamos express
const app = express(); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Router
app.get('/', function(req, res){
    res.render('mainMenu');
});

app.use('/components/Routes', Routes);
app.use('/components/Factory', Factory);

//Starting server
app.listen(config.api.port, () => {
    console.log('Escuchando en puerto: ', config.api.port);
});
