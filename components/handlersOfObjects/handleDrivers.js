'use strict'

//Importamos objetos
const Driver = require('../Objects/Driver.js');

//Importamos componentes
const env = require('../utils/enviromentDevelopOrDeploy.js')
const tableOfDataBase = require('../utils/tableOfDataBase.js');
const time = require('../utils/date');
const utils = require('../utils/utils.js');

async function getAllDriver(desactive){
    /*Si es "1", significa que buscaremos entre los conductores activos e inactivos, caso 
    contrario solo activos*/
    var paremeter = ''

    if(desactive=='0'){
        paremeter = 'IN(0,1)';
    }else{
        paremeter = 'IN(1)';
    }

    var result = await env.enviroment(0,`SELECT * FROM ${tableOfDataBase.tables.DRIVERS} 
                                         WHERE  driverStatus ${paremeter} ORDER BY nameDriver ASC`);

    //Validacion en caso de no tener clientes
    var arrayDriver = [];
    if(result[0] != undefined){
        result.forEach(element => {
            arrayDriver.push( new Driver(element.idDriver,
                                         element.nameDriver,
                                         element.hiringDay,
                                         element.adress,
                                         element.phoneNumber,
                                         element.email,
                                         element.comission,
                                         element.salary,
                                         element.driverStatus,
                                         element.lastModification))
        });
    }
    return arrayDriver;
}

async function getAnSpecificDriver(input){
    var [ result ]  = await env.enviroment(0,`SELECT * FROM ${tableOfDataBase.tables.DRIVERS} 
    WHERE  idDriver = ${input}`);
    
    return new Driver(result.idDriver,
                      result.nameDriver,
                      result.hiringDay,
                      result.adress,
                      result.phoneNumber,
                      result.email,
                      result.comission,
                      result.salary,
                      result.driverStatus,
                      result.lastModification)
}

async function getADriverWithoutRoute(){
    var result = await env.enviroment(0, `SELECT * FROM administration_program.drivers d
                                          WHERE d.idDriver NOT IN 
                                          (SELECT r.idDriver FROM administration_program.routes r 
                                          WHERE d.idDriver = r.idDriver)`);

    if(result!=undefined){
        var arrayRoute = [];
        result.forEach(element => {
            arrayRoute.push(new Driver(element.idDriver,
                                       element.nameDriver,
                                       element.hiringDay,
                                       element.adress,
                                       element.phoneNumber,
                                       element.email,
                                       element.comission,
                                       element.salary,
                                       element.driverStatus,
                                       element.lastModification));
        });
    }
    return arrayRoute;
}

async function addNewDriver(input){
    //Detectamos que el conductor que se esta intentando guardar no sea uno repetido
    var [ detectedDataRepeated ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.DRIVERS}
                                                            WHERE nameDriver = '${input.nameDriver}' OR
                                                            adress = '${input.adress}' OR phoneNumber = '${input.phoneNumber}'`);

    if(detectedDataRepeated==undefined){
        //Ponemos valores por defecto en caso de ser necesario
        input.phoneNumber = utils.defaultValueChar(input.phoneNumber);
        input.email = utils.defaultValueChar(input.email);

        await env.enviroment(0,`INSERT INTO ${tableOfDataBase.tables.DRIVERS} 
            (nameDriver, hiringDay, adress, phoneNumber, email, comission,
            salary, driverStatus, lastModification) 
            VALUES ('${input.nameDriver}',
            '${await time.convertDate(input.hiringDay)}','${input.adress}',
            '${input.phoneNumber}','${input.email}','${input.comission}',
            '${input.salary}','1','${await time.getThisMoment()}')`);
            
        return 'Se guardaron los datos correctamente';
    }else{
        return `Los datos del nuevo conductor, coinciden con los de otro conductor cuyo ID es ${detectedDataRepeated.idDriver}`;
    }
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

function verifyIsNumber(input, errDetected){

    if(errDetected!=0)
        return 2;
    
    for(var i=0; i<input.length; i++){
        var character = '';
        character = input[i].charCodeAt(0);        
        //Checamos en caso de que no sea un "." o "-"
        if(character!=45 && character!=46)
            //Se verifica que sean numeros codigo ascii(48-57)
            if(character<47 || character>58)
                return 2;
        
    } 
    return 0;
}

module.exports = {
    getAllDriver,
    getAnSpecificDriver,
    getADriverWithoutRoute,
    addNewDriver,
    cleanNumber,
    verifyIsNumber
}