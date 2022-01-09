const connection = require('./conectionStore.js');

function querys(query){
    return new Promise((resolve, reject) => {
        connection.query(`${query}`, (err, result) => {
            if(err){
                console.log(`[ERROR] ${err}`); 
                return reject;
            }else {
                return resolve(result);
            }  
        })
    })
}

module.exports = {
    querys
};