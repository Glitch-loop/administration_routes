'use strict'

//Componentes
const env = require('../utils/enviromentDevelopOrDeploy.js')
const tableOfDataBase = require('../utils/tableOfDataBase.js');

class PositionInRoute{
    constructor(_idPosition, _idRoute, _idClient, _idDay, _positionRouteDay, _penalty){
        this.position = {
            'idPosition': _idPosition,
            'idRoute': _idRoute,
            'idClient':  _idClient,
            'idDay': _idDay,
            'positionRouteDay': _positionRouteDay,        
            'penalty': _penalty        
        }
    }

    async updatePosition(){
        await env.enviroment(0,`UPDATE ${tableOfDataBase.tables.ROUTES_ORGANIZATION} SET
                                idRoute = '${this.position.idRoute}', 
                                idClient = '${this.position.idClient}', 
                                idDay = '${this.position.idDay}', 
                                positionRouteDay = '${this.position.positionRouteDay}',
                                penalty = '${this.position.penalty}'
                                WHERE idPosition = ${this.position.idPosition}`);
    }

    async updatePositionNull(){
        await env.enviroment(0,`UPDATE ${tableOfDataBase.tables.ROUTES_ORGANIZATION} SET
        idRoute = '${this.position.idRoute}', 
        idClient = '${this.position.idClient}', 
        idDay = '${this.position.idDay}', 
        positionRouteDay = NULL
        WHERE idPosition = ${this.position.idPosition}`);
    }

    async deletePosition(){
        await env.enviroment(0,`DELETE FROM ${tableOfDataBase.tables.ROUTES_ORGANIZATION}
                                WHERE idPositon = ${this.position.idPosition}`);
    }
}
module.exports = PositionInRoute