const ClientComment = require('../components/Objects/ClientComment.js');
const Client = require('../components/Objects/Client.js');

const time = require('../components/utils/date.js');

var clientComment = [];

for(var i=0; i<10; i++){
    clientComment.push(new ClientComment(i,1,"Hola mundo",time.getThisMoment()));
}

var client = [];
for(var i=0; i<10; i++){
    clientComment.push(new Client(1,'An store','000','Independencia', 1, 'Somebody',30.12,34.12,'@gmail',
                                  time.getThisMoment()));
}


module.exports = {
    clientComment,
    client
}