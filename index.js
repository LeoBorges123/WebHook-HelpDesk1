const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = 3000;

app.use(express.json());

// Configuração da conexão com o MySQL do Railway
const dbConfig = {
  host: "turntable.proxy.rlwy.net",
  user: "root",
  password: "QJPteMhHKtqfcJdGOvzCpVKJWZTRHAZY ",
  database: "railway",
  port: 16738
};

// Inicializa banco com a tabela, se não existir
async function inicializarDB() {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS mensagens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phone VARCHAR(20),
      nome VARCHAR(100),
      tipo VARCHAR(50),
      mensagem TEXT,
      data DATETIME,
      foto TEXT
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
      `INSERT INTO mensagens (phone, nome, tipo, mensagem, data, foto)
       VALUES (?, ?, ?, ?, FROM_UNIXTIME(? / 1000), ?)`,
      [
        msg.phone || null,
        msg.senderName || null,
        msg.type || null,
        msg.text?.message || null,
        msg.momment || Date.now(),
        msg.senderPhoto || null
      ]
    );

    await conn.end();
    console.log("✅ Mensagem salva:", msg.phone, msg.text?.message);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro ao inserir:", err);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`🚀 Webhook rodando na porta ${port}`);
});
