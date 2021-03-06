require('newrelic');
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const port = process.env.PORT || 3004;
const awsHostName = process.env.AWS_SERVICE_HOSTNAME   ;
const db = require("../database/index.js")
const {postgres} = require('../database/bigMenuData-database-pg.js');
const loaderioVerificationFile = path.resolve(__dirname,'loaderio-61e5cf20ee704110e54838eec5913a8b.txt' );
const loaderioVerificationRedirectFile = path.resolve(__dirname,'loaderio-fa2bb52f901b9877cca95e08101f39e8.txt' );

app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/../public/")));
app.get('/loaderio-fa2bb52f901b9877cca95e08101f39e8', (req, res)=>{
  res.sendFile(loaderioVerificationRedirectFile);
});
app.get('/loaderio-61e5cf20ee704110e54838eec5913a8b', (req, res)=>{
  res.sendFile(loaderioVerificationFile);
});


//will pull all the data from database:
app.get("/menus", (req, res) => {
  postgres.ops.fetchRecordOrigin()
  .then( dbDataRcvd => postgres.ops.format(dbDataRcvd) )
  .then( parseData =>   res.send(parseData))
  .catch( err => res.status(500).send(err))
  });

//pulls 1 menu per id provided in Url:
app.get("/menus/:Id", (req, res) => {
 postgres.ops.fetchRecord(req.params.Id)
  .then(dbDataRcvd =>   postgres.ops.format(dbDataRcvd) )
  .then( parseData =>  res.send(parseData) )
  .catch(err => res.status(500).send(err) );
});

app.put("/updateMenu/:Id", (req, res)=>{
  postgres.ops.update(req.params.Id, req.body)
  .then( () => {res.status(201).end() } )
  .catch( () =>  res.status(500).end());
});


app.delete("/deleteMenu/:Id", (req, res) => {
  postgres.ops.delete(req.params.Id, req.body)
  .then( () => {res.status(201).end() } )
  .catch(res.status(500).end());
});

app.post("/addMenu/:Id", (req, res) => {
  postgres.ops.post(req.params.Id, req.body)
  .then( () => res.status(201).end()   )
  .catch( () => res.status(500).end() )
});

app.get("/:Id", (req, res) => {
  res.sendFile(path.join(__dirname, "/../public/index.html"));
});


app.listen(port, awsHostName  ,  () => {
  console.log(`listening on port http://localhost:${port}`);
});

