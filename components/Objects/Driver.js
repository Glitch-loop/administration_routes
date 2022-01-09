'use strict'

//Componentes
const env = require('../utils/enviromentDevelopOrDeploy.js');
const tableOfDataBase = require('../utils/tableOfDataBase.js');
const time = require('../utils/date.js');

class Driver{
    constructor(_idDriver, _nameDriver, _hiringDay, _adress, _phoneNumber, _email, _comission, 
                _salary, _driverStatus, _lastModification){
                    this.driver = {
                        'idDriver': _idDriver,
                        'nameDriver': _nameDriver,
                        'hiringDay': _hiringDay,
                        'adress': _adress,
                        'phoneNumber': _phoneNumber,
                        'email': _email,
                        'comission': _comission,
                        'salary': _salary,
                        'driverStatus': _driverStatus,
                        'lastModification': _lastModification
                    }
    }
    
    async updateDriver(input){
        //Detectamos que el conductor que se esta intentando guardar no sea uno repetido
        var [ detectedDataRepeated ] = await env.enviroment(0, `SELECT * FROM ${tableOfDataBase.tables.DRIVERS}
        WHERE nameDriver = '${input.nameDriver}' OR
        adress = '${input.adress}' OR phoneNumber = '${input.phoneNumber}'
        AND NOT idDriver = ${this.driver.idDriver}`);

        if(detectedDataRepeated==undefined){
            //Actualizamos dato
            env.enviroment(0,`UPDATE ${tableOfDataBase.tables.DRIVERS} SET
                            nameDriver = '${this.driver.nameDriver}',
                            hiringDay = '${await time.convertDate(this.driver.hiringDay)}',
                            adress = '${this.driver.adress}',
                            phoneNumber = '${this.driver.phoneNumber}',
                            email = '${this.driver.email}',
                            comission = '${this.driver.comission}',
                            salary = '${this.driver.salary}',
                            lastModification = '${await time.getThisMoment()}'
                            WHERE idDriver = '${this.driver.idDriver}'`);

            return 'Se guardaron los datos correctamente';
        }else{
            return `Algunos datos coinciden con los de otro conductor, cuyo ID es ${detectedDataRepeated.idDriver}`;
        }
    } 

    async desactiveDriver(){
        this.driver.driverStatus = 0;
        env.enviroment(0,`UPDATE ${tableOfDataBase.tables.DRIVERS} SET
        driverStatus='${this.driver.driverStatus}',
        lastModification='${await time.getThisMoment()}'
        WHERE idDriver = ${this.driver.idDriver}`)

        
    }

    async reactiveDriver(){
        this.driver.driverStatus = 1;
        env.enviroment(0,`UPDATE ${tableOfDataBase.tables.DRIVERS} SET
        driverStatus='${this.driver.driverStatus}',
        lastModification='${await time.getThisMoment()}'
        WHERE idDriver = ${this.driver.idDriver}`)
    }
}

module.exports = Driver;