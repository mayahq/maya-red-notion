const { Node, Schema, fields } = require("@mayahq/module-sdk")
const { getDatabaseId } = require("../../util")
const makeRequestWithRefresh = require("../../util/reqWithRefresh")
const {
  createTablePagePropertyMapFromNotion,
} = require("../../util/tableTypeData")
const NotionConfig = require("../notionConfig/notionConfig.schema")

class NotionQueryDb extends Node {
  constructor(node, RED, opts) {
    super(node, RED, {
      ...opts,
      // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
    })
  }

  static schema = new Schema({
    name: "notion-query-db",
    label: "Query database",
    category: "Maya Red Notion",
    isConfig: false,
    fields: {
      NotionConfig: new fields.ConfigNode({ type: NotionConfig }),
      filter: new fields.Typed({
        type: "json",
        defaultVal: "{}",
        allowedTypes: ["msg", "flow", "global"],
      }),
      sorts: new fields.Typed({
        type: "json",
        defaultVal: "{}",
        allowedTypes: ["msg", "flow", "global"],
      }),
      start_cursor: new fields.Typed({
        type: "str",
        allowedTypes: ["msg", "flow", "global"],
      }),
      page_size: new fields.Typed({
        type: "num",
        defaultVal: 10,
        allowedTypes: ["msg", "flow", "global"],
      }),
    },
  })

  onInit() {
    // Do something on initialization of node
  }

  async onMessage(msg, vals) {
    this.setStatus("PROGRESS", "Querying notion database...")

    let database_id = getDatabaseId(vals.NotionConfig.url)
    let config_body = {}
    if (vals.filter && Object.keys(vals.filter).length > 0)
      config_body["filter"] = vals.filter
    if (vals.sorts && Object.keys(vals.sorts).length > 0)
      config_body["sorts"] = vals.sorts
    if (vals.start_cursor && vals.start_cursor.length > 0)
      config_body["start_cursor"] = vals.start_cursor

    const request = {
      url: `https://api.notion.com/v1/databases/${database_id}/query`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.tokens.vals.access_token}`,
        "Notion-Version": "2021-08-16",
      },
      data: {
        ...config_body,
        page_size: vals.page_size,
      },
    }

    try {
      const response = await makeRequestWithRefresh(this, request)
      msg.notionResults = response.data
      try {
        msg.table = msg.payload.results.map((result) =>
          createTablePagePropertyMapFromNotion(result)
        )
        msg.rowData = msg.table
      } catch (e) {
        console.log("brah", e)
      }

      this.setStatus("SUCCESS", "Fetched successfully")
      return msg
    } catch (err) {
      msg["__isError"] = true
      msg.error = err
      this.setStatus("ERROR", "error occurred")
      return msg
    }
  }
}

module.exports = NotionQueryDb
