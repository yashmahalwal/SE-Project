const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const escape = require('escape-html');
const session = require('express-session');

app.use(session({
    'secret': '343ji43j4n3jn4jk3n',
    resave: false,
    saveUninitialized: true
}));
const saltRounds = 10;
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '2349',
    database: 'se'
});


app.use("/resources", express.static("./resources"));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cors({
    credentials: true,
    origin: true
}));

app.get("/", (req, res) => {
    if (!req.session.username)
        res.sendFile(path.resolve(__dirname, "resources", "login", "dist", "index.html"));
    else
        res.redirect("/dashboard");
});
app.get("/register", (req, res) => {
    res.sendFile(path.resolve(__dirname, "resources", "register", "dist", "index.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.resolve(__dirname, "resources", "dashboard_basic", "dist", "index.html"));
});

app.post("/checkUser", (req, res) => {
    switch (req.body.field) {
        case "loggedIn":
            if (req.session.username) {
                // Get the user vote counts
                var sql = "SELECT count(*) as 'Votes' FROM votesOn WHERE username = ?";
                var inserts = [escape(req.body.username)];
                sql = mysql.format(sql, inserts);
                pool.query(sql, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        res.send({
                            sql: false
                        });
                        return;
                    }
                    res.send({
                        sql: true,
                        status: true,
                        username: req.session.username,
                        votes: result[0].Votes
                    });
                });
            } else
                res.send({
                    sql: true,
                    status: false
                })
            return;
        case "createUser":
            // Hash the password
            bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                // Insert the value into DB

                var sql = "INSERT INTO users(username, name, email, passHash) VALUES(?, ?, ?, ?)";
                var inserts = [escape(req.body.username), escape(req.body.name), escape(req.body.email), hash];
                sql = mysql.format(sql, inserts);
                pool.query(sql, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        res.send({
                            sql: false
                        });
                        return;
                    }

                    // Remember the user in the session
                    req.session.username = req.body.username;
                    res.send({
                        sql: true,
                    });
                });
            });
            return;
        case "checkUsername":
            var sql = "SELECT * FROM users WHERE username = ?";
            var inserts = [escape(req.body.value)];
            sql = mysql.format(sql, inserts);
            pool.query(sql, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    res.send({
                        sql: false
                    });
                    return;
                }

                res.send({
                    sql: true,
                    valid: !result.length ? true : false,
                    value: req.body.value
                });
            });
            return;
        case "logIn":
            var sql = "SELECT * FROM users WHERE username = ?";
            var inserts = [escape(req.body.username)];
            sql = mysql.format(sql, inserts);
            pool.query(sql, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    res.send({
                        sql: false
                    });
                    return;
                }

                if (!result.length) {

                    res.send({
                        sql: true,
                        valid: false
                    });
                    return;
                }
                let passHash = result[0].passHash;
                bcrypt.compare(req.body.password, passHash, function (err, result) {
                    if (result)
                        req.session.username = req.body.username;


                    res.send({
                        sql: true,
                        valid: result
                    });
                });
            });
            return;
    }

});

app.get("/article", (req, res) => {
    switch (req.query.field) {
        case "trending":
            var sql = "SELECT * FROM articles";
            var inserts = ["%" + escape(req.query.value) + "%", "%" + escape(req.query.value) + "%", "%" + escape(req.query.value) + "%"];
            sql = mysql.format(sql, inserts);
            pool.query(sql, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return;
                }

                let r = [];
                let x = 0;
                for (let i = result.length - 1; i >= 0; i--) {
                    r.push(result[i]);
                    if (++x == 20)
                        break;
                }

                res.send({
                    sql: true,
                    count: 5,
                    articles: r
                });
            });
            break;
            break;
        case "search":
            var sql = "SELECT * FROM articles WHERE title LIKE ? OR description LIKE ? OR author LIKE ?";
            var inserts = ["%" + escape(req.query.value) + "%", "%" + escape(req.query.value) + "%", "%" + escape(req.query.value) + "%"];
            sql = mysql.format(sql, inserts);
            pool.query(sql, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return;
                }

                let r = [];

                for (let i of result) {
                    r.push(i);
                }

                res.send({
                    sql: true,
                    count: 5,
                    articles: r
                });
            });
            break;
        case "getVotes":
            var sql = "select id, vote, count(*) as 'count' from articles join votesOn on id = articleId where id = ? group by id, vote";
            var inserts = [escape(req.query.id)];
            sql = mysql.format(sql, inserts);
            pool.query(sql, function (err, result, fields) {
                if (err) {
                    console.log(err);

                    res.send({
                        sql: false
                    });
                    return;
                }
                upvotes = 0;
                downvotes = 0;
                for (let i of result) {
                    if (i.vote == "upvote")
                        upvotes = i.count
                    else
                        downvotes = i.count
                }

                res.send({
                    sql: true,
                    upvotes: upvotes,
                    downvotes: downvotes
                });
            });
            break;
        case "makeVote":
            var sql = "insert ignore into votesOn values(?, ?, ?);";
            var inserts = [req.session.username, escape(req.query.id), escape(req.query.type)];
            sql = mysql.format(sql, inserts);
            pool.query(sql, function (err, result, fields) {
                if (err) {
                    console.log(err);

                    res.send({
                        sql: false
                    });
                    return;
                }
                res.send({
                    sql: true,
                });
            });
            break;
    }
});

app.post("/submitArticle", (req, res) => {
    var sql = "INSERT INTO articles(author, title, description) VALUES(?, ?, ?)";
    var inserts = [req.session.username, escape(req.body.title), escape(req.body.description)];
    sql = mysql.format(sql, inserts);
    pool.query(sql, function (err, result, fields) {
        if (err) {
            console.log(err);
            res.send({
                sql: false
            });
            return;
        }


        res.send({
            sql: true,
        });
    });
});

app.get("/logout", (req, res) => {
    req.session.username = null;
    res.redirect("/");
})

app.listen(3000);
console.log("Listening on port 3000");