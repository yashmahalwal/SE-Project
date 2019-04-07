const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use("/resources", express.static("./resources"));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cors({
    credentials: true,
    origin: true
}));

app.get("/login", (req, res) => {
    res.sendFile(path.resolve(__dirname, "resources", "login", "dist", "index.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.resolve(__dirname, "resources", "register", "dist", "index.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.resolve(__dirname, "resources", "dashboard_basic", "dist", "index.html"));
});

app.post("/checkUser", (req, res) => {
    res.send({
        validity: true
    })
});

app.get("/article", (req, res) => {
    console.log(req.query);
    switch (req.query.field) {
        case "trending":
            res.send({
                count: 5,
                articles: [{
                    title: "Article 1",
                    content: "Lorem Ipsum Dolor Sit Amet",
                    id: 1
                }, {
                    title: "Article 2",
                    content: "Lorem Ipsum Dolor Sit Amet",
                    id: 2
                }, {
                    title: "Article 3",
                    content: "Lorem Ipsum Dolor Sit Amet",
                    id: 3
                }, {
                    title: "Article 4",
                    content: "Lorem Ipsum Dolor Sit Amet",
                    id: 4
                }, {
                    title: "Article 5",
                    content: "Lorem Ipsum Dolor Sit Amet",
                    id: 5
                }]
            });
            break;
        case "search":
            res.send({
                count: 5,
                articles: [{
                    title: "Article 1",
                    content: "Lorem Ipsum Dolor Sit Amet",
                    id: 1
                }, {
                    title: "Article 2",
                    content: "Lorem Ipsum Dolor Sit Amet",
                    id: 2
                }, {
                    title: "Article 3",
                    content: "Lorem Ipsum Dolor Sit Amet",
                    id: 3
                }, {
                    title: "Article 4",
                    content: "Lorem Ipsum Dolor Sit Amet",
                    id: 4
                }, {
                    title: "Article 5",
                    content: "Lorem Ipsum Dolor Sit Amet",
                    id: 5
                }]
            });
            break;
    }
});

app.listen(3000);