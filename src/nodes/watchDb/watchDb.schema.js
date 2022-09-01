const { Node, Schema, fields } = require("@mayahq/module-sdk");
const { Client } = require("@notionhq/client");
const { getDatabaseId } = require("../../util");
const makeRequestWithRefresh = require("../../util/reqWithRefresh");
const {
  createTablePagePropertyMapFromNotion,
} = require("../../util/tableTypeData");
const cron = require("node-cron");

class WatchDb extends Node {
  constructor(node, RED, opts) {
    super(node, RED, {
      ...opts,
      // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
    });
  }

  static schema = new Schema({
    name: "watch-db",
    label: "watch-db",
    category: "Maya Red Notion",
    isConfig: false,
    fields: {
      url: new fields.Typed({
        type: "str",
        defaultVal: "",
        allowedTypes: ["msg", "flow", "global"],
      }),
      interval_in_minutes: new fields.Typed({
        type: "num",
        defaultVal: 10,
        allowedTypes: ["msg", "flow", "global"],
      }),
    },
  });

  async onInit() {
    // Do something on initialization of node

    let vals = {
      url: this._node.url,
      interval: this._node.interval_in_minutes,
    };
    const msg_this = this;
    const context = msg_this._node.context();
    const cron_expression = `*/${vals.interval} * * * *`;
    const cron_watch = cron.schedule(
      cron_expression,
      async () => {
        let stored_last_time = 0; // get last time from flow flow.get("last_time")
        //stored_last_time = context.flow.get("last_edit_time");
        let stored_last_id = context.flow.get("last_edit_id");
        const notion = new Client({ auth: msg_this.tokens.vals.access_token });
        const databaseId = getDatabaseId(vals.url);
        //let current_last_time = await msg_this.last_edit_time(notion, databaseId);
        msg_this.setStatus("PROGRESS", "Fetching new data");
        // query db
        let config_body = {};

        const request = {
          url: `https://api.notion.com/v1/databases/${databaseId}/query`,
          method: "POST",
          headers: {
            Authorization: `Bearer ${msg_this.tokens.vals.access_token}`,
            "Notion-Version": "2021-08-16",
          },
          data: {
            ...config_body,
            sorts: [
              {
                timestamp: "created_time",
                direction: "descending",
              },
            ],
            page_size: 100,
          },
        };
        let msg = {};
        try {
          const response = await makeRequestWithRefresh(msg_this, request);
          msg.payload = response.data;
          var updated_elements = [];
          try {
            let has_filtered = false;
            let current_time = msg.payload.results[0].created_time;
            for (let cur = 0; cur < msg.payload.results.length; cur++) {
              // remove elements from msg.payload.results which appear before stored_last_time

              if (
                current_time === msg.payload.results[cur].created_time &&
                msg.payload.results[cur].id !== stored_last_id
              ) {
                updated_elements.push(msg.payload.results[cur]);
              } else {
                break;
              }
            }
            // msg.ogdata = msg.payload.results;
            if (msg.payload.results[0])
              context.flow.set("last_edit_id", msg.payload.results[0].id);
            console.log(
              updated_elements.length,
              msg.payload.results[0].id === stored_last_id
            );
            msg.payload.results = updated_elements;
            if (has_filtered) msg.payload.results.pop();
            msg.table = msg.payload.results.map((result) =>
              createTablePagePropertyMapFromNotion(result)
            );
            msg.table.reverse();
            msg.rowData = msg.table;
          } catch (e) {
            console.log("brah", e);
          }

          msg_this.setStatus("SUCCESS", "Fetched successfully");
          //context.flow.set("last_edit_time", current_last_time); // set msg_this in flow

          if (stored_last_id && updated_elements.length) this.redNode.send(msg);
        } catch (err) {
          msg["__isError"] = true;
          msg.error = err;
          msg_this.setStatus("ERROR", "error occurred");
          this.redNode.send(msg);
        }
      },
      {
        // timezone
        scheduled: true,
        timezone: "Asia/Kolkata",
      }
    );
  }

  async last_edit_time(notion, databaseId) {
    try {
      const response = await notion.databases.retrieve({
        database_id: databaseId,
      });
      return response.last_edited_time;
    } catch (err) {
      console.log("There was an error fetching the last update time: ", err);
    }
  }
  async onMessage(msg, vals) {
    // Handle the message. The returned value will
    // be sent as the message to any further nodes.
    // convert vals.interval to cron expression to run every vals.interval seconds
  }
}

module.exports = WatchDb;
