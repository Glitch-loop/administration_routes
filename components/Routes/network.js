'use strict'

//Importamos librerias
const express =  require('express');
const multer =  require('multer');
const mimeTypes =  require('mime-types');

//Importamos componentes
const controller = require('./index.js');

//Inicializamos
const router = express.Router();

//Varaibles globales
var queryRoutes;
var dataPosition;
var recentSearch = undefined;
var message = undefined;
var download = undefined;
var downloadDeletePosition = undefined;
var dataForUploadASale = undefined;
var dataDay = undefined;

//Middlewares
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: async function(req, file, cb){
        await cb("", "workbook" + "." + mimeTypes.extension(file.mimetype));
    }
});

const upload = multer({
    storage: storage
});


//Menu
router.get('/', routesMenu);

//Clientes
router.get('/addClientView', addClientView);
router.post('/addClient', addClient);
router.get('/modifyClientView', modifyClientView);
router.post('/searchSpecifyClient', searchSpecifyClient);
router.get('/searchSpecifyClient/update/:id', updateClientView);
router.post('/searchSpecifyClient/update', updateClient);
router.get('/searchSpecifyClient/desactivate/:id', desactivateClient);
router.get('/searchSpecifyClient/reactivate/:id', reactivateClient);

//Conductores
router.get('/addDriverView', addDriverView);
router.post('/addDriverView/addDriver', addDriver);
router.get('/modifyDriverView', modifyDriverView);
router.post('/searchDriver', searchDriver);
router.get('/modifyDriverView/update/:id', updateDriverView);
router.post('/modifyDriverView/update', updateDriver);
router.get('/modifyDriverView/reactivate/:id', reactivateDriver);
router.get('/modifyDriverView/desactivate/:id', desactivateDriver);
 
//Menu especial para las rutas y sus posiciones
router.get('/route', positionView);
 
//Rutas
router.get('/route/newRoute', addNewRouteView);
router.post('/route/newRoute/addNewRoute', addNewRoute);
router.get('/route/modifyRoute', modifyRouteView);
router.post('/route/searchRoute', searchRoute);
router.get('/route/modifyRoute/update/:id', updateRouteView);
router.post('/route/modifyRoute/update', updateRoute);
router.get('/route/modifyRoute/reactivate/:id', reactiveRoute);
router.get('/route/modifyRoute/desactivate/:id', desactiveRoute);

//Posicion de rutas
router.get('/route/addNewPosition/:id', addNewPositionView);
router.post('/route/addNewPosition', addNewPosition);
router.post('/route/viewAllPosition', viewAllPosition);
router.get('/route/viewAllPosition', viewAllPositionReset);
router.post('/route/viewAllPosition/modifyView', modifyPositionView);
router.post('/route/viewAllPosition/modify', modifyPosition);
router.post('/route/viewAllPosition/delete', deletePosition);
router.get('/route/viewAllPosition/addPosition', addPositionView);
router.post('/route/viewAllPosition/addPosition', addPositionSearchView);
router.get('/route/viewAllPosition/addPosition/form/:id', addPositionForm);

//Venta de producto de rutas
router.get('/salesProduct',saleProduct);
router.post('/salesProduct/addSaleProduct',addSaleProductArchive);
router.get('/salesProduct/addSaleProduct',addSaleProductArchiveDownload);
router.post('/salesProduct/addSaleProduct/woorbook', upload.single('workbook'), addSaleProductArchiveUpload);
router.get('/salesProduct/addSaleProduct/woorbook/deletedPosition', deletePositionArchiveDownload);
router.post('/salesProduct/enviromentVariable', setEnviromentVariable);
router.get('/salesProduct/modifySaleProduct', modifySaleProductArchive);
router.post('/salesProduct/modifySaleProduct', modifySaleProductArchiveSearch);
router.post('/salesProduct/modifySaleProduct/update', updateSaleProduct);
router.post('/salesProduct/modifySaleProduct/delete', deleteSaleProduct);
router.get('/salesProduct/printDayOfRoute', printDayOfRouteView);
router.post('/salesProduct/printDayOfRoute', printDayOfRoute);
router.get('/salesProduct/printDayOfRoute/download', printDayOfRouteArchive);

//Reportes
router.get('/reports', reportsMenu);
router.get('/reports/location', reportLocationView);
router.post('/reports/location', reportLocation);
router.get('/reports/routeState', reportRouteStateView);
router.post('/reports/routeState', reportRouteState);
router.get('/reports/clientState', reportClientStateView);
router.post('/reports/clientState', reportClientState);
router.get('/reports/productState', reportProductStateView);
router.post('/reports/productState', reportProductState);
router.get('/reports/productByClient', reportProductByClientView);
router.post('/reports/productByClient', reportProductByClient);
router.get('/reports/historicReport', reportHistoricView);
router.post('/reports/historicReport', reportHistoric);

//Menu 
function routesMenu(req, res){
    message = undefined;
    download = undefined;
    downloadDeletePosition = undefined;
    dataForUploadASale=undefined;
    res.render('routes/routesMenu');
}

//Clientes ---
//Renderiza el formulario para agregar nuevos clientes
function addClientView(req, res){

    //Reiniciamos variables
    recentSearch = undefined;

    res.render('routes/clients/addClientView',{
        message: undefined
    });
} 

//Agrega un nuevo cliente y renderiza el formulario para agregar nuevos clientes
async function addClient(req, res){
    var message = await controller.addNewClient(req.body);
   
    res.render('routes/clients/addClientView', {
        message
    });
}

//Renderiza el buscador de clientes con intencion de modificar
function modifyClientView(req, res){
    res.render('routes/clients/modifyClientView',{
        buttonBox: 0,
        recentSearch,
        data: undefined
    });
} 

/*Obtiene la peticion del cliente a buscar y 
renderiza la pagina del "modifyClientView" con el 
resultado de las busqueda del cliente
*/
async function searchSpecifyClient(req, res){
    var data = undefined;
    //Checamos que el usuario haya escrito un id o nombre
    if(req.body.search == ''){
        recentSearch = 'No escribiste un nombre o un id';
    }else{
        recentSearch = `Busqueda reciente: ${req.body.search}`;
        data = await controller.searchAclient(req.body.search, req.body.desactivedClient);
    }

    //Checamos si el usuario escogio ver clientes inactivos
    if(req.body.desactivedClient=='0'){
        var buttonBox = 1;
    }else{
        var buttonBox = 0;
    }

    if(data==undefined)
        recentSearch = `Busqueda reciente: ${req.body.search}. No se encontraron resultados con los parametros que ingreso`;

    res.render('routes/clients/modifyClientView',{
        buttonBox,
        recentSearch,
        data
    });
}

//Renderiza el resultado con un cliente el cual se modificara
async function updateClientView(req, res){
      var [ data ] = await controller.searchAclient(req.params.id,1);
      res.render('routes/clients/updateClient', {
          data
      });
} 

//Actualiza un cliente y renderiza la pagina para buscar nuevos cliente para modificar
async function updateClient(req, res){
    recentSearch = await controller.updateClient(req.body);

    modifyClientView(req, res);
}

//Reactiva un cliente y renderiza la pagina para buscar nuevos cliente para modificar
async function reactivateClient(req, res){
    recentSearch = await controller.reactivateClient(req.params.id);

    modifyClientView(req, res);
}

//Desactiva un cliente y renderiza la pagina para buscar nuevos cliente para modificar
async function desactivateClient(req, res){
    recentSearch = await controller.desactivateClient(req.params.id);

    modifyClientView(req, res);
}

//Conductores ---
//Renderiza el formulario para agregar nuevos conductores
function addDriverView(req, res){
    res.render('routes/drivers/addDriverView',{
        message: undefined
    });
}

//Agrega un nuevo conductor y renderiza el formulario para agregar nuevos conductores
async function addDriver(req, res){
    var message = await controller.addNewDirver(req.body);

    res.render('routes/drivers/addDriverView',{
        message
    });

}

//Renderiza la vista con todos los conductores con intencion de modificar
async function modifyDriverView(req, res){
    var data = await controller.getDrivers();

    if(data[0]==undefined){
        message = 'Aun no se han registrado conductores';
    }else{
        message = undefined;
    }
    res.render('routes/drivers/modifyDriverView',{
        buttonBox: 0,
        data: data,
        message 
    });   
}

/*
Renderiza la vista con los conductores activos (y si lo desea el 
usuario tambien los inactivos) para poderlos modificar.
*/
async function searchDriver(req, res){
    //Checamos si el usuario escogio ver clientes inactivos
    if(req.body.desactivedDriver=='0'){
        message = undefined;
        var buttonBox = 1;
    }else{
        var buttonBox = 0;
    }

    var data = await controller.getDrivers(req.body.desactivedDriver);

    if(data[0]==undefined){
        message = 'No se encontraron resultados'
    }

    res.render('routes/drivers/modifyDriverView',{
        buttonBox,
        data,
        message 
    });   
}


//Renderiza el formulario para modificar un conductor
async function updateDriverView(req, res){
    var  data  = await controller.getAnSpecificDriver(req.params.id);
    data = data.driver
    res.render('routes/drivers/updateDriver',{
        data
    })
}

//Actualiza el conductor y renderiza el menu de busqueda para los conductores para modificar
async function updateDriver(req, res){
    message = await controller.updateDriver(req.body);

    searchDriver(req, res);    
}

//Reactiva el conductor y renderiza el menu de busqueda para los conductores para modificar
async function reactivateDriver(req, res){
    message = await controller.reactivateDriver(req.params.id);

    searchDriver(req, res);
}

//Desactiva el conductor y renderiza el menu de busqueda para los conductores para modificar
async function desactivateDriver(req, res){
    message = await controller.desactivateDriver(req.params.id);

    searchDriver(req, res);
}

//Rutas ---
//Renderiza el menu para modificar las rutas y las posiciones
async function positionView(req, res){
    message = undefined; //Reiniciamos variable global

    var clients = await controller.getClientWithoutePositionInRoute();
    var days = controller.getDays();
    var routes = await controller.getAllRoutes();
    res.render('routes/routes/positionView',{
        clients,
        routes,
        days,
        queryRoutes: undefined,
        data: undefined
    });
}

//Renderiza el formulario para agregar nuevas rutas
async function addNewRouteView(req, res){
    var drivers = await controller.getADriverWithoutRoute();

    if(drivers[0]==undefined){
        message = `No hay conductores disponibles para poder asignarle a una ruta, 
                    agrega nuevos para poder crear la nueva ruta`
    }

    res.render('routes/routes/addRouteView',{
        drivers,
        message
    });
}

//Agrega una nueva ruta y renderiza el menu de posiciones y rutas
async function addNewRoute(req, res){
    message = await controller.addNewRoute(req.body);
    
    addNewRouteView(req, res);
}

//Renderiza la vista para seleccionar la ruta que queramos modificar
async function modifyRouteView(req, res){
    var data = await controller.getAllRoutes();

    if(data[0]==undefined){
        message = 'No hay rutas registradas';
    }else{
        message = undefined;
    }
    res.render('routes/routes/modifyRouteView',{
                buttonBox: 0,
                message,
                data
    });
}

/*
Renderiza la vista para seleccionar la ruta 
(tanto activos como inactivos) que queramos modificar
*/
async function searchRoute(req, res){
        message = undefined;
        //Checamos si el usuario escogio ver clientes inactivos
        if(req.body.desactivedRoute=='0'){
            var buttonBox = 1;
        }else{
            var buttonBox = 0;
        }

        var data = await controller.getAllRoutes(req.body.desactivedRoute);

        if(data[0]==undefined){
            message = 'No se encontraron resultados';
        }else{
            message = undefined;
        }
        res.render('routes/routes/modifyRouteView',{
            buttonBox,
            message,
            data
        });   
}

//Renderiza el formulario para modificar una ruta
async function updateRouteView(req, res){
    var { route } = await controller.getArouteById(req.params.id);
    var drivers = await controller.getDrivers();

    res.render('routes/routes/updateRoute',{
        route,
        drivers
    });
}

//Actualiza la ruta y renderiza el buscador de las rutas con intencion a modificar
async function updateRoute(req, res){
    message = await controller.updateRoute(req.body);

    modifyRouteView(req, res);
}

//Reactiva la ruta y renderiza el buscador de las rutas con intencion a modificar
async function reactiveRoute(req, res){
    message = await controller.rectivateRoute(req.params.id);

    modifyRouteView(req, res);

}

//Desactiva la ruta y renderiza el buscador de las rutas con intencion a modificar
async function desactiveRoute(req, res){
    message = await controller.desactiveRoute(req.params.id);

    modifyRouteView(req, res);
}

//Posicion en rutas ---
//Renderiza la vista para agregar una nueva posicion
async function addNewPositionView(req, res){
    var [ clients ] = await controller.searchAclient(req.params.id);
    var days = controller.getDays();
    var routes = await controller.getAllRoutes();

    if(routes[0]==undefined){
        message = `Aun no hay rutas registradas por lo que no se puede seleccionar una posicion para el cliente, 
                    regresa al menu dando clic en la flecha de volver (ubicada en la parte superior a la izquierda)`;
    }else{
        message = undefined;
    }

    res.render('routes/routes/routesPosition/addNewPositionView',{
        clients,
        routes,
        days,
        message
    });
}

//Agrega una nueva posicion y renderiza el menu de rutas y posiciones
async function addNewPosition(req, res){
    await controller.addNewRoutePosition(req.body);

    positionView(req, res);    
}

//Renderiza las posiciones (con filtros)
async function viewAllPosition(req, res, band){
    var clients = await controller.getClientWithoutePositionInRoute();
    var days = controller.getDays();
    var routes = await controller.getAllRoutes();
    
    if(band==1){
        dataPosition = await controller.getPositionMultipleRoute(queryRoutes);    
    }else{
        if(req.body.idRoute==undefined || req.body.idDay==undefined){
            queryRoutes = undefined;
            dataPosition = undefined;        
        }else{
            try{
                req.body.idRoute.pop();
            }catch(error){
                viewAllPositionReset(req, res);
            }
            queryRoutes = req.body;
            dataPosition = await controller.getPositionMultipleRoute(queryRoutes);    
        }
    }

    res.render('routes/routes/positionView',{
        clients,
        routes,
        days,
        queryRoutes: queryRoutes,
        data: dataPosition
    });
}

//Renderiza el menu de posicones y rutas (resetenado los filtros de las posiciones)
function viewAllPositionReset(req, res){
    queryRoutes = undefined;
    dataPosition = undefined;
    positionView(req, res);
}

//Renderiza el formulario para modificar la posicion 
async function modifyPositionView(req, res){
    var routes = await controller.getAllRoutes();
    var days = controller.getDays();

    res.render('routes/routes/routesPosition/modifyPositionView',{
        routes: routes,
        days: days,
        clients: req.body
    })
}

//Modifica una posicion y renderiza el menu ruta y posiciones (conservando los filtros)
async function modifyPosition(req, res){
    await controller.updatePositionInRoute(req.body);
    var band = 1;
    await viewAllPosition(req, res, band);
}

//Elimina una posicion y renderiza el menu ruta y posiciones (conservando los filtros)
async function deletePosition(req, res){
    await controller.deletePositionInRoute(req.body);
    var band = 1;
    await viewAllPosition(req, res, band);
}

/*
Renderiza un buscador de clientes para poder escoger el 
cliente que queramos agregarle una nueva posicion
*/
async function addPositionView(req, res){
    res.render('routes/routes/routesPosition/addPositionView',{
        message: undefined,
        data: 0
    })
}

/*
Renderiza el buscador de clientes para agregarle una nueva posicion, pero con
el resultado de la busqueda
*/
async function addPositionSearchView(req, res){
    //Checamos que el usuario haya escrito un id o nombre
    if(req.body.search == ''){
        var data = 0;
        message = 'No escribiste un nombre o un id';
    }else{
        var data = await controller.searchAclient(req.body.search, req.body.desactivedClient);

        if(data==undefined){
            data=0;
            message = `No se encontro una coincidencia a la busqueda "${req.body.search}"`;            
        }else{
            message = `Busqueda reciente: ${req.body.search}`;

        }
    }

    res.render('routes/routes/routesPosition/addPositionView',{
        message,
        data
    });
}

//Renderiza el formularaio para agregar nuevas posiciones en rutas a los clientes
async function addPositionForm(req, res){
    var [ clients ] = await controller.searchAclient(req.params.id);
    var days = controller.getDays();
    var routes = await controller.getAllRoutes();

    res.render('routes/routes/routesPosition/addNewPositionView',{
        clients,
        routes,
        days,
    });
}

//Venta de producto de rutas ---

//Sera el menu principal para las ventas y tendra el menu para agregar una nueva venta
async function saleProduct(req, res){
    var routes = await controller.getAllRoutes();
    var [ enviromentVariable ] = await controller.getEnviromentVariable();
    dataDay=undefined;
    if(routes[0]==undefined){
        message = 'Aun no hay rutas registradas para poder agregar ventas';
    }
    res.render('routes/sales/salesMenu',{
        routes,
        message,
        download,
        downloadDeletePosition,
        enviromentVariable,
        messageFilter: undefined
    });
}

//Prepara el archivo para agregar la nueva venta
async function addSaleProductArchive(req, res){
    message = undefined;
    downloadDeletePosition = undefined;
    if(req.body.dateSale==''){
        message = 'Tienes que seleccionar un dia de venta';
    }else{
        var result = await controller.addSaleProductArchive(req.body);
        if(result==1){
            message = `El dia que seleccionaste ${req.body.dateSale}, no tiene clientes, por lo que no se puede generar un archivo para agregar la venta`;
            download = undefined;
        }else if(result==2){
            message = `No existen productos en el sistema, por lo que no se puede generar un archivo para agregar la venta`;
            download = undefined;
        }else if(result==3){
            message = `Ya existe una venta para esa ruta en el dia "${req.body.dateSale}", modificala o eliminala para crear una nueva venta para este dia`
            download = undefined;
        }else{
            dataForUploadASale = result;
            download=1;
        }
    }
    saleProduct(req,res);
}

//Boton de descarga del archivo para agregar una venta
async function addSaleProductArchiveDownload(req, res){
    res.download('./downloads/AgregarVenta.xlsx',
    function(err){
        if(err){
            console.log(err)
        }
    });
}

//Ruta para subir el archivo con la venta
async function addSaleProductArchiveUpload(req, res){
    var result  = await controller.addSaleProductArchiveUpload(dataForUploadASale);

    if(result==1){
        message = 'No modifiques nada de la primera columna: "columna A". Descarga de nuevo el archivo y vacia toda la informacion nuevamente';
    }else if(result==2){
        message = 'En la "cantidad de venta" de un producto, pusiste algo que no es un "numero", no pongas letras, caracteres raros, ni espacios. Descarga de nuevo el archivo y vacia toda la informacion nuevamente';
    }else if(result==3){
        message = 'No modifiques ningun "ID", ni nada de la primera columna "columna A". Descarga de nuevo el archivo y vacia toda la informacion nuevamente';
    }else if(result==4){
        dataForUploadASale = undefined;
        download=undefined;
        downloadDeletePosition=undefined;
        message = 'La informacion se a guardado correctamente';
    }else if(result==5){
        dataForUploadASale = undefined;
        download = undefined;
        downloadDeletePosition = 1;
        message = 'La informacion se a guardado correctamente';
    }else if(result==6){
        message = `Los clientes no coinciden con los del dia de la ruta, tal vez estas intentando agregar la venta de otro dia o tienes un 
        archivo con los cliente desactualizados, "escoge el dia y crea el archivo nuevamente para registrar la venta"`;
        download = undefined;
    }
    saleProduct(req, res);
}

//Boton de descarga del archivo con las posiciones eliminadas
async function deletePositionArchiveDownload(req, res){
    res.download('./downloads/PosicionesEliminadas.xlsx',
    function(err){
        if(err){
            console.log(err)
        }
    });
}

//Modifica las variables de entorno para limpiar las rutas
async function setEnviromentVariable(req, res){
    var messageFilter = await controller.setEnviromentVariable(req.body)
    var routes = await controller.getAllRoutes();
    var [ enviromentVariable ] = await controller.getEnviromentVariable();
    dataDay=undefined;
    res.render('routes/sales/salesMenu',{
        routes,
        message,
        download,
        downloadDeletePosition,
        enviromentVariable,
        messageFilter

    });
}

//Renderiza el menu para modificar una venta
async function modifySaleProductArchive(req, res){
    var routes = await controller.getAllRoutes();
    dataDay = undefined;
    if(routes[0]==undefined){
        message='Aun no existen rutas para poder mostrar este menu'; 
    }
    res.render('routes/sales/modifySaleProduct', {
        routes,
        message,
        dataDay
    });
}

//Buscador de venta
async function modifySaleProductArchiveSearch(req, res){
    if(req.body.fisrtDateSale=='' || req.body.secondDateSale==''){
        message = 'Tienes que definir un intervalo de tiempo poniendo ambas fechas';
        dataDay = undefined;
    }else{
        var result = await controller.updateSaleProductSearch(req.body);
        if(result==1){
            message = `La primera fecha no puede ser mayor que la segunda`;
            dataDay = undefined;
        }else if(result==2){
            message = `No existen ventas o mermas para ese intervalo de tiempo`;
            dataDay = undefined;
        }else{
            dataDay = result;
            message = undefined;
        }
    }

    var routes = await controller.getAllRoutes();

    res.render('routes/sales/modifySaleProduct', {
        routes,
        message,
        dataDay
    });
}

//Ruta para actualizar una venta
async function updateSaleProduct(req, res){
    var data = await controller.updateDate(req.body);

    res.render('routes/sales/viewSaleProduct',{
        data
    });
}

//Ruta para eliminar un dia de venta y merma
async function deleteSaleProduct(req, res){
    message = await controller.deleteDate(req.body);
   
    modifySaleProductArchive(req, res);
}

//Renderiza el menu para elegir descargar una ruta
async function printDayOfRouteView(req, res){
    var routes = await controller.getAllRoutes();
    if(routes[0]==undefined){
        message='Aun no existen rutas para poder mostrar este menu'; 
    }

    res.render('routes/sales/dayRoutesPrint', {
        routes,
        message,
        downloadPrintDay: undefined
    });
}

//Ruta para crea el archivo con el formato de la ruta  
async function printDayOfRoute(req, res){
    var result = await controller.printDayOfRoute(req.body);
    
    //Si es "1" significa que el archivo se creo correctamente
    if(result==1){
        var downloadPrintDay = result;
        message = undefined;
    }else{
        var downloadPrintDay = undefined;
        message=result
    }
    var days = controller.getDays();
    var routes = await controller.getAllRoutes();
    res.render('routes/sales/dayRoutesPrint', {
        days,
        routes,
        downloadPrintDay,
        message
    });
}

//Descarga el archivo creado con el formato de las rutas
async function printDayOfRouteArchive(req, res){
    res.download('./downloads/FormatoRuta.xlsx',
    function(err){
        if(err){
            console.log(err)
        }
    });
}

//Reportes ---

//Renderiza el menu principal de reportes
async function reportsMenu(req, res){
    res.render('routes/reports/reportsMenu');
}

//Renderiza la pagina con las opciones para poder escoger un dia de una ruta
async function reportLocationView(req, res){
    var routes = await controller.getAllRoutes();
    var days = await controller.getDays();

    var messageorDownload = undefined;

    if(routes[0]==undefined)
        var messageorDownload = 'Aun no hay rutas registradas';
    

    res.render('routes/reports/locationRoute', {
        routes,
        days,
        messageorDownload
    });
} 

//En caso de que existan clientes en la ruta descarga un archivo excel 
async function reportLocation(req, res){
    var routes = await controller.getAllRoutes();
    var days = await controller.getDays();

    var result = await controller.locationRoute(req.body);

    if(result==1){
        res.download('./downloads/LocalizacionDeRuta.xlsx',
        function(err){
            if(err){
                console.log(err)
            }
        });
    }else{
        res.render('routes/reports/locationRoute', {
            routes,
            days,
            messageorDownload: result
        });
    }
}

//Renderiza la pagina con las opciones para poder escoger un intervalo de tiempo
async function reportRouteStateView(req, res){
    var routes = await controller.getAllRoutes();
    var days = await controller.getDays();

    res.render('routes/reports/routeState', {
        routes,
        days,
        messageorDownload: undefined
    });
} 

//Descarga el archivo con la informacion
async function reportRouteState(req, res){
    var routes = await controller.getAllRoutes();
    var days = await controller.getDays();
    var result = 1;
    result = await controller.careDateSinceUntil(req.body.sinceDate, req.body.untilDate);
    
    if(result==1){
        await controller.reportRouteState(req.body);
        res.download('./downloads/EstadoGeneralDeRuta.xlsx',
        function(err){
            if(err){
                console.log(err)
            }
        });
    }else{
        res.render('routes/reports/routeState', {
            routes,
            days,
            messageorDownload: result
        });       
    }
}

//Renderiza la pagina con las opciones para poder escoger un intervalo de tiempo y el limite de clientes
async function reportClientStateView(req, res){
    res.render('routes/reports/clientState',{
        messageorDownload: undefined
    });
}

//Descarga el archivo con la informacion
async function reportClientState(req, res){
    var result = 1;
    result = await controller.careDateSinceUntil(req.body.sinceDate, req.body.untilDate);

    if(result==1){
        await controller.reportClientState(req.body);
        res.download('./downloads/ReporteVentaMermaClientes.xlsx',
        function(err){
            if(err){
                console.log(err)
            }
        });
    }else{
        res.render('routes/reports/clientState',{
            messageorDownload: result
        });
    }
}

//Renderiza la pagina con las opciones para poder escoger un intervalo de tiempo y el limite de clientes
async function reportProductStateView(req, res){
    res.render('routes/reports/productState',{
        messageorDownload: undefined        
    });
}

//Descarga el archivo con la informacion
async function reportProductState(req, res){
    var result = 1;
    result = await controller.careDateSinceUntil(req.body.sinceDate, req.body.untilDate);

    if(result==1){
        await controller.reportProductState(req.body);
        res.download('./downloads/ReporteVentaMermaProductos.xlsx',
        function(err){
            if(err){
                console.log(err)
            }
        });
    }else{
        res.render('routes/reports/productState',{
            messageorDownload: result
        });
    }
}

//Renderiza la pagina con las opciones para poder escoger un intervalo de tiempo
async function reportProductByClientView(req, res){
    res.render('routes/reports/productByClient', {
        messageorDownload: undefined
    });
}

//Descarga el archivo con la informacion
async function reportProductByClient(req, res){
    var result = 1;
    result = await controller.careDateSinceUntil(req.body.sinceDate, req.body.untilDate);

    if(result==1){
        await controller.reportProductByClient(req.body);
        res.download('./downloads/ReporteVentaMermaProductosPorCliente.xlsx',
        function(err){
            if(err){
                console.log(err)
            }
        });
    }else{
        res.render('routes/reports/productByClient',{
            messageorDownload: result
        });
    }
}

//Renderiza la pagina con las opciones para poder escoger un reporte historico
async function reportHistoricView(req, res){
    res.render('routes/reports/historicReports',{
        messageorDownload: undefined
    });
}

//Descarga el archivo con la informacion
async function reportHistoric(req, res){
    var result = 1;
    result = await controller.careDateSinceUntil(req.body.sinceDate, req.body.untilDate);

    if(result==1){
        await controller.reportHistoric(req.body);
        res.download('./downloads/ReporteHistorico.xlsx',
        function(err){
            if(err){
                console.log(err)
            }
        });
    }else{
        res.render('routes/reports/historicReports',{
            messageorDownload: result
        });
    }
}

module.exports = router;