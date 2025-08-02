const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = 3000;

app.use(express.json());

const dbConfig = {
  host: "turntable.proxy.rlwy.net",
  user: "root",
  password: "QJPteMhHKtqfcJdGOvzCpVKJWZTRHAZY",
  database: "railway",
  port: 16738
};

// Webhook que insere na tabela HELPDESKINFORMACOES
app.post("/webhook", async (req, res) => {
  const msg = req.body;

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      `INSERT INTO HELPDESKINFORMACOES (
        isStatusReply, chatLid, connectedPhone, waitingMessage, isEdit, isGroup, isNewsletter,
        instanceId, messageId, phone, fromMe, momment, status, chatName, senderPhoto,
        senderName, photo, broadcast, participantLid, forwarded, type, fromApi, text, data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FROM_UNIXTIME(? / 1000))`,
      [
        msg.isStatusReply || false,
        msg.chatLid || null,
        msg.connectedPhone || null,
        msg.waitingMessage || false,
        msg.isEdit || false,
        msg.isGroup || false,
        msg.isNewsletter || false,
        msg.instanceId || null,
        msg.messageId || null,
        msg.phone || null,
        msg.fromMe || false,
        msg.momment || Date.now(),
        msg.status || null,
        msg.chatName || null,
        msg.senderPhoto?.toString() || null,
        msg.senderName || null,
        msg.photo?.toString() || null,
        msg.broadcast || false,
        msg.participantLid || null,
        msg.forwarded || false,
        msg.type || null,
        msg.fromApi || false,
        msg.text?.message || null,
        msg.momment || Date.now()
      ]
    );
    await conn.end();
    console.log("✅ Inserido em HELPDESKINFORMACOES:", msg.phone, msg.text?.message);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro ao inserir:", err);
    res.sendStatus(500);
  }
});

// Consulta geral das mensagens
app.get("/mensagens", async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM HELPDESKINFORMACOES ORDER BY id DESC LIMIT 200");
    await conn.end();
    res.json(rows);
  } catch (err) {
  console.error("❌ ERRO AO INSERIR NO MYSQL:", err.message, err.stack);
  res.sendStatus(500);
}
});

app.listen(port, () => {
  console.log(`🚀 Webhook rodando na porta ${port}`);
});


