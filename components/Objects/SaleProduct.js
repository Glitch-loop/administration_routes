'use strict'

//Componentes
const env = require('../utils/enviromentDevelopOrDeploy.js');
const tableOfDataBase = require('../utils/tableOfDataBase.js');
const time = require('../utils/date.js');

class SaleProduct {
    constructor(_idSales, _idRoute, _idDay, _idClient, _dateSale, _idProduct, _quantityProduct, _priceProduct){
        this.saleProduct = {
            'idSales': _idSales,
            'idRoute': _idRoute,
            'idDay': _idDay,
            'idClient': _idClient,
            'dateSale': _dateSale,
            'idProduct': _idProduct,
            'quantityProduct': _quantityProduct,
            'priceProduct': _priceProduct
        }
    }

    //Agrega una nueva venta a la DB
    async addNewSaleProduct(){
        await env.enviroment(0,`INSERT INTO ${tableOfDataBase.tables.SALES_BY_PRODUCT} 
        (idRoute, idDay, idClient, dateSale, idProduct, quantityProduct, priceProduct) 
        VALUES 
        ('${this.saleProduct.idRoute}', 
        '${this.saleProduct.idDay}', 
        '${this.saleProduct.idClient}', 
        '${this.saleProduct.dateSale}', 
        '${this.saleProduct.idProduct}', 
        '${this.saleProduct.quantityProduct}', 
        '${this.saleProduct.priceProduct}');`);
    } 
}

module.exports = SaleProduct;