'use strict'

//Importmamos librerias
const XLSX = require("xlsx");
const env = require('../utils/enviromentDevelopOrDeploy.js');
const time = require('../utils/date.js');
const tableOfDataBase = require("../utils/tableOfDataBase.js");

async function locationRoute(route, day){
    //Comenzamos a crear el archivo excel con la informacion -------------------------------------------------------
    var workbook = await XLSX.utils.book_new();//Creamos un nuevo libro

    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Coordenada', 'Posicion', 'Ruta', 'Dia', 'Nombre de Cliente', 'Direccion']);
    
    for(var i=0; i < route.arrayPositionInRoute[0].position.length; i++){
        var coordinate = `${route.arrayPositionInRoute[0].position[i].latitude}, ${route.arrayPositionInRoute[0].position[i].longitude}`;
        var adress = `${route.arrayPositionInRoute[0].position[i].street} ${route.arrayPositionInRoute[0].position[i].adressNumber}, ${route.arrayPositionInRoute[0].position[i].colony}`; 
        ws_data.push([coordinate, `Posicion: ${route.arrayPositionInRoute[0].position[i].positionRouteDay}`, 
                      route.route.nameRoute, day.day, route.arrayPositionInRoute[0].position[i].nameStore, adress]);
    }

    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Ruta"); //Agregamos las "hojas" a nuestro archivo excel 

    //Creamos el libro con las hojas ---
    await XLSX.writeFile(workbook, './downloads/LocalizacionDeRuta.xlsx'); //Escribimos el libro en excel
    return 1;
}

async function reportRouteState(date, allRoute, allDay){
        //Comenzamos a crear el archivo excel con la informacion -------------------------------------------------------
        var workbook = await XLSX.utils.book_new();//Creamos un nuevo libro
        
        //Variables auxiliares
        var ws_data = [];
        
//Para las ventas ------------------------------------------------------------------------------------
        ws_data.push(['Reporte general de venta (monetario)']);
        ws_data.push(['']);
        ws_data.push([`Desde: ${date.sinceDate}`]);
        ws_data.push([`Hasta: ${date.untilDate}`]);
        ws_data.push(['']);
        ws_data.push(['Dia','Venta']);

        //Ciclo for para las rutas
        for(var i=0; i < allRoute.length; i++){
            ws_data.push(['']);

            //Ciclo for para los dias de la ruta
            for(var j=0; j < allDay.length; j++){
                var [ result ] = await env.enviroment(0,`SELECT idRoute, idDay, ROUND(SUM(quantityProduct * priceProduct),2) AS sale 
                                                    FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} 
                                                    WHERE idRoute IN(${allRoute[i].route.idRoute}) 
                                                    AND idDay IN(${allDay[j].id}) 
                                                    AND dateSale >= '${date.sinceDate}' 
                                                    AND dateSale <= '${date.untilDate}';`);
                if(result.sale==null){
                    ws_data.push([`${allRoute[i].route.nameRoute} - ${allDay[j].day}`,`0`]);
                }else{
                    ws_data.push([`${allRoute[i].route.nameRoute} - ${allDay[j].day}`,`${result.sale}`]);
                }
            }
        }

        var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
        await XLSX.utils.book_append_sheet(workbook, ws, "Ventas"); //Agregamos las "hojas" a nuestro archivo excel 

//Para las mermas ------------------------------------------------------------------------------------------
        //Creamos de nuevo la variable auxiliar
        var ws_data = [];
        
        ws_data.push(['Reporte general de mermas (monetario)']);
        ws_data.push(['']);
        ws_data.push([`Desde: ${date.sinceDate}`]);
        ws_data.push([`Hasta: ${date.untilDate}`]);
        ws_data.push(['']);
        ws_data.push(['Dia','Mermas']);

        //Ciclo for para las rutas
        for(var i=0; i < allRoute.length; i++){
            ws_data.push(['']);

            //Ciclo for para los dias de la ruta
            for(var j=0; j < allDay.length; j++){
                var [ result ] = await env.enviroment(0,`SELECT idRoute, idDay, ROUND(SUM(quantityProduct * priceProduct),2) AS loss 
                                                    FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT} 
                                                    WHERE idRoute IN(${allRoute[i].route.idRoute}) 
                                                    AND idDay IN(${allDay[j].id}) 
                                                    AND dateLoss >= '${date.sinceDate}' 
                                                    AND dateLoss <= '${date.untilDate}';`);
                if(result.loss==null){
                    ws_data.push([`${allRoute[i].route.nameRoute} - ${allDay[j].day}`,`0`]);
                }else{
                    ws_data.push([`${allRoute[i].route.nameRoute} - ${allDay[j].day}`,`${result.loss}`]);
                }
            }
        }

        var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
        await XLSX.utils.book_append_sheet(workbook, ws, "Mermas"); //Agregamos las "hojas" a nuestro archivo excel 

//Guardamos la informacion en un libro -------------------------------------------------------------------------------
        //Creamos el libro con las hojas ---
        await XLSX.writeFile(workbook, './downloads/EstadoGeneralDeRuta.xlsx'); //Escribimos el libro en excel
        return 1;
}

async function reportClientState(input, days){

    //Verificamos que el usuario no haya puesto un limite a la busqueda
    var limit = '';
    if(input.limitSale > 0){
        limit = `LIMIT ${input.limitSale}`
    }

    //Solicitamos la informacion a la base de datos
    
    //Para las ventas mayores
    var topSales = await env.enviroment(0,`SELECT B.idClient, B.nameStore, B.street, B.adressNumber, B.colony, C.nameRoute, 
                                            A.idDay, ROUND(SUM(A.quantityProduct * A.priceProduct),2) AS sale 
                                            FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} AS A
                                            JOIN ${tableOfDataBase.tables.CLIENTS} AS B
                                            ON A.idClient = B.idClient
                                            JOIN ${tableOfDataBase.tables.ROUTES} AS C
                                            ON A.idRoute = C.idRoute
                                            WHERE A.dateSale >= '${input.sinceDate}' AND A.dateSale <= '${input.untilDate}'
                                            GROUP BY A.idClient ORDER BY sale DESC ${limit}`);

    //Para las ventas menores
    var lessSales = await env.enviroment(0,`SELECT B.idClient, B.nameStore, B.street, B.adressNumber, B.colony, C.nameRoute, 
                                            A.idDay, ROUND(SUM(A.quantityProduct * A.priceProduct),2) AS sale 
                                            FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} AS A
                                            JOIN ${tableOfDataBase.tables.CLIENTS} AS B
                                            ON A.idClient = B.idClient
                                            JOIN ${tableOfDataBase.tables.ROUTES} AS C
                                            ON A.idRoute = C.idRoute
                                            WHERE A.dateSale >= '${input.sinceDate}' AND A.dateSale <= '${input.untilDate}'
                                            GROUP BY A.idClient ORDER BY sale ASC ${limit}`);

    //Verificamos que el usuario no haya puesto un limite a la busqueda
    var limit = '';
    if(input.limitLoss > 0){
        limit = `LIMIT ${input.limitLoss}`
    }
    //Solicitamos la informacion a la base de datos
    
    //Para las ventas mayores
    var topLoss = await env.enviroment(0,`SELECT B.idClient, B.nameStore, B.street, B.adressNumber, B.colony, C.nameRoute, 
                                            A.idDay, ROUND(SUM(A.quantityProduct * A.priceProduct),2) AS loss 
                                            FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT} AS A
                                            JOIN ${tableOfDataBase.tables.CLIENTS} AS B
                                            ON A.idClient = B.idClient
                                            JOIN ${tableOfDataBase.tables.ROUTES} AS C
                                            ON A.idRoute = C.idRoute
                                            WHERE A.dateLoss >= '${input.sinceDate}' AND A.dateLoss <= '${input.untilDate}'
                                            GROUP BY A.idClient ORDER BY loss DESC ${limit}`);

    //Para las ventas menores
    var LessLoss = await env.enviroment(0,`SELECT B.idClient, B.nameStore, B.street, B.adressNumber, B.colony, C.nameRoute, 
                                            A.idDay, ROUND(SUM(A.quantityProduct * A.priceProduct),2) AS loss 
                                            FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT} AS A
                                            JOIN ${tableOfDataBase.tables.CLIENTS} AS B
                                            ON A.idClient = B.idClient
                                            JOIN ${tableOfDataBase.tables.ROUTES} AS C
                                            ON A.idRoute = C.idRoute
                                            WHERE A.dateLoss >= '${input.sinceDate}' AND A.dateLoss <= '${input.untilDate}'
                                            GROUP BY A.idClient ORDER BY loss ASC ${limit}`);

//Comenzamos a crear el archivo excel con la informacion ---------------------------------------------------------------------------
        var workbook = await XLSX.utils.book_new();//Creamos un nuevo libro

       
//Comenzamos con las ventas mayores ---------------------------------
    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: clientes con mayor venta']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID cliente', 'Nombre', 'Direccion', 'Ruta', 'Dia', 'Venta']);

    for(var i=0; i < topSales.length; i++){
        for(var j=0; j < days.length; j++){
            if(topSales[i].idDay==days[j].id){
                ws_data.push([topSales[i].idClient, topSales[i].nameStore, 
                    `${topSales[i].street} ${topSales[i].adressNumber}, ${topSales[i].colony}`,
                    topSales[i].nameRoute, days[j].day, topSales[i].sale]);
                break;
            }
        }
    }

    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Ventas mayores"); //Agregamos las "hojas" a nuestro archivo excel  

//Comenzamos con las ventas menores ---------------------------------
    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: clientes con menor venta']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID cliente', 'Nombre', 'Direccion', 'Ruta', 'Dia', 'Venta']);

    for(var i=0; i < lessSales.length; i++){
        for(var j=0; j < days.length; j++){
            if(lessSales[i].idDay==days[j].id){
                ws_data.push([lessSales[i].idClient, lessSales[i].nameStore, 
                    `${lessSales[i].street} ${lessSales[i].adressNumber}, ${lessSales[i].colony}`,
                    lessSales[i].nameRoute, days[j].day, lessSales[i].sale]);
                break;
            }
        }
    }

        var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
        await XLSX.utils.book_append_sheet(workbook, ws, "Ventas menores"); //Agregamos las "hojas" a nuestro archivo excel  

//Comenzamos con las mermas mayores ---------------------------------
    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: clientes con mayor merma']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID cliente', 'Nombre', 'Direccion', 'Ruta', 'Dia', 'Merma']);

    for(var i=0; i < topLoss.length; i++){
        for(var j=0; j < days.length; j++){
            if(topLoss[i].idDay==days[j].id){
                ws_data.push([topLoss[i].idClient, topLoss[i].nameStore, 
                    `${topLoss[i].street} ${topLoss[i].adressNumber}, ${topLoss[i].colony}`,
                    topLoss[i].nameRoute, days[j].day, topLoss[i].loss]);
                break;
            }
        }
    }

    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Mermas mayores"); //Agregamos las "hojas" a nuestro archivo excel  

//Comenzamos con las mermas mayores ---------------------------------
    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: clientes con menor merma']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID cliente', 'Nombre', 'Direccion', 'Ruta', 'Dia', 'Merma']);

    for(var i=0; i < LessLoss.length; i++){
        for(var j=0; j < days.length; j++){
            if(LessLoss[i].idDay==days[j].id){
                ws_data.push([LessLoss[i].idClient, LessLoss[i].nameStore, 
                    `${LessLoss[i].street} ${LessLoss[i].adressNumber}, ${LessLoss[i].colony}`,
                    LessLoss[i].nameRoute, days[j].day, LessLoss[i].loss]);
                break;
            }
        }
    }

    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Mermas menores"); //Agregamos las "hojas" a nuestro archivo excel  

//Guardamos la informacion en un libro -------------------------------------------------------------------------------
        //Creamos el libro con las hojas ---
        await XLSX.writeFile(workbook, './downloads/ReporteVentaMermaClientes.xlsx'); //Escribimos el libro en excel
        return 1;
}

async function reportProductState(input, days){
    //Primero solicitamos la informacion a la base de datos
//Primero los productos por ruta 
    //Pedimos venta de productos acomodado por ruta
    var productRouteSale = await env.enviroment(0, `SELECT A.idRoute, C.nameRoute, A.idDay, A.idProduct, B.nameProduct, 
                                                B.abbreviationProduct, B.idProductsFamily, B.productInRoute, B.positionInRoute, 
                                                SUM(quantityProduct) AS saleProduct 
                                                FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} AS A
                                                JOIN ${tableOfDataBase.tables.PRODUCTS} AS B
                                                ON A.idProduct = B.idProduct
                                                JOIN ${tableOfDataBase.tables.ROUTES} AS C
                                                ON A.idRoute = C.idRoute
                                                WHERE A.dateSale >= '${input.sinceDate}' AND A.dateSale <= '${input.untilDate}'
                                                GROUP BY A.idRoute, A.idDay, A.idProduct 
                                                ORDER BY A.idRoute ASC, A.idDay ASC, saleProduct DESC;`);

    //Pedimos merma de productos acomodado por ruta
    var productRouteLoss = await env.enviroment(0, `SELECT A.idRoute, C.nameRoute, A.idDay, A.idProduct, B.nameProduct, 
                                                B.abbreviationProduct, B.idProductsFamily, B.productInRoute, B.positionInRoute, 
                                                SUM(quantityProduct) AS lossProduct 
                                                FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT} AS A
                                                JOIN ${tableOfDataBase.tables.PRODUCTS} AS B
                                                ON A.idProduct = B.idProduct
                                                JOIN ${tableOfDataBase.tables.ROUTES} AS C
                                                ON A.idRoute = C.idRoute
                                                WHERE A.dateLoss >= '${input.sinceDate}' AND A.dateLoss <= '${input.untilDate}'
                                                GROUP BY A.idRoute, A.idDay, A.idProduct 
                                                ORDER BY A.idRoute ASC, A.idDay ASC, lossProduct DESC;`);

    //Verificamos que el usuario no haya puesto un limite a la busqueda
    var limit = '';
    if(input.limitSale > 0){
        limit = `LIMIT ${input.limitSale}`
    }

    //Pedimos productos con mayor venta
    var topSales = await env.enviroment(0, `SELECT B.idProduct, B.nameProduct, B.abbreviationProduct, B.idProductsFamily, 
                                            B.productInRoute, B.positionInRoute, SUM(quantityProduct) AS saleProduct 
                                            FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} AS A
                                            JOIN ${tableOfDataBase.tables.PRODUCTS} AS B
                                            ON A.idProduct = B.idProduct
                                            WHERE A.dateSale >= '${input.sinceDate}' AND A.dateSale <= '${input.untilDate}'
                                            GROUP BY A.idProduct ORDER BY B.productInRoute DESC, saleProduct DESC ${limit}`);

    //Pedimos productos con mayor venta
    var lessSales = await env.enviroment(0, `SELECT B.idProduct, B.nameProduct, B.abbreviationProduct, B.idProductsFamily, 
                                            B.productInRoute, B.positionInRoute, SUM(quantityProduct) AS saleProduct 
                                            FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} AS A
                                            JOIN ${tableOfDataBase.tables.PRODUCTS} AS B
                                            ON A.idProduct = B.idProduct
                                            WHERE A.dateSale >= '${input.sinceDate}' AND A.dateSale <= '${input.untilDate}'
                                            GROUP BY A.idProduct ORDER BY B.productInRoute ASC, saleProduct ASC ${limit}`);

    //Verificamos que el usuario no haya puesto un limite a la busqueda
    var limit = '';
    if(input.limitLoss > 0){
        limit = `LIMIT ${input.limitLoss}`
    }

        //Pedimos productos con mayor venta
        var topLoss = await env.enviroment(0, `SELECT B.idProduct, B.nameProduct, B.abbreviationProduct, B.idProductsFamily, 
                                                B.productInRoute, B.positionInRoute, SUM(quantityProduct) AS lossProduct 
                                                FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT} AS A
                                                JOIN ${tableOfDataBase.tables.PRODUCTS} AS B
                                                ON A.idProduct = B.idProduct
                                                WHERE A.dateLoss >= '${input.sinceDate}' AND A.dateLoss <= '${input.untilDate}'
                                                GROUP BY A.idProduct ORDER BY B.productInRoute DESC, lossProduct DESC ${limit}`);

        //Pedimos productos con menor venta
        var lessLoss = await env.enviroment(0, `SELECT B.idProduct, B.nameProduct, B.abbreviationProduct, B.idProductsFamily, 
                                                B.productInRoute, B.positionInRoute, SUM(quantityProduct) AS lossProduct 
                                                FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT} AS A
                                                JOIN ${tableOfDataBase.tables.PRODUCTS} AS B
                                                ON A.idProduct = B.idProduct
                                                WHERE A.dateLoss >= '${input.sinceDate}' AND A.dateLoss <= '${input.untilDate}'
                                                GROUP BY A.idProduct ORDER BY B.productInRoute ASC, lossProduct ASC ${limit}`);



//Comenzamos a crear el archivo excel con la informacion -------------------------------------------------------
    var workbook = await XLSX.utils.book_new();//Creamos un nuevo libro
 
//Ventas de producto por ruta ---------------------------------
    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: venta de productos en la ruta']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID producto', 'Nombre de producto', '¿Producto de ruta?','Ruta', 'Dia', 'Venta']);
    
    for(var i=0; i < productRouteSale.length; i++){
        for(var j=0; j < days.length; j++){
            if(productRouteSale[i].idDay==days[j].id){
                var productInRoute = '';

                if(productRouteSale[i].productInRoute==1){
                    productInRoute = 'Si'
                }else{
                    productInRoute = 'No'
                }

                ws_data.push([productRouteSale[i].idProduct,
                              productRouteSale[i].nameProduct,
                              productInRoute,
                              productRouteSale[i].nameRoute,
                              days[j].day,
                              productRouteSale[i].saleProduct]);

                break;
            }
        }
    }

    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Ventas producto ruta"); //Agregamos las "hojas" a nuestro archivo excel  

//Merma de producto por ruta ---------------------------------
    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: merma de productos en la ruta']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID producto', 'Nombre de producto', '¿Producto de ruta?','Ruta', 'Dia', 'Merma']);
    
    for(var i=0; i < productRouteLoss.length; i++){
        for(var j=0; j < days.length; j++){
            if(productRouteLoss[i].idDay==days[j].id){
                var productInRoute = '';
                
                if(productRouteLoss[i].productInRoute==1){
                    productInRoute = 'Si'
                }else{
                    productInRoute = 'No'
                }

                ws_data.push([productRouteLoss[i].idProduct,
                              productRouteLoss[i].nameProduct,
                              productInRoute,
                              productRouteLoss[i].nameRoute,
                              days[j].day,
                              productRouteLoss[i].lossProduct]);

                break;
            }
        }
    }

    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Merma producto ruta"); //Agregamos las "hojas" a nuestro archivo excel  

//Productos con mayor venta ---------------------------------
    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: venta de productos en la ruta']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID producto', 'Nombre de producto', '¿Producto de ruta?', 'Venta']);
    
    for(var i=0; i < topSales.length; i++){
        if(topSales[i].productInRoute==1){
            productInRoute = 'Si'
        }else{
            productInRoute = 'No'
        }

        ws_data.push([topSales[i].idProduct,
                    topSales[i].nameProduct,
                    productInRoute,
                    topSales[i].saleProduct]);
    }

    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Productos con mayor venta"); //Agregamos las "hojas" a nuestro archivo excel  

//Productos con menor venta ---------------------------------
    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: venta de productos en la ruta']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID producto', 'Nombre de producto', '¿Producto de ruta?', 'Venta']);
    
    for(var i=0; i < lessSales.length; i++){
        if(lessSales[i].productInRoute==1){
            productInRoute = 'Si'
        }else{
            productInRoute = 'No'
        }

        ws_data.push([lessSales[i].idProduct,
                    lessSales[i].nameProduct,
                    productInRoute,
                    lessSales[i].saleProduct]);
    }

    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Productos con menor venta"); //Agregamos las "hojas" a nuestro archivo excel  

//Productos con mayor merma ---------------------------------
    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: merma de productos en la ruta']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID producto', 'Nombre de producto', '¿Producto de ruta?', 'Merma']);
    
    for(var i=0; i < topLoss.length; i++){
        if(topLoss[i].productInRoute==1){
            productInRoute = 'Si'
        }else{
            productInRoute = 'No'
        }

        ws_data.push([topLoss[i].idProduct,
                    topLoss[i].nameProduct,
                    productInRoute,
                    topLoss[i].lossProduct]);
    }

    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Productos con mayor merma"); //Agregamos las "hojas" a nuestro archivo excel  

//Productos con menor merma ---------------------------------
    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: merma de productos en la ruta']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID producto', 'Nombre de producto', '¿Producto de ruta?', 'Merma']);
    
    for(var i=0; i < lessLoss.length; i++){
        if(lessLoss[i].productInRoute==1){
            productInRoute = 'Si'
        }else{
            productInRoute = 'No'
        }

        ws_data.push([lessLoss[i].idProduct,
                    lessLoss[i].nameProduct,
                    productInRoute,
                    lessLoss[i].lossProduct]);
    }

    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Productos con menor merma"); //Agregamos las "hojas" a nuestro archivo excel  

//Guardamos la informacion en un libro -------------------------------------------------------------------------------
    //Creamos el libro con las hojas ---
    await XLSX.writeFile(workbook, './downloads/ReporteVentaMermaProductos.xlsx'); //Escribimos el libro en excel
    return 1;
}

//Genera un reporte de venta y merma de productos por cliente organiazdo por ruta
async function  reportProductByClient(input, days){
    //Solicitamos la informacion a la base de datos
    //Solicitamos venta
    var salesOfProductsByClient = await env.enviroment(0, `SELECT B.idProduct, B.nameProduct, B.abbreviationProduct, B.idProductsFamily, 
                                                    B.productInRoute, C.nameRoute, A.idDay, D.idClient, D.nameStore, D.street, 
                                                    D.adressNumber, D.colony, SUM(quantityProduct) AS saleProduct 
                                                    FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} AS A
                                                    JOIN ${tableOfDataBase.tables.PRODUCTS} AS B
                                                    ON A.idProduct = B.idProduct
                                                    JOIN ${tableOfDataBase.tables.ROUTES} AS C
                                                    ON A.idRoute = C.idRoute
                                                    JOIN ${tableOfDataBase.tables.CLIENTS} AS D
                                                    ON A.idClient = D.idClient
                                                    WHERE A.dateSale >= '${input.sinceDate}' AND A.dateSale <= '${input.untilDate}'
                                                    GROUP BY C.idRoute, A.idDay, A.idClient, A.idProduct 
                                                    ORDER BY C.nameRoute ASC, A.idDay ASC, saleProduct DESC;`);

    //Solicitamos merma
    var lossOfProductsByClient = await env.enviroment(0, `SELECT B.idProduct, B.nameProduct, B.abbreviationProduct, B.idProductsFamily, 
                                                    B.productInRoute, C.nameRoute, A.idDay, D.idClient, D.nameStore, D.street, 
                                                    D.adressNumber, D.colony, SUM(quantityProduct) AS lossProduct 
                                                    FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT} AS A
                                                    JOIN ${tableOfDataBase.tables.PRODUCTS} AS B
                                                    ON A.idProduct = B.idProduct
                                                    JOIN ${tableOfDataBase.tables.ROUTES} AS C
                                                    ON A.idRoute = C.idRoute
                                                    JOIN ${tableOfDataBase.tables.CLIENTS} AS D
                                                    ON A.idClient = D.idClient
                                                    WHERE A.dateLoss >= '${input.sinceDate}' AND A.dateLoss <= '${input.untilDate}'
                                                    GROUP BY C.idRoute, A.idDay, A.idClient, A.idProduct 
                                                    ORDER BY C.nameRoute ASC, A.idDay ASC, lossProduct DESC;`);

    //Comenzamos a crear el archivo excel con la informacion -------------------------------------------------------
    var workbook = await XLSX.utils.book_new();//Creamos un nuevo libro

//Comenzamos a vaciar informacion ------------------------------------------------
//Para las ventas -----------------------------------------------

    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: Venta de productos por cliente']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID producto', 'Nombre de producto', '¿Producto de ruta?','Ruta', 'Dia', 'ID cliente', 'Cliente', 'Direccion','Venta']);
    
    for(var i=0; i < salesOfProductsByClient.length; i++){
        for(var j=0; j < days.length; j++){
            var productInTheRoute = '';
            if(salesOfProductsByClient[i].productInRoute==1){
                productInTheRoute = 'Si';
            }else{
                productInTheRoute = 'No';
            }
            if(salesOfProductsByClient[i].idDay==days[j].id){
                ws_data.push([
                    salesOfProductsByClient[i].idProduct,
                    salesOfProductsByClient[i].nameProduct,
                    productInTheRoute,
                    salesOfProductsByClient[i].nameRoute,
                    days[j].day, 
                    salesOfProductsByClient[i].idClient, 
                    salesOfProductsByClient[i].nameStore, 
                    `${salesOfProductsByClient[i].street} ${salesOfProductsByClient[i].adressNumber}, ${salesOfProductsByClient[i].colony}`,
                    salesOfProductsByClient[i].saleProduct]);
                break;
            }
        }
    }


    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Venta producto cliente"); //Agregamos las "hojas" a nuestro archivo excel  

//Para las mermas -----------------------------------------------
    //Variables auxiliares
    var ws_data = [];

    ws_data.push(['Reporte: merma de productos por cliente']);
    ws_data.push(['']);
    ws_data.push([`Desde: ${input.sinceDate}`]);
    ws_data.push([`Hasta: ${input.untilDate}`]);
    ws_data.push(['']);
    ws_data.push(['ID producto', 'Nombre de producto', '¿Producto de ruta?','Ruta', 'Dia', 'ID cliente', 'Cliente', 'Direccion','Merma']);
    
    for(var i=0; i < lossOfProductsByClient.length; i++){
        for(var j=0; j < days.length; j++){
            var productInTheRoute = '';
            if(lossOfProductsByClient[i].productInRoute==1){
                productInTheRoute = 'Si';
            }else{
                productInTheRoute = 'No';
            }
            if(lossOfProductsByClient[i].idDay==days[j].id){
                ws_data.push([
                    lossOfProductsByClient[i].idProduct,
                    lossOfProductsByClient[i].nameProduct,
                    productInTheRoute,
                    lossOfProductsByClient[i].nameRoute,
                    days[j].day, 
                    lossOfProductsByClient[i].idClient, 
                    lossOfProductsByClient[i].nameStore, 
                    `${lossOfProductsByClient[i].street} ${lossOfProductsByClient[i].adressNumber}, ${lossOfProductsByClient[i].colony}`,
                    lossOfProductsByClient[i].lossProduct]);
                break;
            }
        }
    }


    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Merma producto cliente"); //Agregamos las "hojas" a nuestro archivo excel  


//Guardamos la informacion en un libro -------------------------------------------------------------------------------
    //Creamos el libro con las hojas ---
    await XLSX.writeFile(workbook, './downloads/ReporteVentaMermaProductosPorCliente.xlsx'); //Escribimos el libro en excel
    return 1;
}

//Genera un reporte historico, ya sea de producto, cliente o ruta
async function reportHistoric(input, days){
    var thisOption = 0; //Variable auxiliar que nos ayudara a determinar cual opcion escogio el usuario 
    var partIdquery = '';
    if(input.idRoute!=undefined){
        partIdquery= `idRoute IN(${input.idRoute})`;
        thisOption = 1;
    }else if(input.idClient!=undefined){
        partIdquery= `idClient IN(${input.idClient})`;
        thisOption = 2;
    }else{
        partIdquery= `idProduct IN(${input.idProduct})`;
        thisOption = 3;
    }


    //Solicitamos la informacion a la base de datos
    var historicSale = await env.enviroment(0,`SELECT idRoute, idDay, idClient, dateSale, idProduct, 
                                        SUM(quantityProduct) AS quantityProduct, 
                                        SUM(quantityProduct*priceProduct ) AS sale
                                        FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT}
                                        WHERE ${partIdquery} 
                                        AND dateSale >= '${input.sinceDate}' 
                                        AND dateSale <= '${input.untilDate}'
                                        GROUP BY dateSale;`);

    var historicLoss = await env.enviroment(0,`SELECT idRoute, idDay, idClient, dateLoss, idProduct, 
                                        SUM(quantityProduct) AS quantityProduct, 
                                        SUM(quantityProduct*priceProduct ) AS loss
                                        FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT}
                                        WHERE ${partIdquery} 
                                        AND dateLoss >= '${input.sinceDate}' 
                                        AND dateLoss <= '${input.untilDate}'
                                        GROUP BY dateLoss;`);

    //Comenzamos a crear el archivo excel con la informacion -------------------------------------------------------
    var workbook = await XLSX.utils.book_new();//Creamos un nuevo libro
    
    if(thisOption==1){
        var [ thisRoute ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.ROUTES} 
                                            WHERE idRoute = ${input.idRoute}`);
            
        //Variables auxiliares
        var ws_data = [];

        if(thisRoute!=undefined){
            ws_data.push(['Reporte historico de ruta']);
            ws_data.push(['']);
            ws_data.push([`Ruta: ${thisRoute.nameRoute}`]);
            ws_data.push(['']);
            ws_data.push([`Desde: ${input.sinceDate}`]);
            ws_data.push([`Hasta: ${input.untilDate}`]);
            ws_data.push(['']);
            ws_data.push(['Dia','Fecha','Venta','Cantidad producto']);
    
            //Comenzamos ciclo for para agregar todos los datos
            for(var i=0; i < historicSale.length; i++){
                for(var j=0; j < days.length; j++){
                    if(historicSale[i].idDay == days[j].id){
                        ws_data.push([days[j].day,
                                      time.convertToOnlyDate(historicSale[i].dateSale),            
                                      historicSale[i].sale,            
                                      historicSale[i].quantityProduct]);
                    }
                }
            }
    
            var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
            await XLSX.utils.book_append_sheet(workbook, ws, "Ventas historicas"); //Agregamos las "hojas" a nuestro archivo excel 
    
            //Variables auxiliares
            var ws_data = [];
            ws_data.push(['Reporte historico de ruta']);
            ws_data.push(['']);
            ws_data.push([`Ruta: ${thisRoute.nameRoute}`]);
            ws_data.push(['']);
            ws_data.push([`Desde: ${input.sinceDate}`]);
            ws_data.push([`Hasta: ${input.untilDate}`]);
            ws_data.push(['']);
            ws_data.push(['Dia','Fecha','Merma','Cantidad producto']);
    
            //Comenzamos ciclo for para agregar todos los datos
            for(var i=0; i < historicLoss.length; i++){
                for(var j=0; j < days.length; j++){
                    if(historicLoss[i].idDay == days[j].id){
                        ws_data.push([days[j].day,
                                      time.convertToOnlyDate(historicLoss[i].dateLoss),            
                                      historicLoss[i].loss,            
                                      historicLoss[i].quantityProduct]);
                    }
                }
            }
    
            var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
            await XLSX.utils.book_append_sheet(workbook, ws, "Mermas historicas"); //Agregamos las "hojas" a nuestro archivo excel 
        }else{
            ws_data.push([`No se encontraron resultados a la busqueda, ID ruta proporcionado: ${input.idRoute}`]);
            var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
            await XLSX.utils.book_append_sheet(workbook, ws, "Ventas historicas"); //Agregamos las "hojas" a nuestro archivo excel    
        }

    }else if(thisOption==2){
        var [ thisClient ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.CLIENTS} 
                                            WHERE idClient = ${input.idClient}`);
        
        //Variables auxiliares
        var ws_data = [];
        if(thisClient!=undefined){
            ws_data.push(['Reporte historico de cliente']);
            ws_data.push(['']);
            ws_data.push([`ID cliente: ${thisClient.idClient}`]);
            ws_data.push([`Cliente: ${thisClient.nameStore}`]);
            ws_data.push([`Direccion: ${thisClient.adress} #${thisClient.adressNumber}, ${thisClient.colony}`]);
            ws_data.push(['']);
            ws_data.push([`Desde: ${input.sinceDate}`]);
            ws_data.push([`Hasta: ${input.untilDate}`]);
            ws_data.push(['']);
            ws_data.push(['Fecha','Venta','Cantidad producto']);
    
            //Comenzamos ciclo for para agregar todos los datos
            for(var i=0; i < historicSale.length; i++){
                ws_data.push([time.convertToOnlyDate(historicSale[i].dateSale),            
                              historicSale[i].sale,            
                              historicSale[i].quantityProduct]);
            }
    
            var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
            await XLSX.utils.book_append_sheet(workbook, ws, "Ventas historicas"); //Agregamos las "hojas" a nuestro archivo excel 
    
            //Variables auxiliares
            var ws_data = [];
            ws_data.push(['Reporte historico de cliente']);
            ws_data.push(['']);
            ws_data.push([`ID cliente: ${thisClient.idClient}`]);
            ws_data.push([`Cliente: ${thisClient.nameStore}`]);
            ws_data.push([`Direccion: ${thisClient.adress} #${thisClient.adressNumber}, ${thisClient.colony}`]);
            ws_data.push(['']);
            ws_data.push([`Desde: ${input.sinceDate}`]);
            ws_data.push([`Hasta: ${input.untilDate}`]);
            ws_data.push(['']);
            ws_data.push(['Fecha','Venta','Cantidad producto']);
    
            //Comenzamos ciclo for para agregar todos los datos
            for(var i=0; i < historicLoss.length; i++){
                ws_data.push([time.convertToOnlyDate(historicLoss[i].dateLoss),            
                              historicLoss[i].loss,            
                              historicLoss[i].quantityProduct]);
            }
    
            var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
            await XLSX.utils.book_append_sheet(workbook, ws, "Mermas historicas"); //Agregamos las "hojas" a nuestro archivo excel 
        }else{
            ws_data.push([`No se encontraron resultados a la busqueda, ID cliente proporcionado: ${input.idClient}`]);
            var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
            await XLSX.utils.book_append_sheet(workbook, ws, "Ventas historicas"); //Agregamos las "hojas" a nuestro archivo excel    
        }

    }else{
        var [ thisProduct ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.PRODUCTS} 
                                            WHERE idProduct = ${input.idProduct}`);
        //Variables auxiliares
        var ws_data = [];
        if(thisProduct!=undefined){
                ws_data.push(['Reporte historico de producto']);
                ws_data.push(['']);
                ws_data.push([`ID producto: ${thisProduct.idProduct}`]);
                ws_data.push([`Producto: ${thisProduct.nameProduct}`]);
                var productInRoute='';
                
                if(thisProduct.productInRoute==1){
                    productInRoute = 'Si';
                }else{
                    productInRoute = 'No';
                }
                ws_data.push([`Producto en ruta: ${productInRoute}`]);
                ws_data.push(['']);
                ws_data.push([`Desde: ${input.sinceDate}`]);
                ws_data.push([`Hasta: ${input.untilDate}`]);
                ws_data.push(['']);
                ws_data.push(['Fecha','Venta','Cantidad producto']);
        
                //Comenzamos ciclo for para agregar todos los datos
                for(var i=0; i < historicSale.length; i++){
                    ws_data.push([time.convertToOnlyDate(historicSale[i].dateSale),            
                                historicSale[i].sale,            
                                historicSale[i].quantityProduct]);
                }
        
                var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
                await XLSX.utils.book_append_sheet(workbook, ws, "Ventas historicas"); //Agregamos las "hojas" a nuestro archivo excel 
        
                //Variables auxiliares
                var ws_data = [];
                ws_data.push(['Reporte historico de producto']);
                ws_data.push(['']);
                ws_data.push([`ID producto: ${thisProduct.idProduct}`]);
                ws_data.push([`Producto: ${thisProduct.nameProduct}`]);
                var productInRoute='';
                if(thisProduct.productInRoute==1){
                    productInRoute = 'Si';
                }else{
                    productInRoute = 'No';
                }
                ws_data.push([`Producto en ruta: ${productInRoute}`]);
                ws_data.push(['']);
                ws_data.push([`Desde: ${input.sinceDate}`]);
                ws_data.push([`Hasta: ${input.untilDate}`]);
                ws_data.push(['']);
                ws_data.push(['Fecha','Venta','Cantidad producto']);
        
                //Comenzamos ciclo for para agregar todos los datos
                for(var i=0; i < historicLoss.length; i++){
                    ws_data.push([time.convertToOnlyDate(historicLoss[i].dateLoss),            
                                historicLoss[i].loss,            
                                historicLoss[i].quantityProduct]);
                }
        
                var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
                await XLSX.utils.book_append_sheet(workbook, ws, "Mermas historicas"); //Agregamos las "hojas" a nuestro archivo excel 
        }else{
            ws_data.push([`No se encontraron resultados a la busqueda, ID producto proporcionado: ${input.idProduct}`]);
            var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
            await XLSX.utils.book_append_sheet(workbook, ws, "Ventas historicas"); //Agregamos las "hojas" a nuestro archivo excel    
        }
    }
//Guardamos la informacion en un libro -------------------------------------------------------------------------------
        //Creamos el libro con las hojas ---
        await XLSX.writeFile(workbook, './downloads/ReporteHistorico.xlsx'); //Escribimos el libro en excel
        return 1;  
}

module.exports = {
    locationRoute,
    reportRouteState,
    reportClientState,
    reportProductState,
    reportProductByClient,
    reportHistoric
}