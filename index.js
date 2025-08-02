const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = 3000;

app.use(express.json());

// Configuração da conexão com o MySQL do Railway
const dbConfig = {
  host: "turntable.proxy.rlwy.net",
  user: "root",
  password: "SUA_SENHA_AQUI",
  database: "railway",
  port: 16738
};

// Inicializa banco com a tabela, se não existir
async function inicializarDB() {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS HELPDESKINFORMACOES (
      id INT AUTO_INCREMENT PRIMARY KEY,
      isStatusReply BOOLEAN,
      chatLid VARCHAR(255),
      connectedPhone VARCHAR(20),
      waitingMessage BOOLEAN,
      isEdit BOOLEAN,
      isGroup BOOLEAN,
      isNewsletter BOOLEAN,
      instanceId VARCHAR(100),
      messageId VARCHAR(100),
      phone VARCHAR(20),
      fromMe BOOLEAN,
      momment BIGINT,
      status VARCHAR(50),
      chatName VARCHAR(100),
      senderPhoto TEXT,
      senderName VARCHAR(100),
      photo TEXT,
      broadcast BOOLEAN,
      participantLid VARCHAR(255),
      forwarded BOOLEAN,
      type VARCHAR(100),
      fromApi BOOLEAN,
      mensagem TEXT,
      data DATETIME
    )
  `);
  await conn.end();
}
inicializarDB();

// Webhook
app.post("/webhook", async (req, res) => {
  const msg = req.body;

  // 👉 Exibe no console tudo que chegou (formatado)
  console.log("📥 Webhook recebido:");
  console.log(JSON.stringify(msg, null, 2));

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      `INSERT INTO HELPDESKINFORMACOES (
        isStatusReply, chatLid, connectedPhone, waitingMessage, isEdit, isGroup, isNewsletter,
        instanceId, messageId, phone, fromMe, momment, status, chatName,
        senderPhoto, senderName, photo, broadcast, participantLid, forwarded,
        type, fromApi, mensagem, data
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
        msg.momment || null,
        msg.status || null,
        msg.chatName || null,
        msg.senderPhoto || null,
        msg.senderName || null,
        msg.photo || null,
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
    console.log("✅ Mensagem COMPLETA salva no banco.\n");
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro ao salvar no banco:", err);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`🚀 Webhook rodando na porta ${port}`);
});
