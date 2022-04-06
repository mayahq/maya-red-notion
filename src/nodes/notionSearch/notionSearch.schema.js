const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk')

const makeRequestWithRefresh = require('../../util/reqWithRefresh')

class NotionSearch extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {
            ...opts,
            // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
        })
    }

    static schema = new Schema({
        name: 'notion-search',
        label: 'notion-search',
        category: 'Maya Red Notion',
        isConfig: false,
        fields: {
            query: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
            page_size: new fields.Typed({type: 'num', defaultVal: 10, allowedTypes: ['msg', 'flow', 'global']}),
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        this.setStatus("PROGRESS", "Fetching notion results...");
        // var fetch = require("node-fetch"); // or fetch() is native in browsers

        const request = {
            url: `https://api.notion.com/v1/search`,
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.tokens.vals.access_token}`,
                "Notion-Version": "2021-08-16"
            },
            data: {
                query: vals.query,
                sort: {
                    direction: "ascending",
                    timestamp: "last_edited_time"
                },
                page_size: vals.page_size
            }
        }
        try {
            const response = await makeRequestWithRefresh(this, request)
            msg.payload = response.data
            this.setStatus("SUCCESS", "Fetched");
            return msg;
        } catch (err) {
            msg["__isError"] = true;
            msg.error = err;
            this.setStatus("ERROR", "error occurred");
            return msg;
        }
    }
}

module.exports = NotionSearch