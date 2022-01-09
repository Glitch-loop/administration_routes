'use strict'

//Verifica que un dato nuevo sea "realmente" diferente a un dato anterior
function updateInputData(before, after){
    if((before != after) && (after != undefined) && (after != '') && (after != ' ')){
        return after;
    }else{
        return before;
    }
}

function verifyIsCoordinate(input, errDetected){
    if(errDetected!=0)
        return 1;
    
    for(var i=0; i<input.length; i++){
        var character = '';
        character = input[i].charCodeAt(0);        
        //Checamos en caso de que no sea un "." o "-"
        if(character!=45 && character!=46){
            //Se verifica que sean numeros codigo ascii(48-57)
            if(character<47 || character>58)
                return 1;
        }
    } 

    return 0;
}

function verifyIsDecimalNumber(input, errDetected){
    if(errDetected!=0)
        return 1;
    
    for(var i=0; i < input.length; i++){
        var character = ''; 
        character = input[i].charCodeAt(0);
        //Checamos en caso de que no sea un "." o "-"
        if(character!=46){
            //Se verifica que sean numeros codigo ascii(48-57)
            if(character<47 || character>58)
                return 1;
        }
    } 

    return 0;
}

function verifyIsNumber(input, errDetected){
    if(errDetected!=0)
        return 1;

    for(var i=0; i<input.length; i++){
        var character = '';
        character = input[i].charCodeAt(0);        
        //Checamos en caso de que no sea un "." o "-"
            //Se verifica que sean numeros codigo ascii(48-57)
            if(character<47 || character>58)
                return 1;
    } 

    return 0;
}

function defaultValueNumber(input){
    if(input==''){
        return 0;
    }else{
        return input;
    }
}
function defaultValueChar(input){
    if(input==''){
        return '';
    }else{
        return input;
    }
}

//Quita espacios y ,
function cleanCoordinate(input){
    var number = '';
    for(var i=0; i<input.length; i++){
        if(input[i]!=',' && input[i]!=' '){
            number+=input[i];
        }
    } 
    return number;
}

module.exports = {
    updateInputData,
    verifyIsCoordinate,
    verifyIsDecimalNumber,
    verifyIsNumber,
    defaultValueNumber,
    defaultValueChar,
    cleanCoordinate
}