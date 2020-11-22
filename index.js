const express = require("express");
const app = express();
const path = require('path');
const crudRedis = require('./model')
const redis = require('redis');
const client = redis.createClient('redis://localhost:6379');


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/")));

crudRedis.add('a',
  {
    id: 1,
    name: 'eva',
    years: '30',
    hobby: 'dance',
    height: 175,
    weight: 60,
    chest: 2,
    priceNight: 1000,
    priceHour: 100,
    priceDay: 2000,
    aboutMe: 'kasdjhfkjsdhfalsdh dasfkjadsfja sdjfdjasgfjhsgfa sljhfgdkjasgfkjdhasgfkjhagsd sdfjhgdasjhgfkjhasdgfsdkjgfas',
    profilePhotoPath: 'img/girl.jpg',
    photo1Path: '',
    photo2path: '',
    photo3Path: ''

  });
var s;


app.get("/", (req, res) => {
  res.render("home");
});
app.get("/:id", (req, res) => { 
  var idG = req.params.id;
  client.get(idG,(err,val)=>{
    var json = JSON.parse(val);
     
    res.render("girl",{json:json});
    })
  
});
app.listen(3000, () => {
  console.log("server started on port 3000");
});