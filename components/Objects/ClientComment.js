'use strict'

//Componentes
const env = require('../utils/enviromentDevelopOrDeploy.js')
const tableOfDataBase = require('../utils/tableOfDataBase.js');

class ClientComment {
    constructor(_idComment=0, _idClient=0, _comment=undefined, _dateComment=undefined){
        this.comment = {
            'idComment': _idComment,
            'idClient': _idClient,
            'comment': _comment,
            'dateComment': _dateComment
        }
    }

    //Actualiza este comentario
    async updateComment(_comment){
        await env.enviroment(0,`UPDATE ${tableOfDataBase.tables.CLIENTS_COMMENTS} SET 
                                comment='${_comment}' WHERE idComment = ${this.comment.idComment}`)
    }

    //Elimina este comentario
    async deleteComment(){
        await env.enviroment(0,`DELETE FROM ${tableOfDataBase.tables.CLIENTS_COMMENTS} 
                                WHERE idComment = ${this.comment.idComment}`)
    }
}

module.exports = ClientComment;