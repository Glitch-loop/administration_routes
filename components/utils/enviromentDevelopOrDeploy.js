'use strict'

//Importamos componentes
const config = require('../../config.js');
const connect = require('../../conection_store/controllerStore.js');


//Establecemos si utilizaremos la "base de datos" o los "moocks"
async function enviroment(moock,query){
    if(config.env.develop == 1){
        return moock;
    }else{
        return await connect.querys(`${query}`);
    }
}

module.exports = {
    enviroment
}