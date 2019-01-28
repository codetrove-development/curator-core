const cloneProperties = (obj, properties, deep = true, newObj = {}) => {
    if ( !deep ) {
        newObj = { ...obj }
        return newObj
    }
        

    for (let prop in obj) {
        if (properties.indexOf( prop ) > -1) {

            if (isPureObject( obj[properties] ))
                cloneProperties(obj, properties, deep, newObj)

            else
                newObj[prop] = obj[prop]
        }
    }

    return newObj
}

const isPureObject = ( item ) => {
    return Object.prototype.toString.call( item ) === '[object Object]'
}

const setDefaults = (options = {}, defaults = {}) => {
    for (let optionName in defaults) {
        if (!options.hasOwnProperty(optionName)) {
            options[optionName] = defaults[optionName]
        }
    }
    return options
}

const getRelativePosition = (element, container) => {
    const containerPosition = _absolutePosition( container )
    const elementPosition = _absolutePosition( element )

    return {
        top: elementPosition.top - containerPosition.top,
        left: elementPosition.left - containerPosition.left
    }
}

const parseBoolean = ( val, defaultVal ) => {
    if ( !isDefined( defaultVal ) )
            throw 'snapper.parseBoolean can not be called without a default value provided'

    if ( !isDefined( val ) )
        return defaultVal

    val = val.toString()
        .toLowerCase()
        .trim()

    if ( val === 'true' )
        return true

    else if ( val === 'false' )
        return false

    else
        return defaultVal
}

const objIsInArray = (array, obj, key) => {
    const objKeyValue = obj[ key ]

    for ( let i = 0; i < array.length; i++ ) {
        if ( array[ i ][ key ] === objKeyValue )
            return true
    }

    return false
}

const isDefined = (item) => {
    return typeof item !== 'undefined' && item != null
}

const absolutePosition = (element) => {
    const position = element.getBoundingClientRect()
    const body = getBody( element )

    // get the scroll top & left to add to the rect.top & left
    // as the rect is relative to the viewport and ignores scroll position
    const scrollTop = window.pageYOffset || body.scrollTop
    const scrollLeft = window.pageXOffset || body.scrollLeft

    // remove any offset the body has
    const clientTop = body.clientTop || 0
    const clientLeft = body.clientLeft || 0

    return {
        top: Math.round(position.top + scrollTop - clientTop),
        left: Math.round(position.left + scrollLeft - clientLeft)
    }
}

/// Returns { height: xx, width: xx } in px (inner values)
// so excluding padding/margin/border
const getInnerSize = ( element ) => {
    const style = window.getComputedStyle ? getComputedStyle(element, null) : element.currentStyle
    // The width and height of the element including padding, excluding borders and margins.
    const { clientWidth, clientHeight } = element

    return {
        height: clientHeight - parseInt( style.paddingTop ) - parseInt( style.paddingBottom ),
        width: clientWidth - parseInt( style.paddingLeft ) - parseInt( style.paddingRight )
    }
}

export default {
    cloneProperties,
    isPureObject,
    setDefaults,
    getRelativePosition,
    parseBoolean,
    objIsInArray,
    isDefined,
    absolutePosition,
    getInnerSize
}