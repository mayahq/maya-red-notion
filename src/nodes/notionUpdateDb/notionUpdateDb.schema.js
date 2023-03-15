const { Node, Schema, fields } = require("@mayahq/module-sdk")
const makeRequestWithRefresh = require("../../util/reqWithRefresh")
const { getDatabaseId } = require("../../util")
const NotionConfig = require("../notionConfig/notionConfig.schema")

class NotionUpdateDb extends Node {
  constructor(node, RED, opts) {
    super(node, RED, {
      ...opts,
      // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
    })
  }

  static schema = new Schema({
    name: "notion-update-db",
    label: "Update database",
    category: "Maya Red Notion",
    isConfig: false,
    fields: {
      NotionConfig: new fields.ConfigNode({ type: NotionConfig }),
      properties: new fields.Typed({
        type: "json",
        defaultVal: "{}",
        allowedTypes: ["msg", "flow", "global"],
      }),
    },
  })

  onInit() {
    // Do something on initialization of node
  }

  async onMessage(msg, vals) {
    this.setStatus("PROGRESS", "Updating notion database...")

    let database_id = getDatabaseId(vals.NotionConfig.url)
    let configBody = {}

    if (vals.properties && Object.keys(vals.properties).length > 0)
      configBody["properties"] = vals.properties
    const request = {
      url: `https://api.notion.com/v1/databases/${database_id}`,
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.tokens.vals.access_token}`,
        "Notion-Version": "2021-08-16",
      },
      data: configBody,
    }
    try {
      const response = await makeRequestWithRefresh(this, request)
      msg.payload = response.data
      this.setStatus("SUCCESS", "Notion database updated")
      return msg
    } catch (err) {
      msg["__isError"] = true
      msg.error = err
      this.setStatus("ERROR", "error occurred")
      return msg
    }
  }
}

module.exports = NotionUpdateDb
