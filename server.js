import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Servidor funcionando - test 1");
});

app.listen(3000, () => {
  console.log("Server running - test 1");
});