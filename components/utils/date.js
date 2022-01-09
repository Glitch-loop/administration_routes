'use strict'

//Importamos librerias
const moment = require('moment');
//moment.locale('es-mx');

//Devuelve el momento "actual (dia y hora)" con un formato especifico
function getThisMoment(){
    var time =  moment().format('YYYY-MM-DD hh:mm:ss');
    return time;
}

//Recibe como parametro una fecha en formato de texto y la convierte a fecha y hora
function convertDate(input){
    var time =  moment(input).format('YYYY-MM-DD hh:mm:ss');
    
    return time;
}

//Recibe como parametro una fecha en formato de texto y la convierte a fecha
function convertToOnlyDate(input){
    return moment(input).format('YYYY-MM-DD');
}

//Devuelve el sistema de dias (su id y el nombre del dia)
function daysOfWeek(){
    var days =
    [
        {
            'id': 1,
            'day': 'Lunes'
        },
        {
            'id': 2,
            'day': 'Martes'
        },
        {
            'id': 3,
            'day': 'Miercoles'
        },
        {
            'id': 4,
            'day': 'Jueves'
        },
        {
            'id': 5,
            'day': 'Viernes'
        },
        {
            'id': 6,
            'day': 'Sabado'
        },
        {
            'id': 7,
            'day': 'Domingo'
        },
    ]

    return days
}

//Devuelve un dia especifico del sistema
function getSpecifyDayOfWeek(idDay){
    var systemDay = daysOfWeek();
    for(var i=0; i < systemDay.length; i++){
        if(idDay==systemDay[i].id)
            return systemDay[i];
    }
}
//Retorna el nombre del dia, pasamos como parametro una fecha
function getTheDayOfDate(input){
    moment.locale('es-mx');
    var day =  moment(input).format('dddd');
    var arrayDaysOfWeek = daysOfWeek();
    for(var i=0; i < arrayDaysOfWeek.length; i++){
        if(arrayDaysOfWeek[i].day==day){
            return arrayDaysOfWeek[i];
        }
    }
}


module.exports = {
    getThisMoment,
    convertDate,
    convertToOnlyDate,
    daysOfWeek,
    getSpecifyDayOfWeek,
    getTheDayOfDate
}