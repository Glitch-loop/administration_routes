'use strict'
//Importamos componentes
const handlerProducts = require('../handlersOfObjects/handlerProducts.js');

//Familia ---
//Funcion para agregar una nueva familia
async function addNewFamily(nameFamily){
    if(nameFamily!=''){
        return handlerProducts.addNewFamily(nameFamily);
    }else{
        return 'El campo no puede estar vacio'
    }
}

//Devuelve todas las familias que existen en la base de datos
async function getAllFamily(){
    return await handlerProducts.getAllFamily();
}

//Devuelve una familia en especifico
async function getFamilyById(idProductFamily){
    return await handlerProducts.getFamilyById(idProductFamily);    
}

//Actualiza un
async function updateFamily(data){
    return await handlerProducts.updateFamily(data);
}

//Retorna los datos de una familia por id
async function deleteFamily(idProductFamily){
    var [ productFamily ] = await handlerProducts.getFamilyById(idProductFamily);
    var arrayProduct = await handlerProducts.getProductByFamily(idProductFamily);
    
    if(arrayProduct[0]!=undefined){
        for(var i=0; i<arrayProduct.length; i++){
            await arrayProduct[i].nullFamilyProducts();
        }
    }
    
    await productFamily.deleteFamily();
    return `Nota: Se elimino correctamente la familia de productos`;
}

//Producto ---
//Regresa todos los productos
async function getAllProducts(){
    return await handlerProducts.getAllProducts();
}

//Regresa todos los productos por familia
async function getAllProductsByFamily(input){
    return await handlerProducts.getAllProductsByFamily(input);
}

//Regresa los productos, ya sea los que van a ruta o los que no
async function getProductsInRouteOrNot(input){
    return await handlerProducts.getProductsInRouteOrNot(input);
}

//Regresa el resultado de la busqueda de producto ya sea por ID, nombre o abreviacion
async function getProductByIdOrName(input){
    return await handlerProducts.getProductByIdOrName(input);
}

//Agrega un nuevo producto a la base de datos
async function addNewProduct(data){
    if(data.nameProduct!='' && data.price!=''){
        return handlerProducts.addNewProduct(data);
    }else{
        return 'Todos los campos con asteriscos no pueden estar vacios';
    }
}

//Desactiva un producto
async function desactivateProduct(input){
    return await handlerProducts.desactivateProduct(input);
}

//Reactiva un producto
async function reactivateProduct(input){
    return await handlerProducts.reactivateProduct(input);
}

//Actualiza un producto
async function updateProduct(input){
    return await handlerProducts.updateProduct(input);
}

//Ruta para actualizar las posiciones en la que apareceran los productos en ruta
async function productsInRouteUpdate(input){
    return await handlerProducts.productsInRouteUpdate(input);
}

module.exports = {
    addNewFamily,
    getAllFamily,
    getFamilyById,
    updateFamily,
    deleteFamily,
    getAllProducts,
    getAllProductsByFamily,
    getProductsInRouteOrNot,
    getProductByIdOrName,
    addNewProduct,
    desactivateProduct,
    reactivateProduct,
    updateProduct,
    productsInRouteUpdate
}