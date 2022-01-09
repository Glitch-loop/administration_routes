'use strict'

//Componentes
const env = require('../utils/enviromentDevelopOrDeploy.js')
const tableOfDataBase = require('../utils/tableOfDataBase.js');


class ProductFamily {
    constructor(_idProductsFamily, _nameFamily){
        this.familyProduct = {            
            'idProductsFamily': _idProductsFamily,
            'nameFamily': _nameFamily
        }
        this.Product = [];
    }

    //Actualiza la familia de este objeto
    async updateFamily(){
        env.enviroment(0, `UPDATE ${tableOfDataBase.tables.PRODUCTS_FAMILY}
                            SET nameFamily = '${this.familyProduct.nameFamily}'
                            WHERE idproductsFamily = ${this.familyProduct.idProductsFamily}`)
    }

    //Elimina la familia de este objeto
    async deleteFamily(){
        env.enviroment(0, `DELETE FROM ${tableOfDataBase.tables.PRODUCTS_FAMILY}
                           WHERE idProductsFamily = ${this.familyProduct.idProductsFamily}`);
    }
}

module.exports = ProductFamily;