const isDefined = ( item ) => {
    return typeof item !== 'undefined' && item != null
}

const objIsInArray = ( array, obj, key ) => {
    const objKeyValue = obj[ key ]

    return array.find(item => item[ key ] === objKeyValue) != null
}

export default {
    isDefined,
    objIsInArray,
}