const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk')
const { getDatabaseId } = require("../../util")
const { Client } = require('@notionhq/client')
const makeRequestWithRefresh = require('../../util/reqWithRefresh')


class NotionRetrievePage extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {
            ...opts,
            // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
        })
    }

    static schema = new Schema({
        name: 'notion-retrieve-page',
        label: 'notion-retrieve-page',
        category: 'Maya Red Notion',
        isConfig: false,
        fields: {
            url: new fields.Typed({ type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global'] }),
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        const notion = new Client({ auth: this.tokens.vals.access_token })
        this.setStatus("PROGRESS", "Retrieving notion page...");
        const pageId = getDatabaseId(vals.url)

        try {
            // const response = await notion.databases.retrieve({ database_id: databaseId })
            const response = await notion.pages.retrieve({ page_id: pageId })
            // const response = await makeRequestWithRefresh(this, request)
            msg.payload = response
            this.setStatus("SUCCESS", "Fetched");
            return msg;
        }
        catch (err) {
            msg["__isError"] = true;
            msg.error = err;
            this.setStatus("ERROR", "error occurred");
            return msg;
        }

    }
}

module.exports = NotionRetrievePage