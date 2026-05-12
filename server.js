const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Сервер работает!");
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});