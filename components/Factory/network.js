'use strict'
//Importamos librerias
const express =  require('express');

//Importamos componentes
const controller = require('./index.js');

//Inicializamos
const router = express.Router();

//Menu
router.get('/', fabricMenu);

//Familia
router.get('/family', addNewFamilyView);
router.post('/family', addNewFamily);
router.get('/family/modify', modifyFamilyView);
router.get('/family/modify/update/:id', updateFamilyView);
router.post('/family/modify/update', updateFamily);
router.get('/family/modify/delete/:id', deleteFamily);
 
//Productos
router.get('/products', productsView);
router.post('/products/search', productsViewSearch);
router.get('/products/AddNewProduct', addNewProductView);
router.post('/products/AddNewProduct', addNewProduct);
router.get('/products/desactiveProduct/:idProduct', desactiveProduct);
router.get('/products/reactiveProduct/:idProduct', reactiveProduct);
router.get('/products/modify/:idProduct', updateProductView);
router.post('/products/modify/product', updateProduct);
router.get('/products/productsInRoute', productsInRoute);
router.post('/products/productsInRoute', productsInRouteUpdate);

//Varaibles globales
var note = undefined;
var buttonBox = 0;
var desactivateProduct = undefined;
var message = undefined;
//Menu ---
function fabricMenu(req, res){
    message = undefined; //Reinicio de variable
    res.render('factory/factoryMenu');
}

//Familia ---
//Renderiza el formulario para agregar a una nueva familia
function addNewFamilyView(req, res){
    res.render('factory/family/addFamilyView',{
        message: undefined
    });
}

//Ruta para agregar a una nueva familia
async function addNewFamily(req, res){
    var message = await controller.addNewFamily(req.body.nameProductFamily);
    
    res.render('factory/family/addFamilyView',{
        message: message
    });
}

//Ruta para listar las familias para modificar o eliminar
async function modifyFamilyView(req, res){
    var arrayFamily = await controller.getAllFamily();

    res.render('factory/family/modifyFamilyView',{
        arrayFamily,
        message: undefined
    });
}

//Ruta para imprimir el menu para actualizar una ruta
async function updateFamilyView(req, res){
    var [ productFamily ] = await controller.getFamilyById(req.params.id);

    res.render('factory/family/updateFamilyView',{
        productFamily
    });
}

//Ruta para modificar una ruta
async function updateFamily(req, res){
    var message = await controller.updateFamily(req.body);
    
    var arrayFamily = await controller.getAllFamily();

    res.render('factory/family/modifyFamilyView',{
        arrayFamily,
        message
    });
}

//Ruta para eliminar una ruta
async function deleteFamily(req, res){
    var message = await controller.deleteFamily(req.params.id);

    var arrayFamily = await controller.getAllFamily();
    
    res.render('factory/family/modifyFamilyView',{
        arrayFamily,
        message
    });
}

//Productos ---
//Renderiza el "menu" de productos
async function productsView(req, res){
    message = undefined; //Reinicio de variable
    var arrayFamily = await controller.getAllProductsByFamily(desactivateProduct);
    if(arrayFamily[0]==undefined)
        var message = 'Aun no se ha agregado productos al sistema';
   

    res.render('factory/products/productsView',{
        arrayFamily,
        message,
        note,
        recentSearch: 'Busqueda reciente:',
        buttonBox
    });
}

//Renderiza el "menu" de productos pero aplicando ciertos filtros
async function productsViewSearch(req, res){

    note = undefined;

    if(req.body.search!='' && req.body.search!=' '){
        var arrayFamily = await controller.getProductByIdOrName(req.body);
        var recentSearch = `Busqueda reciente: ${req.body.search}`;
    }else{
        var arrayFamily = await controller.getAllProductsByFamily(req.body.desactiveProducts);
        desactivateProduct = req.body.desactiveProducts;
        var recentSearch = 'Busqueda reciente: ';
    }

    if(req.body.desactiveProducts=='0'){
        buttonBox=1;
    }else{
        buttonBox=0;
    }

    if(arrayFamily[0]==undefined)
    var message = 'No se encontro ningun producto con esos parametros';


    res.render('factory/products/productsView',{
        arrayFamily,
        message,
        note,
        recentSearch,
        buttonBox
    });
}

//Renderiza la vista para agregar un nuevo producto
async function addNewProductView(req, res){
    var family = await controller.getAllFamily();
    res.render('factory/products/addProductView',{
        message: undefined,
        family: family
    });
}

//Agrega el producto y redirige a la vista para agregar un nuevo producto
async function addNewProduct(req, res){
    var message = await controller.addNewProduct(req.body);
    var family = await controller.getAllFamily();
    
    res.render('factory/products/addProductView',{
        message: message,
        family: family
    });
}

//Ruta para desactivar un producto
async function desactiveProduct(req, res){
    note = await controller.desactivateProduct(req.params.idProduct);

    productsView(req, res);
}

//Ruta para reactivar un producto
async function reactiveProduct(req, res){
    note = await controller.reactivateProduct(req.params.idProduct);

    productsView(req, res);
}

//Ruta para modificar un producto
async function updateProductView(req, res){
    var idProduct={
        'search': await JSON.parse(req.params.idProduct) 
    }

    var productFamily = await controller.getAllFamily();
    var product = await controller.getProductByIdOrName(idProduct);

    res.render('factory/products/modifyProductView', {
        productFamily,
        product,
        message: ''
    });
}

//Ruta para actualizar un producto
async function updateProduct(req, res){
    note = await controller.updateProduct(req.body);
    if(note=='Nota: El producto se actualizo correctamente'){
        productsView(req, res);
    }else{
        var idProduct={
            'search': await JSON.parse(req.body.idProduct) 
        }
    
        var productFamily = await controller.getAllFamily();
        var product = await controller.getProductByIdOrName(idProduct);
    
        res.render('factory/products/modifyProductView', {
            productFamily,
            product,
            message: undefined,
            note
        });
    }
}

//Renderiza la vista de los productos que iran en la ruta
async function productsInRoute(req, res){
    var products = await controller.getProductsInRouteOrNot(1);

    res.render('factory/products/modifyProductsInRoute',{
        products,
        message 
    });
}

//Ruta para actualizar las posiciones en la que apareceran los productos en ruta
async function productsInRouteUpdate(req, res){
    message = await controller.productsInRouteUpdate(req.body);

    productsInRoute(req, res);
}
module.exports = router;