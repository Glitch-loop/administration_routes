'use strict'

//Componentes
const env = require('../utils/enviromentDevelopOrDeploy.js');
const tableOfDataBase = require('../utils/tableOfDataBase.js');
const time = require('../utils/date.js');
const PositionInRoute = require('./PositionInRoute.js');

class Route{
    constructor(_idRoute, _idDrive, _nameDriver, _nameRoute, _moneyBox, _routeStatus, _lastModification){
        this.route = {
            'idRoute': _idRoute,
            'idDriver': _idDrive,
            'nameDriver': _nameDriver,
            'nameRoute': _nameRoute,
            'moneyBox': _moneyBox,
            'routeStatus': _routeStatus,
            'lastModification': _lastModification

        }
        /*Este array contendra todas las posiciones que componen la ruta, tiene 7 posiciones indicando
        los dias de la semana, comenzando con lunes*/ 
        this.arrayPositionInRoute = new Array(7);
        for(var i=0; i<this.arrayPositionInRoute.length; i++){
            this.arrayPositionInRoute[i] = new Array();
        }
    }

    //Actualiza los datos de la ruta
    async updateRoute(input){
        //Detectamos que el conductor que se esta intentando guardar no sea uno repetido
        var [ detectedDataRepeated ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.ROUTES}
        WHERE nameRoute = '${input.nameRoute}'
        AND NOT idRoute = '${this.route.idRoute}'`);
        
        if(detectedDataRepeated==undefined){
            await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.ROUTES} SET
                                     idDriver='${this.route.idDriver}', nameRoute='${this.route.nameRoute}',
                                     moneyBox='${this.route.moneyBox}',
                                     lastModification='${await time.getThisMoment()}'
                                     WHERE idRoute=${this.route.idRoute}`);

            return 'Se actualizo correctamente la ruta';
        }else{
            return `El nombre que se esta intentando poner a la ruta, coincide con el de otra ruta cuyo ID es ${detectedDataRepeated.idRoute}`;
        }
    }

    //Cambia statusRoute a 0
    async desactiveRoute(){
        this.route.routeStatus = 0;
        await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.ROUTES} SET  
        routeStatus='${this.route.routeStatus}', 
        lastModification='${await time.getThisMoment()}'
        WHERE idRoute = '${this.route.idRoute}'`);
    }

    //Cambia statusRoute a 1
    async reactiveRoute(){
        this.route.routeStatus = 1;
        await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.ROUTES} SET  
        routeStatus='${this.route.routeStatus}', 
        lastModification='${await time.getThisMoment()}'
        WHERE idRoute = '${this.route.idRoute}'`);
    }   

    //Remueve el conductor que actualmente esta en la ruta
    async removeDriver(){
        await env.enviroment(0,`UPDATE ${tableOfDataBase.tables.ROUTES}
                                SET idDriver = NULL
                                WHERE  idRoute = ${this.route.idRoute}`);
    }

    //Obtenemos todas la posiciones de todos los dias de esta ruta
    async getAllPositionRoute(){
        var result = 0;
        for(var i=0; i<7; i++){
            result = await env.enviroment(0,`SELECT * FROM ${tableOfDataBase.tables.ROUTES_ORGANIZATION}
                                             WHERE idRoute = ${this.route.idRoute} AND 
                                             idDay = ${i+1} ORDER BY positionRouteDay ASC`);
                if(result[0]!=undefined){
                result.forEach(element => {
                    this.arrayPositionInRoute[i].push(new PositionInRoute(element.idPosition,
                                                                          element.idRoute,
                                                                          element.idClient,
                                                                          element.idDay,
                                                                          element.positionRouteDay,
                                                                          element.penalty))
                });
            } 
        }
    }
    
    //Regresa un dia en especifico de ruta, tomando como parametros ruta y dia
    async getARoutePosition(idDay){
        var routePosition = [];
        var result = await env.enviroment(0, `SELECT * FROM 
                                        ${tableOfDataBase.tables.ROUTES_ORGANIZATION}
                                        WHERE idRoute = ${this.route.idRoute} 
                                        AND idDay = ${idDay}
                                        ORDER BY ISNULL(positionRouteDay), positionRouteDay ASC`);
        if(result!=undefined){
            result.forEach(element => {
                routePosition.push(new PositionInRoute(element.idPosition,
                                                       element.idRoute,
                                                       element.idClient,
                                                       element.idDay,
                                                       element.positionRouteDay,
                                                       element.penalty));
            });
            return routePosition;
        }else{
            return undefined;
        }
    }

    //Devolvera las posiciones del dia que el usuario eliga
    async getMultipleRoutePosition(idDay){
        this.arrayPositionInRoute = [];
        for(var i=0; i<idDay.length; i++){
            var result = await env.enviroment(0,`SELECT A.*, B.nameStore, B.street, B.adressNumber, B.colony, B.latitude, B.longitude  
            FROM ${tableOfDataBase.tables.ROUTES_ORGANIZATION} AS A
            JOIN ${tableOfDataBase.tables.CLIENTS} AS B
            ON A.idClient = B.idClient
            WHERE idRoute = ${this.route.idRoute} AND idDay IN(${idDay[i]})
            ORDER BY idDay, positionRouteDay`);
            var data = {
                'idDay': idDay[i]-1,
                'position': result
            }
            this.arrayPositionInRoute.push(data);
        } 
    }

    //Retorna una posicion de una ruta por su ID
    async getPositionRouteByIdPosition(idPosition){
        var [ result ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.ROUTES_ORGANIZATION}
                                              WHERE idPosition = ${idPosition}`);

        return new PositionInRoute(result.idPosition, result.idRoute, 
                                    result.idClient, result.idDay, result.positionRouteDay);
    }

    //Agrega una nueva posicion a una ruta y dia
    async addNewPosition(input){
        //Agregamos la nueva posicion
        await env.enviroment(0,`INSERT INTO ${tableOfDataBase.tables.ROUTES_ORGANIZATION}
        (idRoute, idClient, idDay) 
        VALUES ('${this.route.idRoute}', '${input.client}', '${input.day}')`);
        
        //Traemos la ruta y el dia donde se insterto la posicion
        var routePosition = await this.getARoutePosition(input.day,this.route.idRoute);
        
        //Ordenamos de forma que siempre sea secuencial 1, 2, 3, ... 
        routePosition = orderArrayPositionInRoute(routePosition, input.position);
        
        //Actualizamos 
            for(var i=0; i< routePosition.length; i++){
                routePosition[i].updatePosition();                
            }
    }

    //Actualiza una posicion en especifico (por su id)
    async updatePositionRoute(input){
        var lastPosition = await this.getPositionRouteByIdPosition(input.idPosition);

        //Creamos un objeto (PositionInRoute) con los datos de la "posicion" que se vera afectada
        var position = new PositionInRoute(input.idPosition, input.idRoute, input.idClient, input.idDay, input.position);

        //Actualizamos para que sea null
        await position.updatePositionNull();

        //Traemos la ruta y el dia donde se insterto la posicion
        var routePosition = await this.getARoutePosition(input.idDay,this.route.idRoute);
        
        //Ordenamos de forma que siempre sea secuencial 1, 2, 3, ... 
        routePosition = orderArrayPositionInRoute(routePosition, input.position);
        
        //Actualizamos 
        for(var i=0; i< routePosition.length; i++){
            routePosition[i].updatePosition();                
        }

        //En caso de que se haya cambiado de dia o de ruta
        if((lastPosition.position.idRoute!=position.position.idRoute) || (lastPosition.position.idDay!=position.position.idDay)){
            //Traemos la ruta y el dia de donde se movio la posicion
            var routePositionAfected = await this.getARoutePosition(lastPosition.position.idDay,lastPosition.position.idRoute);

            //Si hay datos, reacomodamos la ruta que fue afectada
            if(routePositionAfected!=undefined){
                for(var i=0; i<routePositionAfected.length; i++){
                    routePositionAfected[i].position.positionRouteDay = i+1;
                    await routePositionAfected[i].updatePosition();
                }
            }
        }
    }

    //Elimina una posicion en especifico (por su id)
    async deletePosition(input){
        //Eliminamos la posicion
        await env.enviroment(0, `DELETE FROM ${tableOfDataBase.tables.ROUTES_ORGANIZATION}
                            WHERE idPosition = ${input.idPosition}`);
        
        //Traemos la ruta afectada
        var routePositionAfected = await this.getARoutePosition(input.idDay,input.idRoute);

        //Si hay datos, reacomodamos la ruta que fue afectada
        if(routePositionAfected!=undefined){
            for(var i=0; i<routePositionAfected.length; i++){
                routePositionAfected[i].position.positionRouteDay = i+1;
                await routePositionAfected[i].updatePosition();
            }
        }
    }
}

    //Ordena un array de posiciones de tal forma que sea una serie secuencial 
    function orderArrayPositionInRoute(arrayPosition, position){
        //Si la posicion esta vacia o la posicion es mayor al arreglo, la nueva posicion
        //estara en ultimo lugar
        if(position=='' || position>=arrayPosition.length){
            for(var i=0; i < arrayPosition.length; i++){
                arrayPosition[i].position.positionRouteDay = i+1;
            }
        }else{
        //En caso de que exsita una posicion, se tendra que recorrer todo el arreglo
            var cont=1; 
            for(var i=0; i < arrayPosition.length; i++){
                if(position==i+1){
                    //La nueva posicion que queremos agregar
                    arrayPosition[arrayPosition.length-1].position.positionRouteDay = i+1;
                    //Aumentamos el contador para que se recorra de 2 en 2
                    cont=2;
                    //Recorremos la antigua posicicion
                    arrayPosition[i].position.positionRouteDay = i+cont;
                }else if(i<arrayPosition.length-1){
                    arrayPosition[i].position.positionRouteDay = i+cont;
                }
            }
        }
        return arrayPosition;     
    }

module.exports = Route