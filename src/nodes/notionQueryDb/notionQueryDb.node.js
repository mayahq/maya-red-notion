const NodeClass = require('./notionQueryDb.schema')
const {
    nodefn
} = require('@mayahq/module-sdk')

module.exports = nodefn(NodeClass, "maya-red-notion")