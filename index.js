const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
require('express-group-routes')
const app = express()


app.use(bodyParser.json())

const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'train_db'
})

const jwtMW = exjwt({
  secret: 'hallo'
});

app.group("/api/v1", (router) => {
  router.post('/login', (req, result) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      connection.query(`SELECT * FROM tbl_user WHERE username ="${username}" AND password = "${password}"`, function (res, rows, fields) {
        if (rows.length > 0) {
          let token = jwt.sign({ username: username }, 'hallo', { expiresIn: 129600 })
          result.status(200).send({ message: "Suscced", token: token })
        } else {
          result.send({ message: "Data user not found!" })
        }
      });
    } else {
      result.send('Please enter Username and Password!')
    }
  });

  router.get('/authentic', jwtMW, (req, res) => {
    res.send({status:'user'});
  });

  router.get('/contents', jwtMW, (req, res) => {
    connection.query('SELECT * FROM tbl_content ORDER BY id DESC', function (err, rows, ) {
      if (err) throw err
      res.send(rows)
    })
  })

  router.get('/content/:id', jwtMW, (req, res) => {
    const id = req.params.id
    connection.query(`SELECT * FROM tbl_content WHERE id=${id}`, function (err, rows, fields) {
      if (err) throw err
      res.send(rows)
    })
  })

  router.post('/content', jwtMW, (req, res) => {
    const caption = req.body.caption
    const url = req.body.url
    connection.query(`INSERT INTO tbl_content (caption, url) values ("${caption}","${url}")`, function (err, rows, fields) {
      if (err) throw err
      res.send(rows)
    })
  })

  router.patch('/content/:id', jwtMW, (req, res) => {
    const id = req.params.id
    const caption = req.body.caption
    const url = req.body.url
    connection.query(`UPDATE tbl_content SET caption="${caption}", url="${url}" WHERE id=${id}`, function (err, rows, fields) {
      if (err) throw err
      res.send(rows)
    })
  })

  router.delete('/content/:id', jwtMW, (req, res) => {
    const id = req.params.id
    connection.query(`DELETE FROM tbl_content WHERE id=${id}`, function (err, rows, fields) {
      if (err) throw err
      res.send(rows)
    })
  })
})

app.listen('4200', () => console.log('App Running!'))