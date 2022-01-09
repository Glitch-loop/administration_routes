'use strict'
//Importmamos librerias
const XLSX = require("xlsx");
const { execFile } = require('child_process');

//Importamos objetos
const LossProduct = require('../Objects/LossProduct.js');
const SaleProduct = require('../Objects/SaleProduct.js');
const Route = require('../Objects/Route.js');

//Importamos componentes
const env = require('../utils/enviromentDevelopOrDeploy.js');
const tableOfDataBase = require('../utils/tableOfDataBase.js');
const time = require('../utils/date.js');
const utils = require('../utils/utils.js');

//Obtiene las ventas de un dia y de una ruta especifica, devuelve un array con un objeto especial para las ventas
async function getASale(input){
    var result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} 
                              WHERE idRoute IN(${input.idRoute}) and dateSale = '${input.dateSale}'`);

    return createSaleArray(result);
}

//Obtiene las mermas de un dia y de una ruta especifica, devuelve un array con un objeto especial para las mermas
async function getALoss(input){
    var result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT} 
    WHERE idRoute IN(${input.idRoute}) and dateLoss = '${input.dateSale}'`);

    return createLossArray(result);
}

//Busca si existen ventas en un intervalo de dias
async function getASaleInIntervalOfDay(fisrtDateSale, secondDateSale, idRoute){
    var result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} WHERE dateSale 
                                    BETWEEN '${fisrtDateSale}' AND '${secondDateSale}' AND idRoute = ${idRoute} 
                                    GROUP BY dateSale ORDER by dateSale ASC;`);

    return createSaleArray(result);
}

//Busca si existen perdidas en un intervalo de dias
async function getALossInIntervalOfDay(fisrtDateSale,secondDateSale, idRoute){
    var result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT} WHERE dateLoss 
                                    BETWEEN '${fisrtDateSale}' AND '${secondDateSale}' AND idRoute = ${idRoute} 
                                    GROUP BY dateLoss ORDER by dateLoss ASC;`);

    return createLossArray(result);
}

//Genera el archivo para agregar una venta
async function addSaleProductArchive(input){
    //Verificamos que no exista una venta para ese dia 
    var sale = await getASale(input);
    var loss = await getALoss(input);

    if(sale[0]!=undefined || loss[0]!=undefined)
        return 3;

    var workbook = await XLSX.utils.book_new();//Creamos un nuevo libro

    //Variables auxiliares
    var ws_data = [];

    //Agregamos encabezados ---
    ws_data.push(['idClient','NumeroDePosicion','Nombre','Direccion']);
    
    // //Agregamos ID de producto ---
    // for(var i=0; i< input.productsInRoute.length; i++){
    //     ws_data[0].push(input.productsInRoute[i].product.idProduct);
    // }

    //Agregamos informacion para el usuario
    ws_data.push(['',`${input.routesPosition.route.nameRoute} - ${input.nameDay}`,'',`FECHA: ${input.dateSale}`]);
    ws_data.push(['','','','Precio']);
    
//Creacion de hojas de trabajo para ventas y mermas---------------------------------------------------------------
    
    if(input.productRoute==0){
        //Agregamos precios de productos ---
        for(var i=0; i< input.productsInRoute.length; i++){
            ws_data[2].push(input.productsInRoute[i].product.price);
        }
        
        //Agregamos encabezado ---
        ws_data.push(['-','-','-','-']);

        //Agregamos productos
        for(var i=0; i< input.productsInRoute.length; i++){
            if(input.productsInRoute[i].product.abbreviationProduct==''|| 
            input.productsInRoute[i].product.abbreviationProduct==' '){
                ws_data[3].push(input.productsInRoute[i].product.nameProduct);
            }else{
                ws_data[3].push(input.productsInRoute[i].product.abbreviationProduct);

            }
        }

        //Agregamos clientes
        for(var i=0; i < input.routesPosition.arrayPositionInRoute[0].position.length; i++){
            var aux = [];
            aux.push(input.routesPosition.arrayPositionInRoute[0].position[i].idClient,i+1,input.routesPosition.arrayPositionInRoute[0].position[i].nameStore, 
                    `${input.routesPosition.arrayPositionInRoute[0].position[i].street} ${input.routesPosition.arrayPositionInRoute[0].position[i].adressNumber}, ${input.routesPosition.arrayPositionInRoute[0].position[i].colony}`)
            ws_data.push(aux);        
        }

        var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
       
        await XLSX.utils.book_append_sheet(workbook, ws, "Ventas"); //Agregamos las "hojas" a nuestro archivo excel 
        await XLSX.utils.book_append_sheet(workbook, ws, "Mermas"); //Agregamos las "hojas" a nuestro archivo excel 
    }

//Creacion de hojas de trabajo para otros productos-----------------------------------------------------------------
    if(input.notProductRoute==0){
        var ws_data_other = []; //Variable auxiliar
        //Agregamos encabezados
        ws_data_other.push(['idClient','NumeroDePosicion','Nombre','Direccion']);

        // //Agregamos ID de producto
        // for(var i=0; i< input.productsNotInRoute.length; i++){
        //     for(var j=0; j < input.productsNotInRoute[i].Product.length; j++){
        //         ws_data_other[0].push(input.productsNotInRoute[i].Product[j].product.idProduct);
        //     }
        // }

        //Agregamos informacion para el usuario
        ws_data_other.push(['',`${input.routesPosition.route.nameRoute} - ${input.nameDay}`,'',`FECHA: ${input.dateSale}`]);
        ws_data_other.push(['','','','Precio']);
        
        //Agregamos precios de productos
        for(var i=0; i< input.productsNotInRoute.length; i++){
            for(var j=0; j < input.productsNotInRoute[i].Product.length; j++){
                ws_data_other[2].push(input.productsNotInRoute[i].Product[j].product.price);
            }
        }
        
        //Agregamos encabezado
        ws_data_other.push(['-','-','-','-']);

        //Agregamos productos
        for(var i=0; i< input.productsNotInRoute.length; i++){
            for(var j=0; j < input.productsNotInRoute[i].Product.length; j++){
                if(input.productsNotInRoute[i].Product[j].product.abbreviationProduct==''|| 
                input.productsNotInRoute[i].Product[j].product.abbreviationProduct==' '){
                    ws_data_other[3].push(input.productsNotInRoute[i].Product[j].product.nameProduct);
                }else{
                    ws_data_other[3].push(input.productsNotInRoute[i].Product[j].product.abbreviationProduct);
                }
            }
        }

        //Agregamos clientes
        for(var i=0; i < input.routesPosition.arrayPositionInRoute[0].position.length; i++){
            var aux = [];
            aux.push(input.routesPosition.arrayPositionInRoute[0].position[i].idClient,i+1,input.routesPosition.arrayPositionInRoute[0].position[i].nameStore, 
                    `${input.routesPosition.arrayPositionInRoute[0].position[i].street} ${input.routesPosition.arrayPositionInRoute[0].position[i].adressNumber}, ${input.routesPosition.arrayPositionInRoute[0].position[i].colony}`);
                    ws_data_other.push(aux);
        }

        var ws = await XLSX.utils.aoa_to_sheet(ws_data_other); //Creamos la "hoja" con los datos
        await XLSX.utils.book_append_sheet(workbook, ws, "Otros productos"); //Agregamos las "hojas" a nuestro archivo excel 
    }

//Creamos el libro con las hojas ---
    await XLSX.writeFile(workbook, './downloads/AgregarVenta.xlsx'); //Escribimos el libro en excel
    
    var dataForUpload = {
        'idRoute': input.idRoute,
        'date': input.dateSale,
        'idDay': input.idDay
    }
    return dataForUpload;
}

//Agrega una venta a la base de datos
async function addSaleProductArchiveUpload(dataForUploadASale, routesPosition, productsInRoute,productsNotInRoute){
    const workbook = await XLSX.readFile("./uploads/workbook.xlsx");
    var work_sheet_sales = await XLSX.utils.sheet_to_json(workbook.Sheets["Ventas"]);//Parseamos a formato JSON
    var work_sheet_loss = await XLSX.utils.sheet_to_json(workbook.Sheets["Mermas"]);//Parseamos a formato JSON
    var work_sheet_other = await XLSX.utils.sheet_to_json(workbook.Sheets["Otros productos"]);//Parseamos a formato JSON

    //Verificamos que el usuario no haya puesto letras en los idClient
    var errDetectedGeneral=0;

    errDetectedGeneral = verifyIdClientExist(work_sheet_sales);
    errDetectedGeneral = verifyIdClientExist(work_sheet_loss);
    errDetectedGeneral = verifyIdClientExist(work_sheet_other);

    if(errDetectedGeneral!=0)
        return errDetectedGeneral;

 
    //Verificamos que el archivo realmente pertenezca al dia
    //Venta
    for(var i=0; i<routesPosition.arrayPositionInRoute[0].position.length; i++){
        var notIsTheSameDay = 1;
        for(var j=3; j<work_sheet_sales.length; j++){
            if(routesPosition.arrayPositionInRoute[0].position[i].idClient==work_sheet_sales[j].idClient){
                notIsTheSameDay = 0;
            }
        }
        if(notIsTheSameDay==1){
            return 6;
        }
    }

    //Merma
    for(var i=0; i<routesPosition.arrayPositionInRoute[0].position.length; i++){
        var notIsTheSameDay = 1;
        for(var j=3; j<work_sheet_loss.length; j++){
            if(routesPosition.arrayPositionInRoute[0].position[i].idClient==work_sheet_loss[j].idClient){
                notIsTheSameDay = 0;
            }
        }
        if(notIsTheSameDay==1){
            return 6;
        }
    }

    //Otra Venta
    if(work_sheet_other[0]!=undefined){
        for(var i=0; i<routesPosition.arrayPositionInRoute[0].position.length; i++){
            var notIsTheSameDay = 1;
            for(var j=3; j<work_sheet_other.length; j++){
                if(routesPosition.arrayPositionInRoute[0].position[i].idClient==work_sheet_other[j].idClient){
                    notIsTheSameDay = 0;
                }
            }
            if(notIsTheSameDay==1){
                return 6;
            }
        }
    }
    
    //Obtenemos el dia que corresponde a la fecha
    var nameDay = await time.getTheDayOfDate(dataForUploadASale.date);

    //Convertimos en texto el idDay
    var idDay = await JSON.stringify(nameDay.id);
   
    //Iniciamos proceso para guardar en base de datos
    
    var arraySaleInRoute = [];
    var arrayLossInRoute = [];
    var arrayOtherSaleInRoute = [];
    //Para las ventas ---
    //Recorremos los clientes
    for(var i=3; i < work_sheet_sales.length; i++){
        var this_work_sheet = work_sheet_sales[i]; //Variable auxiliar
        //Recorremos los productos
        for(var j=0; j < productsInRoute.length; j++){
            if(j==0){
                var thisProduct = '__EMPTY'
            }else{
                var thisProduct = '__EMPTY_' + j;
            }
            //Checamos que no sea indefinido o solo sean espacios
            if(this_work_sheet[`${thisProduct}`]!=undefined &&
            this_work_sheet[`${thisProduct}`]!=' ' &&
            this_work_sheet[`${thisProduct}`]!= '  '){
  
                var quantityProduct = this_work_sheet[`${thisProduct}`]; //Guardamos la cantidad de producto comprado en una variable
                
                //Verificamos que los datos sean los correspondientes
                var errDetected = verifyAddNewSaleOrLoss(await JSON.stringify(quantityProduct), await JSON.stringify(work_sheet_sales[i].idClient));

                if(errDetected!=0)
                    return errDetected;

                //Guardamos producto en un array
                arraySaleInRoute.push(new SaleProduct(undefined,
                                                    dataForUploadASale.idRoute,
                                                    idDay,
                                                    work_sheet_sales[i].idClient,
                                                    dataForUploadASale.date,
                                                    productsInRoute[j].product.idProduct,
                                                    quantityProduct,
                                                    productsInRoute[j].product.price));
            }
        }
    }
    
    //Para las mermas 
    for(var i=3; i < work_sheet_loss.length; i++){
        var this_work_sheet = work_sheet_loss[i]; //Variable auxiliar
        //Recorremos los productos
        for(var j=0; j < productsInRoute.length; j++){
            if(j==0){
                var thisProduct = '__EMPTY'
            }else{
                var thisProduct = '__EMPTY_' + j;
            }
            //Checamos que no sea indefinido o solo sean espacios
            if(this_work_sheet[`${thisProduct}`]!=undefined &&
            this_work_sheet[`${thisProduct}`]!=' ' &&
            this_work_sheet[`${thisProduct}`]!= '  '){

                
            var quantityProduct = this_work_sheet[`${thisProduct}`]; //Guardamos la cantidad de producto comprado en una variable
            
                //Verificamos que los datos sean los correspondientes
                var errDetected = verifyAddNewSaleOrLoss(await JSON.stringify(quantityProduct), await JSON.stringify(work_sheet_loss[i].idClient));

                if(errDetected!=0)
                    return errDetected;

                //Guardamos producto en un array
                arrayLossInRoute.push(new LossProduct(undefined,
                                                    dataForUploadASale.idRoute,
                                                    idDay,
                                                    work_sheet_loss[i].idClient,
                                                    dataForUploadASale.date,
                                                    productsInRoute[j].product.idProduct,
                                                    quantityProduct,
                                                    productsInRoute[j].product.price));
            }
        }
    }

    //Para otras ventas 
    for(var i=3; i < work_sheet_other.length; i++){
        var this_work_sheet = work_sheet_other[i]; //Variable auxiliar
        //Recorremos los productos
        var contProductsNotInRoute = 0; //Variable auciliar
        for(var j=0; j < productsNotInRoute.length; j++){
            for(var k=0; k < productsNotInRoute[j].Product.length; k++){
                if(contProductsNotInRoute==0){
                    var thisProduct = '__EMPTY'
                }else{
                    var thisProduct = '__EMPTY_' + contProductsNotInRoute;
                }

                //Checamos que no sea indefinido o solo sean espacios
                if(this_work_sheet[`${thisProduct}`]!=undefined &&
                this_work_sheet[`${thisProduct}`]!=' ' &&
                this_work_sheet[`${thisProduct}`]!= '  '){

                    
                var quantityProduct = this_work_sheet[`${thisProduct}`]; //Guardamos la cantidad de producto comprado en una variable
                
                //Verificamos que los datos sean los correspondientes
                var errDetected = verifyAddNewSaleOrLoss(await JSON.stringify(quantityProduct), await JSON.stringify(work_sheet_other[i].idClient));

                if(errDetected!=0)
                    return errDetected;

                    //Guardamos producto en un array
                    arrayOtherSaleInRoute.push(new SaleProduct(undefined,
                                                        dataForUploadASale.idRoute,
                                                        idDay,
                                                        work_sheet_other[i].idClient,
                                                        dataForUploadASale.date,
                                                        productsNotInRoute[j].Product[k].product.idProduct,
                                                        quantityProduct,
                                                        productsNotInRoute[j].Product[k].product.price));
                }
                contProductsNotInRoute++;
            }
        }
    }
    
    //Si cuando estabamos creando los objetos no retorno la funcion un error, significa que podemos guardar en la DB
    arraySaleInRoute.forEach(async element => {
        await element.addNewSaleProduct();
    });

    arrayLossInRoute.forEach(async element => {
        await element.addNewLossProduct();
    });

    arrayOtherSaleInRoute.forEach(async element => {
        await element.addNewSaleProduct();
    });

    //Comenzamos la limpieza automatica
    var arrayDeleteClient = await cleanRoute(idDay,dataForUploadASale);

    if(arrayDeleteClient[0]==undefined){
        return 4;  
    }else{
        //Creamos un archivo excel para informar al usuario que se elimino una posicion
        return await cleanedRoutePosition(arrayDeleteClient, dataForUploadASale);
    }


}

//Busca un dia de venta
async function updateSaleProductSearch(data){
    var firstDay = await time.convertDate(data.fisrtDateSale);
    var secondDay = await time.convertDate(data.secondDateSale);

    //Verificamos que la primera fecha no sea menor a la segunda
    if(firstDay>secondDay)
        return 1
    
    //Buscamos en base de datos
    var arraySale = await getASaleInIntervalOfDay(data.fisrtDateSale, data.secondDateSale, data.idRoute);
    var arrayLoss = await getALossInIntervalOfDay(data.fisrtDateSale, data.secondDateSale, data.idRoute);

    //En caso de no se haya agregado aun un dia
    if(arraySale[0]==undefined && arrayLoss[0]==undefined)
        return 2;

    var dataArray = []; //En este nuevo array estaran los dias en los que exista o bien una venta o una merma o ambos

    //Inicializamos el array con el primer dato del array de ventas
    dataArray.push(data = {
        'idRoute': arraySale[0].saleProduct.idRoute,
        'date': await time.convertToOnlyDate(arraySale[0].saleProduct.dateSale)
    });

    //Este for agrega las ventas que no estan en el "dataArray", guiandonos siempre por la fecha
    for(var i=0; i<arraySale.length; i++){
        var aux=1;
        var date = await time.convertToOnlyDate(arraySale[i].saleProduct.dateSale);
        for(var j=0; j<dataArray.length; j++){
            if(date == dataArray[j].date){
                aux=0;
                break;
            }
        }
        if(aux==1){
            dataArray.push(data = {
                'idRoute': arraySale[i].saleProduct.idRoute,
                'date': date
            });
        }
    }

    //Este for agrega las mermas que no estan en el "dataArray", guiandonos siempre por la fecha
    for(var i=0; i<arrayLoss.length; i++){
        var aux=1;
        var date = await time.convertToOnlyDate(arrayLoss[i].lossProduct.dateLoss);
        for(var j=0; j<dataArray.length; j++){
            if(date == dataArray[j].date){
                aux=0;
                break;
            }
        }
        if(aux==1){
            dataArray.push(data = {
                'idRoute': arrayLoss[i].lossProduct.idRoute,
                'date': date
            });
        }
    }

    /*
    Ya que tengamos la union tanto de ventas como de mermas retornamos, esto lo hacemos asi ya que pueden haber dias
    que o solo se hayan hecho ventas o que solo haigan mermas
    */
    return dataArray;
}

//Actualiza un dia de venta y merma usando como parametros el dia y el id de la ruta 
async function updateDate(input){
    var resultSale = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT}
                                        WHERE idRoute = '${input.idRoute}' AND dateSale = '${await time.convertToOnlyDate(input.date)}'`);

    var resultLoss = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT}
                                        WHERE idRoute = '${input.idRoute}' AND dateLoss = '${await time.convertToOnlyDate(input.date)}'`);
    
    var arraySale = await createSaleArray(resultSale);
    var arrayLoss = await createLossArray(resultLoss);
    
    input = {
        'idRoute': input.idRoute,
        'date': input.date,
        'idDay': input.idDay,
        'nameDay': input.nameDay,
        'routesPosition': input.routesPosition,
        'productsInRoute': input.productsInRoute,
        'productsNotInRoute': input.productsNotInRoute,
        'arraySale': arraySale,
        'arrayLoss': arrayLoss
    }

    return input;
}

//Elimina un dia de venta y merma usando como parametros el dia y el id de la ruta 
async function deleteDate(input){
    await env.enviroment(0, `DELETE FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} 
                                        WHERE idRoute = '${input.idRoute}' AND dateSale = '${await time.convertToOnlyDate(input.date)}'`);

    await env.enviroment(0, `DELETE FROM ${tableOfDataBase.tables.LOSS_BY_PRODUCT} 
                                        WHERE idRoute = '${input.idRoute}' AND dateLoss = '${await time.convertToOnlyDate(input.date)}'`);


    return `Se a eliminado las ventas y mermas del dia "${await time.convertToOnlyDate(input.date)}"`;
}

//Crea el archivo excel con el formato para la ruta
async function printDayOfRoute(input, productsInRoute, routesPosition){
    //Primero traemos la ultima fecha que tenemos venta de una ruta en un dia especifico
    console.log(routesPosition)

    var [ lastDay ] = await env.enviroment(0,`SELECT MAX(dateSale) AS dateSale
                                    FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} 
                                    WHERE idRoute IN(${input.idRoute}) AND idDay IN(${input.idDay})`);

    if(lastDay.dateSale!=null){
        lastDay = await time.convertToOnlyDate(lastDay.dateSale); //Le damos formato
    }else{
        lastDay = null;
    }

    input = {
        'idRoute': input.idRoute,
        'idDay': input.idDay,
        'nameDay': input.nameDay,
        'today': input.dateSale,
        'dateSale': lastDay
    }


    if(input.dateSale!=null){
        var arraySale = await getASale(input); //Obtenemos todos las ventas del utlimo dia que se tenga registro
    }else{
        var arraySale = [];
    }

    //Comenzamos a crear el archivo excel con la informacion -------------------------------------------------------
    var workbook = await XLSX.utils.book_new();//Creamos un nuevo libro

    //Variables auxiliares
    var ws_data = [];

    //Agregamos encabezados ---
    ws_data.push(['',`${routesPosition.route.nameRoute} - ${input.nameDay}`,`FECHA: ${input.today}`]);
    ws_data.push(['','','Precio']);

    var aux = ws_data.length-1;

    //Agregamos precios de productos ---    
    for(var i=0; i< productsInRoute.length; i++){
        ws_data[aux].push(productsInRoute[i].product.price);
    }

    //Agregamos encabezado ---
    ws_data.push(['No.','Nombre','Domicilio']);
    aux = ws_data.length-1;
    //Agregamos productos
    for(var i=0; i < productsInRoute.length; i++){
        if(productsInRoute[i].product.abbreviationProduct==''|| 
        productsInRoute[i].product.abbreviationProduct==' '){
            ws_data[aux].push(productsInRoute[i].product.nameProduct);
        }else{
            ws_data[aux].push(productsInRoute[i].product.abbreviationProduct);
        }
    }

    //Agregamos clientes
    var contAux = 0;
    for(var i=0; i < routesPosition.arrayPositionInRoute[0].position.length; i++){
        var aux = [];
        //Si es numero impar, tendra informacion, caso contrario sera un espacio vacio
        if(contAux%2==0){
            aux.push(i+1, routesPosition.arrayPositionInRoute[0].position[i].nameStore, 
            `${routesPosition.arrayPositionInRoute[0].position[i].street} ${routesPosition.arrayPositionInRoute[0].position[i].adressNumber}, ${routesPosition.arrayPositionInRoute[0].position[i].colony}`);
            //Agregamos la cantidad de los productos
            for(var j=0; j < productsInRoute.length; j++){
                var position=undefined
                for(var k=0; k < arraySale.length; k++){
                    if((routesPosition.arrayPositionInRoute[0].position[i].idClient==arraySale[k].saleProduct.idClient)&&
                    (productsInRoute[j].product.idProduct==arraySale[k].saleProduct.idProduct)){
                        position=k; //Posicion de la venta
                        break;
                    }
                }
                if(position!=undefined){
                    console.log(position)
                    aux.push(arraySale[position].saleProduct.quantityProduct)
                }else{
                    aux.push('');
                }
            }
        }else{
            //Restamos -1, para que no se salte un cliente
            i--;
            if(routesPosition.arrayPositionInRoute[0].position[i].penalty>0){
                var penaltySimbol = '';
                for(var m=0; m < routesPosition.arrayPositionInRoute[0].position[i].penalty; m++){
                    penaltySimbol += '*';
                }
                aux.push(penaltySimbol);
            }
        }
        ws_data.push(aux); //Guardamos la informacion del ultimo cliente
        contAux++;
        
        //Este caso es exclusivo para el ultimo ultimo cliente, en este if le agregamos los "*", en caso de que no este
        //Comprando 
        if(i==(routesPosition.arrayPositionInRoute[0].position.length-1)){
            ws_data.push(aux); //Guardamos la informacion del ultimo cliente
            var aux = [];
            if(routesPosition.arrayPositionInRoute[0].position[i].penalty>0){
                var penaltySimbol = '';
                for(var m=0; m < routesPosition.arrayPositionInRoute[0].position[i].penalty; m++){
                    penaltySimbol += '*';
                }
                aux.push(penaltySimbol);
            }
        }

        //Cada cierto tiempo tendremos que crear una nueva pagina
        if(contAux==34){
            contAux=0; //Reiniciamos contador auxiliar
            //Agregamos encabezados ---
            ws_data.push(['',`${routesPosition.route.nameRoute} - ${input.nameDay}`,`FECHA: ${input.today}`]);
            ws_data.push(['','','Precio']);

            var aux = ws_data.length-1;

            //Agregamos precios de productos ---    
            for(var j=0; j < productsInRoute.length; j++){
                ws_data[aux].push(productsInRoute[j].product.price);
            }

            //Agregamos encabezado ---
            ws_data.push(['No.','Nombre','Domicilio']);
            aux = ws_data.length-1;
            //Agregamos productos
            for(var j=0; j < productsInRoute.length; j++){
                if(productsInRoute[j].product.abbreviationProduct==''|| 
                productsInRoute[j].product.abbreviationProduct==' '){
                    ws_data[aux].push(productsInRoute[j].product.nameProduct);
                }else{
                    ws_data[aux].push(productsInRoute[j].product.abbreviationProduct);
                }
            }
        }
    }
    console.log('proceso ok')
    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
    await XLSX.utils.book_append_sheet(workbook, ws, "Productos en ruta"); //Agregamos las "hojas" a nuestro archivo excel 

    //Creamos el libro con las hojas ---
    await XLSX.writeFile(workbook, './downloads/FormatoRuta.xlsx'); //Escribimos el libro en excel
    return 1;
}

//Obtiene los parametros para juzgar si un cliente seguira estando en la ruta o no
async function getEnviromentVariable(){
    return env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.ENVIROMENT_VARIABLE}`);
}

//Actualiza los parametros para juzgar si uncliente seguira estando en la ruta o no
async function setEnviromentVariable(input){
    var [ enviroment_variable ] = await getEnviromentVariable();

    //Significa que aun no existen variables de entorno
    if(enviroment_variable == undefined){
        if(input.timeNotBuy=='')
            input.timeNotBuy==0;

        if(input.monetaryBuy=='')
            input.monetaryBuy==0;

        await env.enviroment(0, `INSERT INTO ${tableOfDataBase.tables.ENVIROMENT_VARIABLE}
                                 (timeNotBuy, monetaryBuy, activateSetEnviromentVariable) 
                                 VALUES ('${input.timeNotBuy}', '${input.monetaryBuy}', '1')`);
    }else{
        //Verificando en caso de que el ususario no haya puesto un dato vacio
        input.timeNotBuy = utils.updateInputData(enviroment_variable.timeNotBuy, input.timeNotBuy);
        input.monetaryBuy = utils.updateInputData(enviroment_variable.monetaryBuy, input.monetaryBuy);
        await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.ENVIROMENT_VARIABLE} 
                                 SET timeNotBuy='${input.timeNotBuy}', monetaryBuy='${input.monetaryBuy}'
                                 WHERE idSetEnviromentVariable = ${enviroment_variable.idSetEnviromentVariable}`);
                                 
                                 if(input.activateSetEnviromentVariable=='0'){
                                     await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.ENVIROMENT_VARIABLE} 
                                                              SET activateSetEnviromentVariable = '1'
                                                              WHERE idSetEnviromentVariable = ${enviroment_variable.idSetEnviromentVariable}`);
                                 }else if(input.activateSetEnviromentVariable==undefined){
                                     await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.ENVIROMENT_VARIABLE} 
                                                              SET activateSetEnviromentVariable = '0'
                                                              WHERE idSetEnviromentVariable = ${enviroment_variable.idSetEnviromentVariable}`);
                                 }
    }
    return 'Se a registrado correctamente los parametros'
}

//Funciones privadas del componente ---

//Hace un array de ventas
function createSaleArray(result){
    var arraySaleProduct = [];
    if(result!=undefined){
        result.forEach(element => {
            arraySaleProduct.push(new SaleProduct(element.idSales,
                                                  element.idRoute,
                                                  element.idDay,
                                                  element.idClient,
                                                  element.dateSale,
                                                  element.idProduct,
                                                  element.quantityProduct,
                                                  element.priceProduct));
        });
    }

    return arraySaleProduct;
}

//Hace un array de mermas
function createLossArray(result){
    var arrayLossProduct = [];
    if(result!=undefined){
        result.forEach(element => {
            arrayLossProduct.push(new LossProduct(element.idLoss,
                                                  element.idRoute,
                                                  element.idDay,
                                                  element.idClient,
                                                  element.dateLoss,
                                                  element.idProduct,
                                                  element.quantityProduct,
                                                  element.priceProduct));
        });
    }

    return arrayLossProduct;
}

//Funcion auxiliar para cuidar la verificacion a la hora de agrear una nueva venta
function verifyAddNewSaleOrLoss(quantityProduct,idClient){
    var errDetected = 0;

    //Verificamos que la cantidad de producto sea realmente un decimal 
    errDetected = utils.verifyIsDecimalNumber(quantityProduct, errDetected);
    if(errDetected==1)
        return 2;

    errDetected = utils.verifyIsNumber(idClient, errDetected);
    if(errDetected==1)
        return 3;
    
    return 0;
}

//Verifica si un idClient existe
function verifyIdClientExist(work_sheet){
    if(work_sheet[0]!=undefined){
        if(work_sheet[0].idClient!='')
            return 1; //Esto significa que el usuario modifico la casilla donde estaba el "idClient"
    }
    return 0;
}

//Quita los clientes que no juntan los requisitos para seguir estando en la ruta
async function cleanRoute(idDay,dataForUploadASale){
    var [ enviromentVariable ] = await getEnviromentVariable(); //Traemos los parametros con los que se juzgara

    //Si es 1 significa que el usuario activo la limpieza automatica
    var arrayDeleteClient = [];
    if(enviromentVariable.activateSetEnviromentVariable==1){
        var route = new Route(dataForUploadASale.idRoute); //Creamos un objeto de tipo ruta
        var arrayPositionRoute = await route.getARoutePosition(idDay); //Traemos la ruta a la que se evaluara
        
        for(var i=0; i < arrayPositionRoute.length; i++){
            //Traemos la venta "cantidad de producto" y "cantidad de venta"
            var [ check ] = await env.enviroment(0, `SELECT SUM(quantityProduct) AS quantityProduct, SUM(quantityProduct*priceProduct) AS sale 
                                           FROM ${tableOfDataBase.tables.SALES_BY_PRODUCT} 
                                           WHERE idRoute IN(${arrayPositionRoute[i].position.idRoute}) 
                                           AND idDay IN(${arrayPositionRoute[i].position.idDay}) 
                                           AND dateSale = '${dataForUploadASale.date}' 
                                           AND idClient IN(${arrayPositionRoute[i].position.idClient});`);

            //Si no compro nada o si compro menos de lo que es viable le sumaremos "1" al penalty
            if(check.quantityProduct==null || check.sale < enviromentVariable.monetaryBuy){
                arrayPositionRoute[i].position.penalty += 1;
            }else{
                //Si penalty es mayor 0 se le restara, señal de que se esta recuperando el cliente 
                if(arrayPositionRoute[i].position.penalty > 0)
                arrayPositionRoute[i].position.penalty -= 1;
            }
            
            //Si penalty revaza o es igual a los numeros de veces que ha no comprado, entonces eliminamos el cliente
            if(arrayPositionRoute[i].position.penalty >= enviromentVariable.timeNotBuy){
                arrayDeleteClient.push(arrayPositionRoute[i]);
                await route.deletePosition(arrayPositionRoute[i].position);
            }else{
                await arrayPositionRoute[i].updatePosition(); 
            }
        }

    }
    return arrayDeleteClient;
}

//Crea un archivo con las posiciones eliminadas
async function cleanedRoutePosition(arrayDeleteClient,dataForUploadASale){
    var day = time.getTheDayOfDate(dataForUploadASale.date);//Buscamos en el sistema de dias el dia correspondiente a la fecha

    var workbook = await XLSX.utils.book_new();//Creamos un nuevo libro
    //Variables auxiliares
    var ws_data = [];

    //Traemos datos de la para complementar la informacion
    
    var [ route ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.ROUTES} 
                                           WHERE idRoute IN(${arrayDeleteClient[0].position.idRoute})`);
    //Agregamos encabezados ---
    ws_data.push([`Se eliminaron las siguientes posiciones de la ruta "${route.nameRoute}"`]);
    ws_data.push([`Dia: ${day.day}`]);
    ws_data.push([`Dia en que se efectuo la eliminacion de las posiciones: ${dataForUploadASale.date}`]);
    ws_data.push(['']);
    ws_data.push(['idClient','NumeroDePosicion','Nombre','Direccion']);

    for(var i=0; i < arrayDeleteClient.length; i++){
        var [ client ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.CLIENTS} 
                                                  WHERE idClient IN(${arrayDeleteClient[i].position.idClient})`);
        ws_data.push([client.idClient, arrayDeleteClient[i].position.positionRouteDay, client.nameStore, 
                     `${client.street} #${client.adressNumber}, ${client.colony}`]);    
    }

    var ws = await XLSX.utils.aoa_to_sheet(ws_data); //Creamos la "hoja" con los datos
       
    await XLSX.utils.book_append_sheet(workbook, ws, "PosicionesEliminadas"); //Agregamos las "hojas" a nuestro archivo excel  
    await XLSX.writeFile(workbook, './downloads/PosicionesEliminadas.xlsx'); //Escribimos el libro en excel
    return 5;
}


module.exports = {
    getASale,
    getALoss,
    getASaleInIntervalOfDay,
    getALossInIntervalOfDay,
    addSaleProductArchive,
    addSaleProductArchiveUpload,
    updateSaleProductSearch,
    updateDate,
    deleteDate,
    printDayOfRoute,
    getEnviromentVariable,
    setEnviromentVariable
}