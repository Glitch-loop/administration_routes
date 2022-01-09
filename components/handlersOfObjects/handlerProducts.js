'use strict'
//Importmos objetos
const ProductFamily = require('../Objects/ProductFamily.js');
const Product = require('../Objects/Product.js');

//Importamos componentes
const env = require('../utils/enviromentDevelopOrDeploy.js')
const tableOfDataBase = require('../utils/tableOfDataBase.js');
const time = require('../utils/date');
const utils = require('../utils/utils.js');

//Familia ---
//Funacion que contiene el query para agregar una nueva familia
async function addNewFamily(nameFamily){
    //Verificamos si la base de datos que queremos agregar existe ya en la base de datos
    var [ detectedDataRepit ] = await env.enviroment(0,`SELECT * FROM ${tableOfDataBase.tables.PRODUCTS_FAMILY} 
                                                    WHERE nameFamily = '${nameFamily}'`);

    if(detectedDataRepit!=undefined){
        return `La familia de productos que intentas agregar ya existe en la base de datos su ID es: "${detectedDataRepit.idProductsFamily}"`;
    }else{
        await env.enviroment(0, `INSERT INTO ${tableOfDataBase.tables.PRODUCTS_FAMILY}
                                 (nameFamily) VALUES ('${nameFamily}')`);
        return 'Se ha guardado exitosamente'
    }
}

//Funcion para traer a todas las familias de productos
async function getAllFamily(){
    var result = await env.enviroment(0, `SELECT * FROM 
                                          ${tableOfDataBase.tables.PRODUCTS_FAMILY}
                                          ORDER BY nameFamily`);

    var arrayFamily = createFamilyArray(result);

    return arrayFamily;
}

//Retorna los datos de una familia por id
async function getFamilyById(idProductFamily){
    var result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.PRODUCTS_FAMILY}
    WHERE idproductsFamily  IN (${idProductFamily})`);

    var arrayFamily = createFamilyArray(result);

    return arrayFamily;
}

//Actualiza una familia de productos
async function updateFamily(data){
    //Traemos datos de la base de datos
    var [ family ] = await getFamilyById(data.idProductsFamily);
    
    //Checamos si quieren poner un nombre que ya tiene otra familia
    var [ detectedDataRepit ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.PRODUCTS_FAMILY} 
                                                   WHERE nameFamily = '${data.nameFamily}'`);

    if(detectedDataRepit==undefined){
        //Comparamos si es diferente los datos nuevos
        family.familyProduct.nameFamily = utils.updateInputData(family.familyProduct.nameFamily,
                                                                data.nameFamily);

        //Actualizamos
            await family.updateFamily();
            return 'Nota: Se actualizo correctamente la familia de productos'
    }else{
        return `Nota: El nombre que se esta intentando poner, ya pertenece a otra familia de productos cuyo ID es ${detectedDataRepit.idProductsFamily}`
    }

}

//Producto ---
//Regresa todos los productos
async function getAllProducts(desactiveProducts){
    var result = [];
    if(desactiveProducts=='0'){
        result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.PRODUCTS}
                            WHERE statusProduct IN(0,1) ORDER BY idProductsFamily ASC, nameProduct ASC`);
    }else{
        result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.PRODUCTS}
                            WHERE statusProduct = 1 ORDER BY idProductsFamily ASC, nameProduct ASC`);
    }
    
    var arrayProduct = await createProductArray(result);

    return arrayProduct;
}

//Regresa todos los productos por familia
async function getAllProductsByFamily(desactiveProducts){
    //Primero obtenemos a todas las familias
    var arrayFamily = await getAllFamily();

    //Creamos una nueva familia para los productos que no tienen una asignada
    arrayFamily.push(new ProductFamily(null,
                                      'Sin familia'));

    //Despues obtenemos todos los productos
    var arrayProduct = await getAllProducts(desactiveProducts);
    //Agregamos los productos a sus respectivas familias
    arrayFamily = joinProductWithFamily(arrayProduct,arrayFamily);
    
    return arrayFamily;
}

//Regresa el resultado de la busqueda de producto ya sea por ID, nombre o abreviacion
async function getProductByIdOrName(input){
    //Verificamos si es un ID o una cadena de texto
    //Recuerda que si es "0", es un ID, si es un "1", es una cadena de texto
    var itsNumber = 0; 
    itsNumber = utils.verifyIsNumber(input.search, itsNumber);
    var result = [];

    //Pedimos a la base de datos
    if(itsNumber==1){
        if(input.desactivedClient=='0'){
            result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.PRODUCTS} WHERE  statusProduct = 0 AND
                                              nameProduct LIKE '%${input.search}%' 
                                              OR abbreviationProduct LIKE '%${input.search}%';`);
        }else{
            result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.PRODUCTS} WHERE  statusProduct = 1 AND
                                              nameProduct LIKE '%${input.search}%' 
                                              OR abbreviationProduct LIKE '%${input.search}%';`);
        }
    }else{
        result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.PRODUCTS} WHERE idProduct = ${input.search}`);
    }

    var arrayProduct = [];
    var arrayFamily = [];
    if(result[0]!=undefined){
        //Creamos array de productos
        arrayProduct = await createProductArray(result);

        //Traemos todas las familias que conforman la busqueda
        var query = '';
        var bandNull = 0
        for(var i=0; i < result.length; i++){
            //Checamos si hay productos sin familia
            if(result[i].idProductsFamily!=null){
                if(i==result.length-1){
                    query+= `${result[i].idProductsFamily}`;
                }else{
                    query+= `${result[i].idProductsFamily}, `;
                }
            }else{
                bandNull = 1;
            }
        }

        //Solicitamos las familias
        if(query!=''){
            arrayFamily = await getFamilyById(query);
        }

        //Agregamos una familia de tipo null, en caso de ser necesatio
        if(bandNull==1){
            arrayFamily.push(new ProductFamily(null,'Sin familia'));
        }
        //Agregamos los productos a sus respectivas familias
        arrayFamily = joinProductWithFamily(arrayProduct, arrayFamily);

        return arrayFamily;

    }else{
        arrayFamily[0]=undefined;
        return arrayFamily;
    }
}

//Regresa un producto buscandolo por su id
async function getProductById(idProduct){
    var [ result ] = await env.enviroment(0,`SELECT * FROM ${tableOfDataBase.tables.PRODUCTS}
                                        WHERE idProduct = ${idProduct}`);
    
    var product = undefined
    if(result!=undefined){
        product = createProductObjetc(result)
    }

    return product;
}

//Regresa todos los productos de una familia
async function getProductByFamily(idProductsFamily){
    var result = await env.enviroment(0,`SELECT * FROM ${tableOfDataBase.tables.PRODUCTS}
                                         WHERE idProductsFamily = ${idProductsFamily}`);

    var arrayProduct = createProductArray(result);
    
    return arrayProduct;
}

//Regresa los productos, ya sea los que van a ruta o los que no
async function getProductsInRouteOrNot(input){
    if(input==1){
        var result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.PRODUCTS} 
                                              WHERE productInRoute = 1 
                                              AND statusProduct = 1
                                              ORDER BY positionInRoute ASC;`);
        return createProductArray(result);
    }else{
        var result = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.PRODUCTS} 
                                              WHERE productInRoute = 0 
                                              AND statusProduct = 1
                                              ORDER BY positionInRoute ASC;`);
        var arrayProduct = await createProductArray(result);
        var arrayFamily = await getAllFamily();
        
        //Creamos una nueva familia para los productos que no tienen una asignada
        arrayFamily.push(new ProductFamily(null,
                        'Sin familia'));
        return joinProductWithFamily(arrayProduct, arrayFamily); 
    }
}
//Agrega un nuevo producto
async function addNewProduct(data){
    //Verificamos que sea del tipo de dato que tiene que ser
    var errDetected = 0; 
    errDetected = utils.verifyIsDecimalNumber(data.price, errDetected);
    errDetected = utils.verifyIsNumber(data.stockFabric, errDetected);
    errDetected = utils.verifyIsDecimalNumber(data.costProduct, errDetected);
    
    //Si todo sale bien agregamos a la base de datos
    if(errDetected==1){
        return '"Precio" y "costo" son numeros que pueden llevar decimales, "stock" es un numero entero positivo';
    }else{
        //Verificamos que el nuevo producto que se quiere ingresar no sea un producto que ya este en la base de datos
        var [ detectedDataRepit ] = await env.enviroment(0, `SELECT idProduct FROM ${tableOfDataBase.tables.PRODUCTS}
                                WHERE nameProduct = '${data.nameProduct}' 
                                AND abbreviationProduct = '${data.abbreviationProduct}';`);

        if(detectedDataRepit == undefined){
            //Ingresamos valores por default de ser necesario
            data.abbreviationProduct = utils.defaultValueChar(data.abbreviationProduct);
            data.stockFabric = utils.defaultValueNumber(data.stockFabric);
            data.costProduct = utils.defaultValueNumber(data.costProduct);
        
            var query = '';
            if(data.idProductsFamily=='0'){
                if(data.productInRoute=='0'){
                    query = `'${data.nameProduct}', '${data.abbreviationProduct}', '${data.price}', NULL, 
                    '${data.stockFabric}', '${data.costProduct}', '1', '1', '${await time.getThisMoment()}'`;
                }else{
                    query = `'${data.nameProduct}', '${data.abbreviationProduct}', '${data.price}', NULL, 
                    '${data.stockFabric}', '${data.costProduct}', '1', '0', '${await time.getThisMoment()}'`;
                }
            }else{
                if(data.productInRoute=='0'){
                    query = `'${data.nameProduct}', '${data.abbreviationProduct}', '${data.price}', '${data.idProductsFamily}', 
                    '${data.stockFabric}', '${data.costProduct}', '1', '1', '${await time.getThisMoment()}'`;
                }else{
                    query = `'${data.nameProduct}', '${data.abbreviationProduct}', '${data.price}', '${data.idProductsFamily}', 
                    '${data.stockFabric}', '${data.costProduct}', '1', '0', '${await time.getThisMoment()}'`;
                }
            }

            await env.enviroment(0, `INSERT INTO ${tableOfDataBase.tables.PRODUCTS}
            (nameProduct, abbreviationProduct, price, idProductsFamily, stockFabric, costProduct, statusProduct, productInRoute, lastModification) 
            VALUES 
            (${query})`);

        }else{
            return `El nombre del producto y abreviacion que intentas ponerle al nuevo producto, ya esta ocupado, el id de dicho prodcuto es:  "${detectedDataRepit.idProduct}"`
        }
        return 'El producto se ha guardado exitosamente';
    }
}

//Desactiva un producto
async function desactivateProduct(idProduct){
    var product = new Product(idProduct);
    await product.desactivateProduct();
    return 'Se ha desactivado el producto corretamente';
}

//Desactiva un producto
async function reactivateProduct(idProduct){
    var product = new Product(idProduct);
    await product.reactivateProduct();
    return 'Nota: Se a reactivado el producto corretamente';
}

//Actualiza un producto
async function updateProduct(input){
    var product = await getProductById(input.idProduct);
    //Checamos si quieren poner un nombre que ya tiene otro producto
    var [ detectedDataRepit ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.PRODUCTS} 
    WHERE nameProduct = '${input.nameProduct}' AND abbreviationProduct = '${input.abbreviationProduct}'`);
    
    if(detectedDataRepit==undefined){
        //Verificamos si realmente es diferente los inputs a lo que esta en la db
        product.product.nameProduct = utils.updateInputData(product.product.nameProduct,input.nameProduct);
        product.product.abbreviationProduct = utils.updateInputData(product.product.abbreviationProduct,input.abbreviationProduct);
        product.product.price = utils.updateInputData(product.product.price,input.price);
        product.product.idProductsFamily = utils.updateInputData(product.product.idProductsFamily,input.idProductsFamily);
        product.product.stockFabric = utils.updateInputData(product.product.stockFabric,input.stockFabric);
        product.product.costProduct = utils.updateInputData(product.product.costProduct,input.costProduct);

        //Evaluamos los espacios que tienen que se numeros
        var errDetected = 0;
        errDetected = utils.verifyIsDecimalNumber(product.product.price, errDetected)
        errDetected = utils.verifyIsNumber(product.product.stockFabric, errDetected)
        errDetected = utils.verifyIsDecimalNumber(product.product.costProduct, errDetected)
        
        if(errDetected==1)
            return 'Nota: Se ingreso mal un dato, recuerda que "precio y costo del producto" son numeros que pueden llevar decimales y "stock" es un numero entero'
        
        await product.updateProduct();
        
        //Checamos si el usuario quiere que el producto aparezca en las rutas 
        if(input.productInRoute=='0'){
            await product.productInRouteAfirmative();
        }else{
            await product.productInRouteNegative();
            //Iniciamos a reacomodar los lugares
            var arrayProduct = await getProductsInRouteOrNot(1);
            for(var i=0; i < arrayProduct.length; i++){
                arrayProduct[i].product.positionInRoute = i+1;
                await arrayProduct[i].updatePositionInRoute();
            }
        }

        return 'Nota: El producto se actualizo correctamente';

    }else{
        return `Nota: La combinacion del "nombre del producto" y la "abreviacion del producto" ya existen, pertenece al producto con el ID ${detectedDataRepit.idProduct},
                puedes usar una misma "abreviacion" siempre y cuando el "nombre del producto" sea distinto`;
    }
}

//Funciones privadas del componente  ---
//Del resultado de la base de datos, crea un arreglo del objeto familia de productos
function createFamilyArray(result){
    var arrayFamily = [];
    if(result!=undefined){
        result.forEach(element => {
            arrayFamily.push(new ProductFamily(element.idProductsFamily,
                                                element.nameFamily));
        });
    }

    return arrayFamily;
}

//Del resultado de la base de datos, crea un arreglo del objeto producto
async function createProductArray(result){
    var arrayProduct = [];
    if(result!=undefined){
        result.forEach(element =>{
            element.lastModification = time.convertDate(element.lastModification);

            arrayProduct.push(new Product(element.idProduct,
                                          element.nameProduct,
                                          element.abbreviationProduct,
                                          element.price,
                                          element.idProductsFamily,
                                          element.stockFabric,
                                          element.costProduct,
                                          element.statusProduct,
                                          element.productInRoute,
                                          element.positionInRoute,
                                          element.lastModification));
        });
    }
    return arrayProduct;
}

function createProductObjetc(result){
    return new Product(result.idProduct,
        result.nameProduct,
        result.abbreviationProduct,
        result.price,
        result.idProductsFamily,
        result.stockFabric,
        result.costProduct,
        result.statusProduct,
        result.lastModification)
}
//Une los productos con sus respectivas familias
function joinProductWithFamily(arrayProduct,arrayFamily){
        arrayProduct.forEach(elementProduct => {
            arrayFamily.forEach(elementFamily => {
                if(elementProduct.product.idProductsFamily==elementFamily.familyProduct.idProductsFamily){
                    elementFamily.Product.push(elementProduct);
                }
            });
        });
        return arrayFamily;
}

async function productsInRouteUpdate(input){
    var arrayProduct = await getProductsInRouteOrNot(1);
    var carePosition = []

    //Vaciamos toda la informacion al array de productos y generamos casos de error
    for(var i=0; i < arrayProduct.length; i++){
        var position = input[`${arrayProduct[i].product.idProduct}`];
        if(position==''){
            return 'Cuida que todos los espacios esten llenos';
        }else{
            position = JSON.parse(position)
            arrayProduct[i].product.positionInRoute =  position;
            for(var i=0; i < carePosition.length; i++){
                if(position==carePosition[i])
                return 'Cuida que no se repitan los numeros en los espacios';
            }
            carePosition.push(position)
        }
    }

    //Verificamos que no existan numeros repetidos
    arrayProduct = orderArray(arrayProduct);

    //Iniciamos a acomodar los lugares
    for(var i=0; i < arrayProduct.length; i++){
        arrayProduct[i].product.positionInRoute = i+1;
        await arrayProduct[i].updatePositionInRoute();
    }
    return 'Se actualizaron las posiciones de los productos';
}
//Ordena las posiciones que apareceran en las rutas
function orderArray(array){
    //Si 0 = id, 1 = nombre
        array.sort(function(a, b){
            if (a.product.positionInRoute > b.product.positionInRoute) {
                return 1;
              }
              if (a.product.positionInRoute < b.product.positionInRoute) {
                return -1;
              }
              // a must be equal to b
              return 0;           
        });
    return array
}
module.exports = {
    addNewFamily,
    getAllFamily,
    getFamilyById,
    updateFamily,
    getAllProducts,
    getAllProductsByFamily,
    getProductByIdOrName,
    getProductById,
    getProductByFamily,
    getProductsInRouteOrNot,
    addNewProduct,
    desactivateProduct,
    reactivateProduct,
    updateProduct,
    productsInRouteUpdate
}