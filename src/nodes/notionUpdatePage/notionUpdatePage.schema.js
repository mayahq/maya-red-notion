const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk')
const makeRequestWithRefresh = require('../../util/reqWithRefresh')
const { getPageId } = require("../../util")
const { validateTableUpdateTypeData, validateRowUpdateTypeData, convertToNotionProperties } = require('../../util/tableTypeData')

class NotionUpdatePage extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {
            ...opts,
            // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
        })
    }

    static schema = new Schema({
        name: 'notion-update-page',
        label: 'notion-update-page',
        category: 'Maya Red Notion',
        isConfig: false,
        fields: {
            pageId: new fields.Typed({ type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global'] }),
            properties: new fields.Typed({ type: 'json', defaultVal: '{}', allowedTypes: ['msg', 'flow', 'global'] }),
            archived: new fields.Select({ options: ['true', 'false', 'null'], defaultVal: 'null' }),
        },
    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        this.setStatus("PROGRESS", "Updating notion page");
        let page_id = vals.pageId
        let configBody = {};

        let properties = vals.properties
        const isTableUpdateType = validateRowUpdateTypeData(properties)
        console.log('isTableUpdateType', isTableUpdateType, properties)
        if (isTableUpdateType) {
            page_id = properties._identifier.value
            properties = convertToNotionProperties(properties.fields)
        }

        if (vals.properties && Object.keys(vals.properties).length > 0) configBody["properties"] = properties;
        if (vals.archived !== 'null') configBody["archived"] = vals.archived === 'true';
        
        const request = {
            url: `https://api.notion.com/v1/pages/${page_id}`,
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${this.tokens.vals.access_token}`,
                "Content-Type": "application/json",
                "Notion-Version": "2021-08-16"
            },
            data: configBody
        }

        try {          
            const response = await makeRequestWithRefresh(this, request)
            msg.payload = response.data
            this.setStatus("SUCCESS", "Notion page updated");
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

module.exports = NotionUpdatePage