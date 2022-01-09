const mysql = require('mysql');
const config = require('../config.js');

const dbconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
}

let connection;

function handleCon(){
    connection = mysql.createConnection(dbconfig);

    connection.connect((err)=>{
        if(err){
            console.error('[db err]', err);
            setTimeout(handleCon(),2000);
        }else{
            console.log('db connected!');
        }

        connection.on('error',err => {
            console.log('[db err]', err);
            if(err.code === 'PROTOCOL_CONNECTION_LOST'){
                handleCon();
            }else{
                throw error;
            }
        })
    })
}//Fin de conexion a la db

handleCon();

module.exports = connection;