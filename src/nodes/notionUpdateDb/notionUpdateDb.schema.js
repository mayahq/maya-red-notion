const {
    Node,
    Schema
} = require('@mayahq/module-sdk')

class NotionUpdateDb extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {
            ...opts,
            // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
        })
    }

    static schema = new Schema({
        name: 'notion-update-db',
        label: 'notion-update-db',
        category: 'Maya Red Notion',
        isConfig: false,
        fields: {
            // Whatever custom fields the node needs.
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        // Handle the message. The returned value will
        // be sent as the message to any further nodes.

    }
}

module.exports = NotionUpdateDb