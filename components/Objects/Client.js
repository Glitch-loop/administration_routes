'use strict'

//Traemos componentes
const env = require('../utils/enviromentDevelopOrDeploy.js');
const tableOfDataBase = require('../utils/tableOfDataBase.js');
const time = require('../utils/date.js');

//Treamos objetos
const ClientComment = require('../Objects/ClientComment.js');

class Client{
    constructor(_idClient, _nameStore, _street, _adressNumber, _colony, _clientStatus, _latitude,
                _longitude, _nameClient, _contactClient, _lastModification){
        this.client = {
            'idClient': _idClient,
            'nameStore': _nameStore,
            'street': _street,
            'adressNumber': _adressNumber,
            'colony': _colony,
            'clientStatus': _clientStatus,
            'latitude': _latitude,
            'longitude': _longitude,
            'nameClient': _nameClient,
            'contactClient': _contactClient,
            'lastModification': _lastModification
        }

        //Este sera un array para poder guardar los comentarios en caso de necesitarlo
        this.comment = [];
    }

    //Actualiza los datos del cliente
    async updateClient(input){
    //Detectamos que el cliente que se esta intentando guardar no sea uno repetido
    var [ detectedDataRepeated ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.CLIENTS}
    WHERE street = '${input.street}' AND 
    adressNumber = '${input.adressNumber}' AND colony = '${input.colony}'`);

    if(detectedDataRepeated!=undefined)
    return `La "calle", "numero de direccion" y "colonia" del cliente que se esta intentando agregar, coincide con el de otro cuyo ID es "${detectedDataRepeated.idClient}"`

    if(input.longitude!=0 && input.latitude!=0)
        [ detectedDataRepeated ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.CLIENTS}
        WHERE latitude = '${input.latitude}' AND longitude = '${input.longitude}'`);

        if(detectedDataRepeated!=undefined)
            return `Las "coordenadas" del cliente que se esta intentando agregar, coinciden con el de otro cuyo ID es "${detectedDataRepeated.idClient}"`;

        await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.CLIENTS} SET 
        nameStore='${this.client.nameStore}', street='${this.client.street}', 
        adressNumber='${this.client.adressNumber}', colony='${this.client.colony}', 
        latitude='${this.client.latitude}', longitude='${this.client.longitude}', 
        nameClient='${this.client.nameClient}', 
        contactClient='${this.client.contactClient}', 
        lastModification='${await time.getThisMoment()}'
        WHERE idClient = '${this.client.idClient}'`);

        return 'Se actualizo el cliente correctamente';
    }

    //Cambia statusClient a 0
    async desactivateClient(){
        this.client.clientStatus = 0;
        await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.CLIENTS} SET  
        clientStatus='${this.client.clientStatus}', 
        lastModification='${await time.getThisMoment()}'
        WHERE idClient = '${this.client.idClient}'`);
    }

    //Cambia statusClient a 1
    async reactiveClient(){
        this.client.clientStatus = 1;
        await env.enviroment(0, `UPDATE ${tableOfDataBase.tables.CLIENTS} SET  
        clientStatus='${this.client.clientStatus}', 
        lastModification='${await time.getThisMoment()}'
        WHERE idClient = '${this.client.idClient}'`);
    }

    //Este metodo obtiene de la base de datos, todos los comentarios de este cliente
    async getCommentOfDataBase(){
        var result = await env.enviroment(0,`SELECT * FROM ${tableOfDataBase.tables.CLIENTS_COMMENTS} 
                                             WHERE idClient = ${this.client.idClient}`);
        if(result==undefined){
            var arrayComment = 0;
        }else{
            arrayComment = []; 
            result.forEach(element => {
                arrayComment.push(new ClientComment(element.idComment,
                                                    element.idClient,
                                                    element.comment,
                                                    element.dateComment));
            });
        }
        this.comment = arrayComment;
    }

    //Adhiere un nuevo comentario a este cliente 
    async addNewComment(_comment){
        await env.enviroment(0, `INSERT INTO ${tableOfDataBase.tables.CLIENTS_COMMENTS} 
                                 (idClient, comment, dateComment) VALUES 
                                 ('${this.client.idClient}','${_comment}','${await time.getThisMoment()}')`);
    }

    //Retorna la posicion de un comentario especifico de este cliente
    getComment(_idComment, _comment){
        for(var i=0; i<this.comment.length; i++){
            if(this.comment[i].idComment == _idComment || this.comment[i].comment == _comment){
                return i;
            }
        }
    }
}

module.exports = Client;