const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: "raw",
    version: "2.1",
    role: 0,
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤",
    description: "Generate a unique RAW text link publicly",
    category: "convert",
    guide: { 
      en: "{pn} → Reply to a code snippet to create RAW Link\n{pn} [filename] → Create raw from cmds folder"
    },
    countDown: 2
  },

  onStart: async function ({ api, event, args }) {
    let fileName = args[0];
    let code = "";

    try {
      if (event.type === "message_reply" && event.messageReply?.body) {
        code = event.messageReply.body;
        if (!fileName) {
          const time = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
          fileName = `raw_${time}.js`;
        } else if (!fileName.endsWith(".js") && !fileName.endsWith(".txt")) {
          fileName = `${fileName}.js`;
        }
      } else if (fileName) {
        let filePath;
        if (args[0] === "-e") {
          const eventFile = args[1];
          if (!eventFile) return api.sendMessage("⚠ | Please provide filename after -e.", event.threadID, event.messageID);
          fileName = eventFile.endsWith(".js") ? eventFile : `${eventFile}.js`;
          filePath = path.resolve(__dirname, '../../scripts/events', fileName);
        } else {
          const commandsPath = path.resolve(__dirname, '../../scripts/cmds');
          fileName = fileName.endsWith(".js") ? fileName : `${fileName}.js`;
          filePath = path.join(commandsPath, fileName);
        }

        if (!fs.existsSync(filePath)) {
          return api.sendMessage(`❌ File "${fileName}" not found!`, event.threadID, event.messageID);
        }
        code = await fs.promises.readFile(filePath, "utf-8");
      } else {
        return api.sendMessage("⚠ | Please reply with code OR provide a file name.", event.threadID, event.messageID);
      }

      // Public API Upload (No password needed for users)
      const baseUrl = "https://aliya-official-v4.vercel.app";
      const response = await axios.post(`${baseUrl}/api/raw/save`, {
        title: fileName,
        code: code
      });

      if (!response.data || !response.data.success) {
        throw new Error("Failed to save code on server");
      }

      const fileId = response.data.fileId;
      const rawLink = `${baseUrl}/raw/${fileId}`;
      const signature = `╭───────────────⬣\n│ 𝐌𝐚𝐝𝐞 𝐰𝐢𝐭𝐡 🤍 𝐛𝐲 --𝔐𝔯.𝔎𝔦𝔫𝔤\n╰───────────────⬣`;

      const rawMsg = `✅ 𝐑𝐀𝐖 𝐋𝐈𝐍𝐊 𝐆𝐄𝐍𝐄𝗥𝐀𝐓𝐄𝐃 🌸\n\n📌 𝐅𝐢𝐥𝐞: ${fileName}\n🔗 ${rawLink}\n\n${signature}`;
      return api.sendMessage(rawMsg, event.threadID, event.messageID);

    } catch (err) {
      console.error("❌ RAW Error:", err.message || err);
      return api.sendMessage("⚠️ Failed to create RAW link. Server connection error.", event.threadID, event.messageID);
    }
  }
};
      
