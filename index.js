const express = require("express");
const path = require("path");
const app = express();

app.use("/resources", express.static("./resources"));

app.get("/login", (req, res) => {
    res.sendFile(path.resolve(__dirname, "resources", "login", "dist", "index.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.resolve(__dirname, "resources", "register", "dist", "index.html"));
});
app.listen(3000);