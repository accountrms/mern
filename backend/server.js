const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const ldapjs = require("ldapjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

//DATABASE CONNECTION
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test",
  dateStrings: true
});

connection.connect(err => {
  if (err) return err;
  console.log("Connection Established...");
});

//VERIFYING THE TOKEN
function verifyToken(req, res, next) {
  const { token } = req.body.data;
  if (typeof token !== "undefined") {
    req.token = token;
    next();
  } else {
    res.sendStatus(403);
  }
}

//Function to append zero

function appendZeros(data, requiredLength) {
  for (var i = data.toString().length; i < requiredLength; i++) {
    data = "0" + data;
  }
  return data;
}

//
app.post("/login", (req, res) => {
  var { username, password } = req.body.data;

  if (username === "admin" || username === "operator") {
    var FIND_USER_QUERY = `SELECT username FROM credentials WHERE username="${username}" AND password="${password}"`;
    connection.query(FIND_USER_QUERY, (err, result) => {
      if (err) res.sendStatus(403);
      else {
        if (result.length === 1) {
          const data = {
            user: result[0].username,
            id: result[0].username
          };
          jwt.sign({ data }, "on!the@underwear#scene$", (err, token) => {
            if (err) {
              res.json({ success: false });
            } else {
              res.json({
                success: true,
                token,
                data
              });
            }
          });
        }
      }
    });
  } else {
    const ldapOptions = {
      url: "ldap://ldap.forumsys.com:389",
      connectTimeout: 30000,
      reconnect: true
    };

    const params = {
      user: "cn=read-only-admin,dc=example,dc=com",
      password: password,
      baseDN: "dc=example,dc=com"
    };

    const ldapClient = ldapjs.createClient(ldapOptions);

    ldapClient.bind(params.user, params.password, err => {
      if (err) {
        res.json({ success: false });
      } else {
        console.log("Bind Successful!");
        let options = {
          scope: "sub",
          filter: `(uid=${username})`
        };

        ldapClient.search(params.baseDN, options, (err, response) => {
          if (err) {
            return res.json({ success: false });
          } else {
            console.log("Search completed, Here are the results:");
            response.on("searchEntry", entry => {
              if (entry.object.objectClass.length > 0) {
                console.log("User authorized!");
                const data = {
                  user: entry.object.cn,
                  id: entry.object.uid
                };
                jwt.sign({ data }, "on!the@underwear#scene$", (err, token) => {
                  if (err) {
                    res.json({ success: false });
                  } else {
                    res.json({
                      success: true,
                      token,
                      data
                    });
                  }
                });
              } else {
                return res.json({ error: "Invalid credentials" });
              }
            });
            response.on("error", err => {
              if (err) {
                return res.json({ error: "Invalid credentials" });
              }
            });
          }
        });
      }
    });
  }
});

app.post("/authenticateUser", (req, res) => {
  jwt.verify(
    req.body.data.token,
    "on!the@underwear#scene$",
    (err, authData) => {
      if (err) {
        return res.json({
          status: false,
          err
        });
      } else {
        var { data } = authData;
        return res.json({
          status: true,
          data
        });
      }
    }
  );
});

app.post("/getposts", verifyToken, (req, res) => {
  jwt.verify(req.token, "on!the@underwear#scene$", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var { searchStatus, search } = req.body.data;
      var id = authData.data.id;
      if (authData.data.user === "admin" || authData.data.user === "operator")
        if (searchStatus) {
          var SELECT_ALL_QUERY = `SELECT reqno,vendor,orderno,invoice,date,amount,tracking,processed,user,type FROM table1 WHERE reqno="${search}" ORDER BY table1.id DESC LIMIT 1`;
        } else {
          var SELECT_ALL_QUERY = `SELECT reqno,vendor,orderno,invoice,date,amount,tracking,processed,user,type FROM table1 WHERE 1 ORDER BY table1.processed ASC`;
        }
      else {
        if (searchStatus) {
          var SELECT_ALL_QUERY = `SELECT reqno,vendor,orderno,invoice,date,amount,tracking,processed,user,type FROM table1 WHERE user="${id}" AND reqno="${search}" ORDER BY table1.id DESC LIMIT 1`;
        } else {
          var SELECT_ALL_QUERY = `SELECT reqno,vendor,orderno,invoice,date,amount,tracking,processed,user,type FROM table1 WHERE user="${id}" ORDER BY table1.processed ASC`;
        }
      }
      connection.query(SELECT_ALL_QUERY, (err, results) => {
        if (err) {
          res.json({ data: false });
        } else if (results.length === 0) {
          return res.json({ results, authData, searchStatus, msg: "" });
        } else if (searchStatus && results[0].type === "D") {
          return res.json({
            results: [],
            msgStatus: true,
            msg: "Request deleted. Try with correct request number"
          });
        } else {
          return res.json({ results, authData, searchStatus, msg: "" });
        }
      });
    }
  });
});

app.post("/getposts/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, "on!the@underwear#scene$", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var id = req.params.id;
      var SELECT_ALL_QUERY = `SELECT reqno,vendor,orderno,invoice,date,amount,tracking,processed,user,type FROM table1 WHERE reqno=${id}`;
      connection.query(SELECT_ALL_QUERY, (err, results) => {
        if (err) throw err;
        else return res.json({ data: results });
      });
    }
  });
});

app.post("/addpost", verifyToken, (req, res) => {
  jwt.verify(req.token, "on!the@underwear#scene$", (err, authData) => {
    if (err) res.sendStatus(403);
    else {
      var year = new Date().getFullYear();
      var month = appendZeros(new Date().getMonth() + 1, 2);
      var date = appendZeros(new Date().getDate(), 2);
      var today = year + "" + month + "" + date;
      var NO_OF_REQUEST_QUERY = `SELECT reqno FROM table1 WHERE reqno LIKE "${today}%"`;
      connection.query(NO_OF_REQUEST_QUERY, (err, result) => {
        if (err) throw err;
        else if (
          authData.data.id === "admin" ||
          authData.data.id === "operator"
        ) {
          return res.json({ data: false });
        } else {
          newReqNo = appendZeros(result.length + 1, 4);
          var reqno = today + "" + newReqNo;
          var { vendor, order, invoice, date, amount } = req.body.data;
          date = new Date(date);
          var user = authData.data.id;
          var VALUES = [
            vendor,
            "N",
            order,
            invoice,
            date,
            amount,
            "absent",
            0,
            user,
            reqno
          ];
          var INSERT_QUERY = `INSERT INTO table1 (vendor, type, orderno, invoice, date, amount, tracking, processed,user,reqno) VALUES (?)`;
          connection.query(INSERT_QUERY, [VALUES], err => {
            if (err) return res.json({ data: false });
            else return res.json({ data: true });
          });
        }
      });
    }
  });
});

app.put("/updatepost", (req, res) => {
  var { id, trackingNo } = req.body.ims;
  var UPDATE_QUERY = `UPDATE table1 SET processed = "1", tracking = "${trackingNo}" WHERE table1.id = ${id}`;
  connection.query(UPDATE_QUERY, (err, result) => {
    if (err) return res.json({ data: false });
    else res.send("Updated successfully");
  });
});

app.post("/requestforchange", verifyToken, (req, res) => {
  jwt.verify(req.token, "on!the@underwear#scene$", (err, authData) => {
    if (err) res.sendStatus(403);
    else {
      var { reqno, vendor, order, invoice, date, amount } = req.body.data;
      date = new Date(date).toLocaleDateString();
      date = date.split("/");
      date =
        date[2] + "-" + appendZeros(date[0], 2) + "-" + appendZeros(date[1], 2);
      var user = authData.data.id;
      var NO_OF_REQUEST_QUERY = `SELECT id FROM table1 WHERE reqno LIKE "${reqno}" AND vendor LIKE "${vendor}" AND orderno LIKE "${order}" AND invoice LIKE "${invoice}" AND date LIKE "${date}" AND amount LIKE "${amount}"`;
      connection.query(NO_OF_REQUEST_QUERY, (err, result) => {
        if (err) throw err;
        else if (result.length === 0) {
          console.log("1");
          var VALUES = [
            vendor,
            "U",
            order,
            invoice,
            date,
            amount,
            "absent",
            0,
            user,
            reqno
          ];
          var INSERT_QUERY = `INSERT INTO table1 (vendor, type, orderno, invoice, date, amount, tracking, processed,user,reqno) VALUES (?)`;
          connection.query(INSERT_QUERY, [VALUES], err => {
            if (err) return res.json({ data: false });
            else return res.json({ data: true });
          });
        } else {
          console.log("2");
          return res.json({
            data: false,
            msgStatus: true,
            msg: "No data changed"
          });
        }
      });
    }
  });
});

app.post("/requestfordelete", verifyToken, (req, res) => {
  var { details, justification } = req.body.data;
  jwt.verify(req.token, "on!the@underwear#scene$", (err, authData) => {
    if (err) res.sendStatus(403);
    else if (authData.data.id === details[0].user) {
      var { reqno } = details[0];
      var VALUES = [reqno, justification];
      CHECK_ALREADY_DELETED = `SELECT id FROM table1 WHERE reqno = ${reqno} AND type = "D"`;
      connection.query(CHECK_ALREADY_DELETED, (err, result) => {
        if (result.length === 0) {
          var UPDATE_QUERY = `UPDATE table1 SET processed = "0", type = "D" WHERE table1.reqno = ${reqno}`;
          var ADD_DELETE_DETAILS = `INSERT INTO deletedetails (reqno, remarks) VALUES (?)`;
          connection.query(UPDATE_QUERY, (err, result) => {
            if (err) return res.json({ data: false });
            else {
              connection.query(ADD_DELETE_DETAILS, [VALUES], err => {
                if (err) return res.json({ data: false });
                else return res.json({ data: true });
              });
            }
          });
        }
      });
    } else {
      console.log("Error. Please try again!");
    }
  });
});

app.listen(3001, () => {
  console.log(".....Server running.....");
});
