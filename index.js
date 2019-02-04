const options = require('./build/options')

module.exports = require('./build/snappy-grid').default
module.exports.helpers = require('./build/helpers').default
module.exports.defaultGridOptions = options.defaultGridOptions
module.exports.defaultItemOptions = options.defaultItemOptions
module.exports.renderModeType = options.renderModeType
module.exports.resizeOptions = options.resizeOptions
module.exports.defaultPlaceholderStyles = options.defaultPlaceholderStyles