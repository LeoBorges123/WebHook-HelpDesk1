const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = 3000;

app.use(express.json());

// Configuração do banco de dados Railway
const dbConfig = {
  host: "switchback.proxy.rlwy.net",
  user: "root",
  password: "CbvijrmMkPbfqmJoqfqcarTENundWmSK",
  database: "railway",
  port: 16174,
};

// Endpoint de Webhook
app.post("/webhook", async (req, res) => {
  const msg = req.body;
  console.log("📩 RECEBIDO:", JSON.stringify(msg, null, 2));

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      `INSERT INTO HELPDESKINFORMACOES (
        isStatusReply,
        chatLid,
        connectedPhone,
        waitingMessage,
        isEdit,
        isGroup,
        isNewsletter,
        instanceId,
        messageId,
        phone,
        fromMe,
        momment,
        status,
        chatName,
        senderPhoto,
        senderName,
        photo,
        broadcast,
        participantLid,
        forwarded,
        type,
        fromApi,
        mensagem,
        data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FROM_UNIXTIME(? / 1000), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
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
        msg.text?.message || null,
      ]
    );
    await conn.end();
    console.log("✅ Dados salvos com sucesso no banco.");
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ ERRO ao salvar no banco:", err.message);
    res.sendStatus(500);
  }
});

// Endpoint para consulta
app.get("/mensagens", async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM HELPDESKINFORMACOES ORDER BY id DESC LIMIT 100");
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error("❌ ERRO ao buscar mensagens:", err.message);
    res.status(500).send("Erro ao buscar mensagens.");
  }
});

// Início do servidor
app.listen(port, () => {
  console.log(`🚀 Webhook ativo na porta ${port}`);
});
