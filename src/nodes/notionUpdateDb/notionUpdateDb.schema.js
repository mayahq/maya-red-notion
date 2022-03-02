const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk')
const {getDatabaseId} = require("../../util")

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
            url: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
            properties: new fields.Typed({type: 'json', defaultVal: '{}', allowedTypes: ['msg', 'flow', 'global']}),
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async refreshTokens() {
        const newTokens = await refresh(this)
        await this.tokens.set(newTokens)
        return newTokens
    }

    async onMessage(msg, vals) {
        console.log("vals", vals);
        this.setStatus("PROGRESS", "updating notion database...");
        var fetch = require("node-fetch"); // or fetch() is native in browsers
        let database_id = getDatabaseId(vals.url)
        let config_body = {};
        if(vals.properties && Object.keys(vals.properties).length > 0)	config_body["properties"] = vals.properties;
        let fetchConfig = {
            url: `https://api.notion.com/v1/databases/${database_id}`,
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${this.tokens.vals.access_token}`,
                "Content-Type": "application/json",
                "Notion-Version": "2021-08-16"
            },
            body: JSON.stringify({
            	...config_body,
            })
        }
        try{
            let res = await fetch(fetchConfig.url, 
            {
                method: fetchConfig.method,
                headers: fetchConfig.headers,
                body: fetchConfig.body
            });
            let json = await res.json();
            console.log(json);
            if(json.error){
                if(json.error.code === 401){
                    const { access_token } = await this.refreshTokens()
                    if (!access_token) {
                        this.setStatus('ERROR', 'Failed to refresh access token')
                        msg["__isError"] = true;
                        msg.error = {
                            reason: 'TOKEN_REFRESH_FAILED',
                        }
                        return msg
                    }
                    fetchConfig.headers.Authorization = `Bearer ${access_token}`;
                    res = await fetch(fetchConfig.url, 
                            {
                                method: fetchConfig.method,
                                headers: fetchConfig.headers
                            });
                    json = await res.json();
                    if(json.error){
                        msg.error = json.error;
                        this.setStatus("ERROR", json.error.message);
                        return msg;
                    }
                } else {
                    msg["__isError"] = true;
                    msg.error = json.error;
                    this.setStatus("ERROR", json.error.message);
                    return msg;
                }
                
            }
            msg.payload = json;
            this.setStatus("SUCCESS", "fetched");
            return msg;
        }
        catch(err){
            msg["__isError"] = true;
            msg.error = err;
            this.setStatus("ERROR", "error occurred");
            return msg;
        }

    }
}

module.exports = NotionUpdateDb