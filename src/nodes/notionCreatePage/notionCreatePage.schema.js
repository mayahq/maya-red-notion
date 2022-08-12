const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const makeRequestWithRefresh = require('../../util/reqWithRefresh')
const { getPageId, getDatabaseId } = require("../../util");
const { validateTableTypeData, convertToNotionProperties } = require('../../util/tableTypeData');

class NotionCreatePage extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {
            ...opts,
            // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
        })
    }

    static schema = new Schema({
        name: 'notion-create-page',
        label: 'notion-create-page',
        category: 'Maya Red Notion',
        isConfig: false,
        fields: {
            url: new fields.Typed({ type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global'] }),
            parent_type: new fields.Select({ options: ['database', 'page'], defaultVal: 'database' }),
            properties: new fields.Typed({ type: 'json', defaultVal: '{}', allowedTypes: ['msg', 'flow', 'global'] }),
            children: new fields.Typed({ type: 'json', defaultVal: '{}', allowedTypes: ['msg', 'flow', 'global'] }),
            icon: new fields.Typed({ type: 'json', defaultVal: '{}', allowedTypes: ['msg', 'flow', 'global'] }),
            cover: new fields.Typed({ type: 'json', defaultVal: '{}', allowedTypes: ['msg', 'flow', 'global'] }),
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        this.setStatus("PROGRESS", "Creating notion pages...");

        let rows = vals.properties
        if (!Array.isArray(rows)) {
            rows = [rows]
        } 
        if (rows.every(row => validateTableTypeData(row.fields))) {
            rows = rows.map(row => convertToNotionProperties(row.fields))
        }

        const requests = []
        rows.forEach(row => {
            let configBody = {
                parent: {},
                properties: row
            };
            if (vals.parent_type === 'database') {
                configBody["parent"]["database_id"] = getDatabaseId(vals.url);
            } else {
                configBody["parent"]["page_id"] = getPageId(vals.url);
            }
            if (vals.children && Object.keys(vals.children).length > 0) configBody["children"] = vals.children
            if (vals.icon && Object.keys(vals.icon).length > 0) configBody["icon"] = vals.icon
            if (vals.cover && Object.keys(vals.cover).length > 0) configBody["cover"] = vals.cover
    
            const request = {
                url: `https://api.notion.com/v1/pages`,
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.tokens.vals.access_token}`,
                    "Notion-Version": "2021-08-16"
                },
                data: configBody
            }

            requests.push(request)
        })

        try {            
            const result = await Promise.all(requests.map(req => makeRequestWithRefresh(this, req)))
            // const response = await makeRequestWithRefresh(this, request)
            msg.payload = result
            this.setStatus("SUCCESS", "Done")
            return msg;
        }
        catch (err) {
            msg["__isError"] = true;
            msg.error = err;
            this.setStatus("ERROR", err.message);
            return msg;
        }
    }
}

module.exports = NotionCreatePage