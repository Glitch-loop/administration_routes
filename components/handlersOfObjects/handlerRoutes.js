'use strict'

//Importamos objetos
const Route = require('../Objects/Route.js');

//Importamos componentes
const env = require('../utils/enviromentDevelopOrDeploy.js');
const tableOfDataBase = require('../utils/tableOfDataBase.js');
const time = require('../utils/date.js');

//Trae todos los datos de las ruta de la base de datos, los devuelve como objetos de tipo ruta 
async function getAllRoutes(desactive){
        /*Si es "1", significa que buscaremos entre los conductores activos e inactivos, caso 
    contrario solo activos*/
    var paremeter = ''

    if(desactive=='0'){
        paremeter = 'IN(0,1)';
    }else{
        paremeter = 'IN(1)';
    }

    var result = await env.enviroment(0, `SELECT A.idRoute, A.idDriver, B.nameDriver, 
                                          A.nameRoute, A.moneyBox ,A.routeStatus, 
                                          A.lastModification  
                                          FROM ${tableOfDataBase.tables.ROUTES} AS A
                                          LEFT JOIN ${tableOfDataBase.tables.DRIVERS} AS B
                                          ON A.idDriver = B.idDriver
                                          WHERE routeStatus ${paremeter}`);
    
    if(result!=undefined){
        var arrayRoute = [];
        result.forEach(element => {
            arrayRoute.push(new Route(element.idRoute,
                                      element.idDriver,
                                      element.nameDriver,
                                      element.nameRoute,
                                      element.moneyBox,
                                      element.routeStatus,
                                      element.lastModification))
        });
    }
    return arrayRoute;
}

//Devolvemos una ruta por su nombre "exacto"
async function getAexactRouteByName(input){
    var result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.ROUTES} 
                                          WHERE nameRoute LIKE '${input}';`);

    return result;
}

//Devolvemos un objeto ruta de la ruta exacta buscandola por su ID  
async function getAspecifyRouteById(input){
    var [ result ] = await env.enviroment(0, `SELECT A.idRoute, A.idDriver, B.nameDriver, 
                                          A.nameRoute, A.moneyBox ,A.routeStatus, 
                                          A.lastModification  
                                          FROM ${tableOfDataBase.tables.ROUTES} AS A
                                          JOIN ${tableOfDataBase.tables.DRIVERS} AS B
                                          ON A.idDriver = B.idDriver
                                          WHERE idRoute = ${input}`);

    //Si se activa este if significa la ruta que se busca no tiene un conductor asignado
    if(result==undefined){
        var [ result ] = await env.enviroment(0, `SELECT A.idRoute, A.idDriver, B.nameDriver, 
                                          A.nameRoute, A.moneyBox ,A.routeStatus, 
                                          A.lastModification  
                                          FROM ${tableOfDataBase.tables.ROUTES} AS A
                                          LEFT JOIN ${tableOfDataBase.tables.DRIVERS} AS B
                                          ON A.idDriver = B.idDriver
                                          WHERE idRoute = ${input}`);
    }

    return new Route(result.idRoute,
                    result.idDriver,
                    result.nameDriver,
                    result.nameRoute,
                    result.moneyBox,
                    result.routeStatus,
                    result.lastModification);
}

//Regresa un objeto tipo ruta, de la ruta con el id especifico de un cliente
async function getAspecifyRouteByDriver(input){
    var [ result ] = await env.enviroment(0, `SELECT A.idRoute, A.idDriver, B.nameDriver, 
                                          A.nameRoute, A.moneyBox ,A.routeStatus, 
                                          A.lastModification  
                                          FROM ${tableOfDataBase.tables.ROUTES} AS A
                                          JOIN ${tableOfDataBase.tables.DRIVERS} AS B
                                          ON A.idDriver = B.idDriver
                                          WHERE A.idDriver = ${input}`);
                                          
    if(result==undefined){
        return result;
    }else{
        return new Route(result.idRoute,
                        result.idDriver,
                        result.nameDriver,
                        result.nameRoute,
                        result.moneyBox,
                        result.routeStatus,
                        result.lastModification);
    }
}

//Agrega una nueva ruta a la base de datos
async function addNewRoute(input){
    var result = await env.enviroment(0, `INSERT INTO ${tableOfDataBase.tables.ROUTES}
                                          (idDriver, nameRoute, moneyBox, routeStatus,
                                           lastModification) VALUES 
                                           ('${input.idDriver}','${input.nameRoute}',
                                           '${input.moneyBox}','1',
                                           '${await time.getThisMoment()}')`)
}

//Agrega una nueva posicion a una ruta
async function addNewRoutePosition(input){
    var route = new Route(input.idRoute);
    route.addNewPosition(input);    
}

//Actualiza la posicion de una ruta
async function updatePosition(input){
    var route = new Route(input.idRoute);
    await route.updatePositionRoute(input);
}

//Elimina la posicion de una ruta
async function deletePosition(input){
    var route = new Route();
    await route.deletePosition(input);
}

//Obtiene la posicion o posiciones de un cliente (se usa el ID del cliente)
async function getPositionOfAclinet(input){
    return await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.ROUTES_ORGANIZATION}
                                    WHERE idClient IN(${input})`)
}

module.exports = {
    getAllRoutes,
    getAexactRouteByName,
    getAspecifyRouteById,
    getAspecifyRouteByDriver,
    addNewRoute,
    addNewRoutePosition,
    updatePosition,
    deletePosition,
    getPositionOfAclinet
}