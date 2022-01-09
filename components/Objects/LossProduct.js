'use strict'

//Componentes
const env = require('../utils/enviromentDevelopOrDeploy.js');
const tableOfDataBase = require('../utils/tableOfDataBase.js');
const time = require('../utils/date.js');

class LossProduct {
    constructor(_idLoss, _idRoute, _idDay, _idClient, _dateLoss, _idProduct, _quantityProduct, _priceProduct){
        this.lossProduct = {
            'idLoss': _idLoss,
            'idRoute': _idRoute,
            'idDay': _idDay,
            'idClient': _idClient,
            'dateLoss': _dateLoss,
            'idProduct': _idProduct,
            'quantityProduct': _quantityProduct,
            'priceProduct': _priceProduct
        }
    }

    //Agrega una nueva merma a la DB
    async addNewLossProduct(){
        await env.enviroment(0,`INSERT INTO ${tableOfDataBase.tables.LOSS_BY_PRODUCT} 
        (idRoute, idDay, idClient, dateLoss, idProduct, quantityProduct, priceProduct) 
        VALUES 
        ('${this.lossProduct.idRoute}', 
        '${this.lossProduct.idDay}', 
        '${this.lossProduct.idClient}', 
        '${this.lossProduct.dateLoss}', 
        '${this.lossProduct.idProduct}', 
        '${this.lossProduct.quantityProduct}', 
        '${this.lossProduct.priceProduct}');`);
    }
}

module.exports = LossProduct;