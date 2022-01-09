'use strict'

//Componentes
const env = require('../utils/enviromentDevelopOrDeploy.js')
const tableOfDataBase = require('../utils/tableOfDataBase.js');
const time = require('../utils/date.js');

class Product{
    constructor(_idProduct, _nameProduct, _abbreviationProduct, _price, _idProductsFamily, _stockFabric,
                _costProduct, _statusProduct, _productInRoute, _positionInRoute, _lastModification){
        this.product = {
            'idProduct': _idProduct, 
            'nameProduct': _nameProduct, 
            'abbreviationProduct': _abbreviationProduct, 
            'price': _price, 
            'idProductsFamily': _idProductsFamily, 
            'stockFabric': _stockFabric,
            'costProduct': _costProduct,
            'statusProduct': _statusProduct, 
            'productInRoute':_productInRoute,
            'positionInRoute': _positionInRoute, 
            'lastModification': _lastModification
        }
    }

        //Actualiza los datos del producto
        async updateProduct(){
            if(this.product.idProductsFamily==null){
                await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.PRODUCTS} SET 
                nameProduct='${this.product.nameProduct}', abbreviationProduct='${this.product.abbreviationProduct}', 
                price='${this.product.price}', idProductsFamily=NULL, 
                stockFabric='${this.product.stockFabric}', costProduct='${this.product.costProduct}',  
                lastModification='${await time.getThisMoment()}'
                WHERE idProduct = '${this.product.idProduct}'`);                
            }else{
                await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.PRODUCTS} SET 
                nameProduct='${this.product.nameProduct}', abbreviationProduct='${this.product.abbreviationProduct}', 
                price='${this.product.price}', idProductsFamily='${this.product.idProductsFamily}', 
                stockFabric='${this.product.stockFabric}', costProduct='${this.product.costProduct}',  
                lastModification='${await time.getThisMoment()}'
                WHERE idProduct = '${this.product.idProduct}'`);                
            }
        }
    
        //Cambia statusClient a 0
        async desactivateProduct(){
            await this.productInRouteNegative();
            this.product.statusProduct = 0;
            await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.PRODUCTS} SET  
            statusProduct='${this.product.statusProduct}', 
            lastModification='${await time.getThisMoment()}'
            WHERE idProduct = '${this.product.idProduct}'`);
        }
    
        //Cambia statusClient a 1
        async reactivateProduct(){
            this.product.statusProduct = 1;
            await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.PRODUCTS} SET  
            statusProduct='${this.product.statusProduct}', 
            lastModification='${await time.getThisMoment()}'
            WHERE idProduct = '${this.product.idProduct}'`);
        }

        //Cambia a null la familia de productos a la que pertenece 
        async nullFamilyProducts(){
            await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.PRODUCTS} SET  
            idProductsFamily=NULL, 
            lastModification='${await time.getThisMoment()}'
            WHERE idProduct = '${this.product.idProduct}'`);
        }

        //Activa aparicion en ruta
        async productInRouteAfirmative(){
            await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.PRODUCTS} SET  
            productInRoute='1', 
            lastModification='${await time.getThisMoment()}'
            WHERE idProduct = '${this.product.idProduct}'`);
        }

        //Desactiva aparicion en ruta
        async productInRouteNegative(){
            await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.PRODUCTS} SET  
            productInRoute='0', positionInRoute=NULL, 
            lastModification='${await time.getThisMoment()}'
            WHERE idProduct = '${this.product.idProduct}'`);

        }

        //Actualiza la posicion en ruta
        async updatePositionInRoute(){
            await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.PRODUCTS} SET  
            positionInRoute=${this.product.positionInRoute}, 
            lastModification='${await time.getThisMoment()}'
            WHERE idProduct = '${this.product.idProduct}'`);

        }
}


module.exports = Product; 