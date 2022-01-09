'use strict'

//Importamos componentes
const handlerClients = require('../handlersOfObjects/handlerClients.js');
const handlerRoutes = require('../handlersOfObjects/handlerRoutes.js');
const handlerDrivers = require('../handlersOfObjects/handleDrivers.js');
const handlerSaleLossProduct = require('../handlersOfObjects/handlerSaleLossProduct.js');
const handlerProducts = require('../handlersOfObjects/handlerProducts.js');
const reports = require('./reports.js');

const time = require('../utils/date.js');
const utils = require('../utils/utils.js');

 
//Cliente ---
//Manda a llamar a los clientes que no tienen una posicion en ruta
async function getClientWithoutePositionInRoute(){
    return await handlerClients.getClientWithoutePositionInRoute();
}

//Agrega un nuevo cliente a la base de datos
async function addNewClient(input){
    //Parseamos datos
    var data = await JSON.parse(JSON.stringify(input));

    //Checamos que los datos importantes no esten vacios
    if(data.nameStore == '' || data.street == '' || data.adressNumber == '' 
    || data.colony == ''){
       return 'Todos los recuadros con asterisco tienen que estar llenos';
    }

    var itsNumber = 0;
    //Verificamos que los datos sean del tiempo que tienen que ser
    if(data.latitude != '' && data.longitude != ''){
        data.latitude = utils.cleanCoordinate(data.latitude);
        data.longitude = utils.cleanCoordinate(data.longitude);
        itsNumber = utils.verifyIsCoordinate(data.latitude,itsNumber);
        itsNumber = utils.verifyIsCoordinate(data.longitude,itsNumber);
    }
    
    if(itsNumber == 1){
        return '"Latitud" y "Longitud" son coordenadas que pueden llevar decimal';
    }
    
    //Ponemos valores por defecto en caso de ser necesario
    data.latitude = utils.defaultValueNumber(data.latitude);
    data.longitude = utils.defaultValueNumber(data.longitude);
    data.nameClient = utils.defaultValueChar(data.nameClient);
    data.contactClient = utils.defaultValueChar(data.contactClient);

    return await handlerClients.addNewClient(data);
}

//Busca un cliente en especifico
async function searchAclient(input, desactive){
    var result = await handlerClients.searchAclient(input, desactive);
    if(result[0]!=undefined){
        result[0].lastModification = await time.convertDate(result[0].lastModification)
        return result;
    }else{
        return undefined;
    }
}

//Actualizar informacion del cliente
async function updateClient(input){
    var client = await handlerClients.getAnSpecificClientOfDataBase(input.idClient);

    //Para el caso de que todos los inputs estuvieran en blanco
    if(input.nameStore=='' && input.street =='' && input.adressNumber =='' &&
       input.colony =='' && input.latitude =='' && input.longitude =='' && 
       input.nameClient  == '' && input.contactClient == '')
            return 'No hubo datos para actualizar el cliente';
    
    //Verificamos que realmente el usuatio ponga algo diferente
    client.client.nameStore = utils.updateInputData(client.client.nameStore, input.nameStore);
    client.client.street = utils.updateInputData(client.client.street, input.street);
    client.client.adressNumber = utils.updateInputData(client.client.adressNumber, input.adressNumber);
    client.client.colony = utils.updateInputData(client.client.colony, input.colony);
    client.client.latitude = utils.updateInputData(client.client.latitude, input.latitude);
    client.client.longitude = utils.updateInputData(client.client.longitude, input.longitude);
    client.client.nameClient = utils.updateInputData(client.client.nameClient, input.nameClient);

    //Verificamos que los datos sean del tipo que tienen que ser
    var itsNumber = 0;
    itsNumber = utils.verifyIsCoordinate(client.client.latitude,itsNumber);
    itsNumber = utils.verifyIsCoordinate(client.client.longitude,itsNumber);

    if(itsNumber == 1){
        return 'En "Latitud" y "Longitud" puso un caracter no permitido, estos espacios son coordenadas (pueden ser numeros decimales sin importar el signo)';
    }

    return await client.updateClient(input);
}

//Desactiva a un cliente, primero quitandolo de las rutas -- PENDIENTE
async function desactivateClient(input){
    //Pedimos el cliente al que queremos desactivar
    var client = await handlerClients.getAnSpecificClientOfDataBase(input);

    //Pedimos todas las posiciones en la que esta ese cliente
    var positions = await handlerRoutes.getPositionOfAclinet(client.client.idClient);
    
    //Si es diferente a "undefined" significa que si hay posiciones
    if(positions[0]!=undefined){
        positions.forEach(element => {
            handlerRoutes.deletePosition(element);   
        });
    }
    //Desactivamos cliente
    await client.desactivateClient();
    return 'Se desactivo el cliente correctamente';
}

//Reactiva un cliente inactivo
async function reactivateClient(input){
    var client = await handlerClients.getAnSpecificClientOfDataBase(input);

    await client.reactiveClient();
    return 'Se reactivo el cliente correctamente';
}

//Conductor ---
//Agrega un nuevo cliente a la base de datos
async function addNewDirver(input){
    var data = await JSON.parse(JSON.stringify(input));

    //Significa que existen datos vacios
    if(data.nameDriver == '' || data.adress == '' || data.comission == '' || 
       data.salary == '' || data.phoneNumber == '' || data.hiringDay == '' ||
       data.hiringDayTime == ''){
       return 'Todos los campos con asteriscos tienen que estar llenos';
    }
    //Primero unimos fecha y hora
    data.hiringDay+= ' ' + data.hiringDayTime;
    
    //Verificamos que los datos sean del tipo que tienen que ser 
    var itsNumber = 0;
    itsNumber = utils.verifyIsDecimalNumber(data.comission, itsNumber);
    itsNumber = utils.verifyIsDecimalNumber(data.salary, itsNumber);

    if(itsNumber == 1){
        return `Recuerda que "comision" es un factor de 100 (Para 5% es 0.05) y 
        "salario" es un numero, no pueden llevar letras, espacios o caracteres especiales`;
    }
    
    return await handlerDrivers.addNewDriver(data);
}

//Obtiene todos los conductores (tiene como parametro en caso de que queramos traer los inactivos)
async function getDrivers(input){
    return await handlerDrivers.getAllDriver(input);
}

//Trae un conductor en especifico, lo devuelve como un objeto
async function getAnSpecificDriver(input){
        var  result  = await handlerDrivers.getAnSpecificDriver(input);
        result.driver.hiringDay = time.convertDate(result.driver.hiringDay)
        result.driver.lastModification = time.convertDate(result.driver.lastModification)

        return result
}

//Trae los conductores que aun no tienen una ruta asugnada
async function getADriverWithoutRoute(){
    return await handlerDrivers.getADriverWithoutRoute();
} 

//Actualiza un cliente en especifico
async function updateDriver(input){
    //Traemos los datos del conductor que se quiere modificar
    var driver = await handlerDrivers.getAnSpecificDriver(input.idDriver);

    //Primero unimos fecha y hora
    if(input.hiringDay!='' || input.hiringDayTime!=''){
        if(input.hiringDay==''){
            return 'No se actualizo los datos del conductor, si vas a cambiar la "hora de contratacion", tienes que poner la fecha de cuando se contrato el conductor'
        }else{
            input.hiringDay+= ' ' + input.hiringDayTime;

        }
    }
    //Checamos si todos los inputs estan vacios
    if(input.nameDriver == '' && input.hiringDay==' ' && input.adress=='' && input.phoneNumber=='' && input.email=='' &&
       input.comission=='' && input.salary=='')
        return 'Todos los espacios estuvieron vacios, por lo que no hubo informacion para actualizar el conductor';

    //Verificamos que los datos que tengan que ser de cierto tipo sean de dicho tipo
    if(input.comission!='' && input.salary!=''){
        var itsNumber = 0;
        itsNumber = utils.verifyIsDecimalNumber(input.comission,itsNumber); 
        itsNumber = utils.verifyIsDecimalNumber(input.salary,itsNumber);

        if(itsNumber==1)    
            return `No se actualizo el condutor ya que en "comision" o "salrio" puso un caracter que no es permitido, 
            recuerda que "comision" es un factor de 100 (Para 5% es 0.05) y  "salario" es un numero, no pueden llevar letras, 
            espacios o caracteres especiales`;
    }
    
    //Verificamos que realmente exista una diferencia entre el dato existente y el nuevo
    driver.driver.nameDriver = utils.updateInputData(driver.driver.nameDriver, input.nameDriver);
    driver.driver.hiringDay = utils.updateInputData(driver.driver.hiringDay, input.hiringDay);
    driver.driver.adress = utils.updateInputData(driver.driver.adress, input.adress);
    driver.driver.phoneNumber = utils.updateInputData(driver.driver.phoneNumber, input.phoneNumber);
    driver.driver.email = utils.updateInputData(driver.driver.email, input.email);
    driver.driver.comission = utils.updateInputData(driver.driver.comission, input.comission);
    driver.driver.salary = utils.updateInputData(driver.driver.salary, input.salary);

    //Actualizamos
    return await driver.updateDriver(input);
}

//Desactiva un cliente en especifico
async function desactivateDriver(input){

    //Traemos la informacion de este conductor en especifico
    var driver = await handlerDrivers.getAnSpecificDriver(input);

    //Traemos la informacion de la ruta en la que se encuentra este conductor
    var route = await handlerRoutes.getAspecifyRouteByDriver(input);

    //Se desactiva el conductor
    await driver.desactiveDriver();
    
    //Si no es undefined significa que tiene una ruta asugnada, entonces, lo tenemos que 
    //desasignar
    if(route!=undefined){
        await route.removeDriver();
        return `Se a desactivado el conductor correctamente, este conductor era el encargado de "${route.route.nameRoute}", de momento la ruta no tiene un conductor asignado`;
    }else{
        return `Se a desactivado el conductor correctamente, este conductor no era encargado de ninguna ruta`;
    }
    
}

//Reactiva un conductor desactivado
async function reactivateDriver(input){
    var driver = await handlerDrivers.getAnSpecificDriver(input);

    await driver.reactiveDriver();
    return 'Se a reactivado el conductor correctamente'
}

//Ruta ---
//Agrega una nueva ruta a la base de datos
async function addNewRoute(input){
    if(input.nameRoute == '' || input.moneyBox==''){
        return 'Todos los recuadros con asterisco tienen que estar llenos'
    }

    var itsNumber = 0;
    itsNumber = utils.verifyIsDecimalNumber(input.moneyBox, itsNumber);

    if(itsNumber==1){
        return 'Recuerda que la casilla "caja*", es un numero (puede llevar decimales)';
    }

    var result = await handlerRoutes.getAexactRouteByName(input.nameRoute);

    if(result[0]==undefined){
        await handlerRoutes.addNewRoute(input);
        return 'Se guardo correctamente la nueva ruta'
    }else{
        return 'Ya existe una ruta con ese nombre'
    }
}

//Trae todas la rutas
async function getAllRoutes(input){
    return await handlerRoutes.getAllRoutes(input);
}

//Trae una ruta por su id
async function getArouteById(input){
    var result = await handlerRoutes.getAspecifyRouteById(input);
    result.route.lastModification = time.convertDate(result.route.lastModification);
    return result;
}

//Actualiza una ruta
async function updateRoute(input){
    //Traemos los datos de la ruta que queremos modificar
    var route = await handlerRoutes.getAspecifyRouteById(input.idRoute);

    //Verificamos que la nueva informacion sea diferente a la que ya existe en base de datos
    route.route.idDriver = utils.updateInputData(route.route.idDriver, input.idDriver);
    route.route.nameRoute = utils.updateInputData(route.route.nameRoute, input.nameRoute);
    route.route.moneyBox = utils.updateInputData(route.route.moneyBox, input.moneyBox);
    
    //Si le asignamos un conductor que ya esta asignada a otra ruta, tenderemos que 
    //quitarlo de la ruta donde ya esta asignado
    var notificationRouteAfected = '';
    if(route.route.idDriver==input.idDriver){
        var routeAfected = await handlerRoutes.getAspecifyRouteByDriver(input.idDriver);
        if(routeAfected!=undefined){
            notificationRouteAfected = `, se desasigno de la ruta "${routeAfected.route.nameRoute}" el conductor "${routeAfected.route.nameDriver}"`;
            await routeAfected.removeDriver();
        }
    }
    
    var itsNumber=0;
    itsNumber = utils.verifyIsDecimalNumber(route.route.moneyBox,itsNumber);
    if(itsNumber==1){
        return 'No se actualizo la ruta debido a que estuvo mal un valor en "caja", recuerda que "caja" es un numero (que puede llevar decimales), pero no puede llevar letras, espacios, ni caracteres especiales'
    }else{
        var resultUpdate = await route.updateRoute(input);

        return resultUpdate + notificationRouteAfected;
    }
}

//Reactiva la ruta
async function rectivateRoute(input){
    var route = await getArouteById(input);
    
    await route.reactiveRoute();
    return 'Se reactivo la ruta correctamente';
}

//Desactiva una ruta
async function desactiveRoute(input){
    var route = await getArouteById(input);
    //Elimina al conductor de la ruta
    await route.removeDriver();
    
    //Desactiva la ruta
    await route.desactiveRoute();

    if(route.route.nameDriver!=null){
        return `Se desactivo la ruta correctamente, el encargado de esta ruta "${route.route.nameDriver}" ahora esta disponible para otra ruta`;
    }else{
        return `Se desactivo la ruta correctamente, la ruta no tenia ningun conductor asignado`;
    }
}

//Devuelve el sistema de dias (id-dia)
function getDays(){
    return time.daysOfWeek();
}

//Ruta posicion ---
//Devuelve las posiciones de las multiples rutas
async function getPositionMultipleRoute(input){
    var data = [];

    //Ciclamos un for para obtener las posiciones de las rutas y agregamos a un array 
    for(var i=0; i < input.idRoute.length; i++){
        data.push(await handlerRoutes.getAspecifyRouteById(input.idRoute[i]));
        await data[i].getMultipleRoutePosition(input.idDay);
    }

    return data;
}

//Agrega una nueva posicion en la ruta
async function addNewRoutePosition(input){
    await handlerRoutes.addNewRoutePosition(input);
}

//Actualiza una posicion de la ruta
async function updatePositionInRoute(input){
    await handlerRoutes.updatePosition(input);
}

//Borra una posicion de la ruta
async function deletePositionInRoute(input){
    await handlerRoutes.deletePosition(input);
}

//Venta de producto de rutas ---

//Genera el archivo para agregar una nueva venta
async function addSaleProductArchive(input){
    var nameDay = await time.getTheDayOfDate(input.dateSale);

    //Convertimos en texto el idDay
    var idDay = JSON.stringify(nameDay.id)

    input = {
        'idRoute':[ input.idRoute],
        'dateSale': input.dateSale,
        'idDay': idDay,
        'nameDay': nameDay.day
    }

    var [routesPosition] = await this.getPositionMultipleRoute(input);
    //Verificamos que existan clientes en el dia solicitad
    if(routesPosition.arrayPositionInRoute[0].position[0]==undefined)
        return 1; //En caso de que no exista clientes para ese dia

    //Verificamos que existan productos para vender en el sistema
    var productRoute = 0; 
    var notProductRoute = 1;
    //Primero para productos en la ruta
    var productsInRoute = await handlerProducts.getProductsInRouteOrNot(1);
    if(productsInRoute[0]==undefined)
        productRoute = 1;
    //Segundo para productos que no son propiamente de ruta
    var productsNotInRoute = await handlerProducts.getProductsInRouteOrNot(0);
    productsNotInRoute.forEach(element => {
        if(element.Product[0]!=undefined)
        notProductRoute = 0;
    });
    
    if(productRoute==1 && notProductRoute==1)
        return 2;

    input = {
        'idRoute': input.idRoute,
        'dateSale': input.dateSale,
        'idDay': idDay,
        'nameDay': nameDay.day,
        'routesPosition': routesPosition,
        'productsInRoute': productsInRoute,
        'productsNotInRoute': productsNotInRoute,
        'productRoute': productRoute,
        'notProductRoute': notProductRoute
    }

    return handlerSaleLossProduct.addSaleProductArchive(input); //Nota: Agrega la logica en caso de que haiga o no productos
}

//Agrega una nueva venta usando la informacion del archivo creado
async function addSaleProductArchiveUpload(dataForUploadASale){
    var productsInRoute = await handlerProducts.getProductsInRouteOrNot(1);
    var productsNotInRoute = await handlerProducts.getProductsInRouteOrNot(0);  
    var [routesPosition] = await this.getPositionMultipleRoute(dataForUploadASale);
    return await handlerSaleLossProduct.addSaleProductArchiveUpload(dataForUploadASale, routesPosition, productsInRoute,productsNotInRoute);
}

//Regresa las variables para poder determinar la limpieza de rutas
async function getEnviromentVariable(){
    return await handlerSaleLossProduct.getEnviromentVariable()
}

//Actualiza las variables para poder determinar la limpieza de rutas
async function setEnviromentVariable(input){
    return await handlerSaleLossProduct.setEnviromentVariable(input);
}

//Busca una venta ya existente para modificarla
async function updateSaleProductSearch(input){
    return await handlerSaleLossProduct.updateSaleProductSearch(input);
}

//Actualiza una venta
async function updateDate(input){
    var nameDay = await time.getTheDayOfDate(input.date);

    //Convertimos en texto el idDay
    var idDay = JSON.stringify(nameDay.id)

    input = {
        'idRoute': input.idRoute,
        'date': input.date,
        'idDay': idDay,
        'nameDay': nameDay.day
    }
    
    var [routesPosition] = await this.getPositionMultipleRoute(input); //Obtenemos todas las posiciones de la ruta

    //Verificamos que existan clientes en el dia solicitad
    if(routesPosition.arrayPositionInRoute[0].position[0]==undefined)
        return 1; //En caso de que no exista clientes para ese dia

    //Verificamos que existan productos para vender en el sistema
    var productRoute = 0; 
    var notProductRoute = 1;
    //Primero para productos en la ruta
    var productsInRoute = await handlerProducts.getProductsInRouteOrNot(1);
    if(productsInRoute[0]==undefined)
        productRoute = 1;
    //Segundo para productos que no son propiamente de ruta
    var productsNotInRoute = await handlerProducts.getProductsInRouteOrNot(0);
    productsNotInRoute.forEach(element => {
        if(element.Product[0]!=undefined)
        notProductRoute = 0;
    });
    
    if(productRoute==1 && notProductRoute==1)
        return 2;

    input = {
        'idRoute': input.idRoute,
        'date': input.date,
        'idDay': idDay,
        'nameDay': nameDay.day,
        'routesPosition': routesPosition,
        'productsInRoute': productsInRoute,
        'productsNotInRoute': productsNotInRoute,
    }

    return await handlerSaleLossProduct.updateDate(input);
}

//Elimina un dia de venta y merma
async function deleteDate(input){
    return await handlerSaleLossProduct.deleteDate(input);
}

//Crea el archivo excel con el formato para la ruta
async function printDayOfRoute(input){
    var day = time.getTheDayOfDate(input.dateSale);

    input = {
        'idRoute': [input.idRoute],
        'dateSale': input.dateSale,
        'idDay': JSON.stringify(day.id), 
        'nameDay': day.day
    }
    var [routesPosition] = await getPositionMultipleRoute(input) 
    
    //En caso de que no existan posiciones
    if(routesPosition.arrayPositionInRoute[0].position[0]==undefined)
        return 'No hay ningun cliente en ese dia, de esa ruta';
    
        //Verificamos que existan productos para vender en el sistema
        var productRoute = 0; 
        //Primero para productos en la ruta
        var productsInRoute = await handlerProducts.getProductsInRouteOrNot(1);
        if(productsInRoute[0]==undefined)
            productRoute = 1;
        
        if(productRoute==1)
            return 'No hay productos para vender en la ruta';
    
    return await handlerSaleLossProduct.printDayOfRoute(input,productsInRoute,routesPosition);
}

//Reportes ---

//Genera un mapa con las posiciones de un dia, de un ruta en especifico
async function locationRoute(input){
    var route = await getArouteById(input.idRoute);
    var day = time.getSpecifyDayOfWeek(input.idDay); 
    await route.getMultipleRoutePosition(JSON.stringify(day.id)); 

    if(route.arrayPositionInRoute[0].position[0]==undefined)
        return 'Aun no hay clientes en el dia de la ruta que solicitó';

    return await reports.locationRoute(route, day);
}

//Genera un reporte general de venta y merma de todos los dias y de todas las rutas
async function reportRouteState(date){

    var allRoute = await getAllRoutes(); //Traemos todas las rutas
    var allDay = time.daysOfWeek(); //Traemos el sistema de dias

    //Generamos el reporte
    return await reports.reportRouteState(date, allRoute, allDay);
}

//Genera un reporte de venta y mermas de clientes
async function reportClientState(input){
    return await reports.reportClientState(input, time.daysOfWeek());
}

//Genera un reporte de venta y mermas de productos
async function  reportProductState(input){
    return await reports.reportProductState(input, time.daysOfWeek());
}

//Genera un reporte de venta y merma de productos por cliente organiazdo por ruta
async function reportProductByClient(input){
    return await reports.reportProductByClient(input, time.daysOfWeek());
}

//Genera un reporte historico, ya sea de producto, cliente o ruta
async function reportHistoric(input){
    return await reports.reportHistoric(input, time.daysOfWeek());
}

//Cuidado de la correcta entrada de fechas
async function careDateSinceUntil(since, until){
    if(since=='' || until==''){
        return 'No pueden estar en blanco las fechas';
    }else if(await time.convertToOnlyDate(since) > await time.convertToOnlyDate(until)){
        return 'La primera fecha es mayor a la segunda';
    }
    return 1;
}

module.exports = {
    addNewClient,
    getClientWithoutePositionInRoute,
    searchAclient,
    updateClient,
    desactivateClient,
    reactivateClient,
    addNewDirver,
    getDrivers,
    getAnSpecificDriver,
    getADriverWithoutRoute,
    updateDriver,
    desactivateDriver,
    reactivateDriver,
    addNewRoute,
    getAllRoutes,
    getArouteById,
    updateRoute,
    rectivateRoute,
    desactiveRoute,
    getDays,
    getPositionMultipleRoute,
    addNewRoutePosition,
    updatePositionInRoute,
    deletePositionInRoute,
    addSaleProductArchive,
    addSaleProductArchiveUpload,
    getEnviromentVariable,
    setEnviromentVariable,
    updateSaleProductSearch,
    updateDate,
    deleteDate,
    printDayOfRoute,
    locationRoute,
    reportRouteState,
    reportClientState,
    reportProductState,
    reportProductByClient,
    reportHistoric,
    careDateSinceUntil
}