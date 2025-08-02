const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = process.env.PORT || 3000;

// Middleware para JSON
app.use(express.json());

// Configuração MySQL com variáveis de ambiente
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  port: process.env.MYSQL_PORT || 3306
};

// Inicializa tabela se não existir
async function inicializarDB() {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS HELPDESKINFORMACOES (
      id INT AUTO_INCREMENT PRIMARY KEY,
      isStatusReply BOOLEAN,
      chatLid VARCHAR(255),
      connectedPhone VARCHAR(50),
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
      type VARCHAR(50),
      fromApi BOOLEAN,
      text TEXT,
      data DATETIME
    )
  `);
  await conn.end();
}
inicializarDB();

// Webhook
app.post("/webhook", async (req, res) => {
  const msg = req.body;

  try {
    const conn = await mysql.createConnection(dbConfig);

    await conn.execute(
      `INSERT INTO HELPDESKINFORMACOES (
        isStatusReply, chatLid, connectedPhone, waitingMessage, isEdit, isGroup,
        isNewsletter, instanceId, messageId, phone, fromMe, momment, status, chatName,
        senderPhoto, senderName, photo, broadcast, participantLid, forwarded, type,
        fromApi, text, data
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
        msg.senderPhoto || null,
        msg.senderName || null,
        msg.photo || null,
        msg.broadcast || false,
        msg.participantLid || null,
        msg.forwarded || false,
        msg.type || null,
        msg.fromApi || false,
        JSON.stringify(msg.text) || null,
        msg.momment || Date.now()
      ]
    );

    await conn.end();

    console.log("✅ Mensagem salva no banco com sucesso:");
    console.log(JSON.stringify(msg, null, 2));

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro ao inserir no banco:", err);
    res.sendStatus(500);
  }
});

// Para testar o GET
app.get("/mensagens", async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM HELPDESKINFORMACOES ORDER BY id DESC LIMIT 100");
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error("❌ Erro ao buscar mensagens:", err);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`🚀 Webhook rodando em http://localhost:${port}`);
});
