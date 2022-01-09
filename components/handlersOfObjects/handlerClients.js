'use strict'

//Importamos objetos
const Client = require('../Objects/Client.js');

//Importamos componentes
const env = require('../utils/enviromentDevelopOrDeploy.js');
const tableOfDataBase = require('../utils/tableOfDataBase.js');
const time = require('../utils/date');
const utils = require('../utils/utils.js');

//Esta funcion llama a todos los clientes en la DB, ordenados ascendentemente por id
async function getClientOfDateBase(){
    var result = await env.enviroment(0,`SELECT * FROM ${tableOfDataBase.tables.CLIENTS} 
                                         WHERE  clientStatus = 1 ORDER BY idClient ASC`);

    //Validacion en caso de no tener clientes
    if(result[0] != undefined){
        var arrayClient = [];
        result.forEach(element => {
            arrayClient.push( new Client(element.idClient,
                                         element.nameStore,
                                         element.street,
                                         element.adressNumber,
                                         element.colony,
                                         element.clientStatus,
                                         element.latitude,
                                         element.longitude,
                                         element.nameClient,
                                         element.contactClient,
                                         element.lastModification))
        });
    }
    return arrayClient;
}

//Obtiene un cliente especifico de la base de datos y lo devuelve como objeto
async function getAnSpecificClientOfDataBase(input){
    var [ result ] = await searchAclient(input, '1');
    
    return  new Client(result.idClient,
                    result.nameStore,
                    result.street,
                    result.adressNumber,
                    result.colony,
                    result.clientStatus,
                    result.latitude,
                    result.longitude,
                    result.nameClient,
                    result.contactClient,
                    result.lastModification);
}

//Regresa todos los clientes "activos" que no tienen una posicion en una ruta 
async function getClientWithoutePositionInRoute(){
    var result = await env.enviroment(0,`SELECT * FROM ${tableOfDataBase.tables.CLIENTS} AS C
                                   WHERE C.idClient NOT IN 
                                   (SELECT R.idClient 
                                        FROM ${tableOfDataBase.tables.ROUTES_ORGANIZATION} AS R 
                                        WHERE C.idClient= R.idClient)
                                    AND C.clientStatus = 1 ORDER BY C.nameStore`);
    
    //Validacion en caso de no tener clientes
    if(result[0] != undefined){
        var arrayClient = [];
        result.forEach(element => {
            arrayClient.push( new Client(element.idClient,
                                         element.nameStore,
                                         element.street,
                                         element.adressNumber,
                                         element.colony,
                                         element.clientStatus,
                                         element.latitude,
                                         element.longitude,
                                         element.nameClient,
                                         element.contactClient,
                                         element.lastModification))
        });
        return arrayClient;
    }else{
        return undefined;   
    }
}
//Retornaremos la posicion de un cliente especifico que se encuentra en el array
function getAnSpecificClient(array, idClient, nameStore){
    if(array!=undefined){
        for(var i=0; i < array.length; i++){
            if(array[i].client.idClient == idClient || array[i].client.nameStore == nameStore)
                return i;  
        }
    }
}


//Agrega clientes a la base de datos
async function addNewClient(input){
    //Detectamos que el cliente que se esta intentando guardar no sea uno repetido
    var [ detectedDataRepeated ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.CLIENTS}
                                                            WHERE street = '${input.street}' AND 
                                                            adressNumber = '${input.adressNumber}' AND colony = '${input.colony}'`);
    
    if(detectedDataRepeated!=undefined)
        return `La "calle", "numero de direccion" y "colonia" del cliente que se esta intentando agregar, coincide con el de otro cuyo ID es "${detectedDataRepeated.idClient}"`
        
        if(input.longitude!=0 && input.latitude!=0)
            [ detectedDataRepeated ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.CLIENTS}
            WHERE latitude = '${input.latitude}' AND longitude = '${input.longitude}'`);
            
            if(detectedDataRepeated!=undefined)
                return `Las "coordenadas" del cliente que se esta intentando agregar, coinciden con el de otro cuyo ID es "${detectedDataRepeated.idClient}"`;
        
    await env.enviroment(0,`INSERT INTO ${tableOfDataBase.tables.CLIENTS} 
    (nameStore, street, adressNumber, colony, clientStatus, 
    latitude, longitude, nameClient, contactClient, lastModification) 
    VALUES ('${input.nameStore}',
    '${input.street}','${input.adressNumber}','${input.colony}',
    '1','${input.latitude}','${input.longitude}',
    '${input.nameClient}','${input.contactClient}',
    '${await time.getThisMoment()}')`);

    return 'Los datos se guardaron exitosamente';
}

//Ordena por numero de id o por nombre
function orderArray(array,typeOrder){
    //Si 0 = id, 1 = nombre
    if(typeOrder==0){
        array.sort(function(a, b){
            if (a.client.idClient > b.client.idClient) {
                return 1;
              }
              if (a.client.idClient < b.client.idClient) {
                return -1;
              }
              // a must be equal to b
              return 0;           
        });
    }else if(typeOrder==1){
        array.sort(function(a, b){
            if (a.client.nameStore > b.client.nameStore) {
                return 1;
              }
              if (a.client.nameStore < b.client.nameStore) {
                return -1;
              }
              // a must be equal to b
              return 0;           
        });
    }
    return array
}

//Quita espacios y ,
function cleanNumber(input){
    var number = '';
    for(var i=0; i<input.length; i++){
        if(input[i]!=',' && input[i]!=' '){
            number+=input[i];
        }
    } 
    return number;
}

//Obtiene un cliente o (aproximacion de clientes) directos de la base de datos (id o nombre)
async function searchAclient(input, desactive){
    //Checamos primero si se trata de un Id o de un nombre
    var itsNumber = utils.verifyIsNumber(input,0);
    
    var parameter = '';

    /*Si es "1", significa que buscaremos entre los clientes activos e inactivos, caso 
    contrario solo activos*/
    if(desactive=='0'){
        parameter = 'IN(0,1)';
    }else{
        parameter = 'IN(1)';
    }

    //Si 0, significa que tenemos un id, caso contrario un nombre
    if(itsNumber==0){
        return await env.enviroment(0,`SELECT * FROM ${tableOfDataBase.tables.CLIENTS} 
                                       WHERE idClient = ${input} ORDER BY nameStore ASC`);
    }else{
        return await env.enviroment(0,`SELECT * FROM ${tableOfDataBase.tables.CLIENTS} 
                                       WHERE clientStatus ${parameter} AND nameStore LIKE'%${input}%'
                                       ORDER BY nameStore ASC`);
    }

}

module.exports = {
    getClientOfDateBase,
    getAnSpecificClientOfDataBase,
    getClientWithoutePositionInRoute,
    getAnSpecificClient,
    addNewClient,
    orderArray,
    cleanNumber,
    searchAclient
}