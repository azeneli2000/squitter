const express = require("express");
const app = express();
const path = require('path');
const crudRedis = require('./model')
const redis = require('redis');

//redis
const client = redis.createClient('redis://localhost:6379');
//ejs
app.set("view engine", "ejs");
//path
app.use(express.static(path.join(__dirname, "/")));

client.hset("3", "emri", "zenel" , "mbiemmri" , "Zeneli",(err,reply)=>{console.log(reply)} );
//client.set('all', JSON.stringify([]));
var a= client.scan(0,(err,val)=>{client.hgetall(val[1][1]),(err,val)=>console.log(val) });
console.log(a);
// adding new girl
 
crudRedis.add('all',
  {
      id: 3,
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
      profilePhotoPath: 'img/girl2.jpg',
      photo1Path: '',
      photo2path: '',
      photo3Path: ''

    });


//getting all girls
app.get("/", (req, res) => {
client.get("all", (err, val) => {
      var allGirls = JSON.parse(val);
      res.render("home", {allGirls : allGirls});
    });
  })
//serving model with particular id
app.get("/:id", (req, res) => {
  var idG = req.params.id;
  client.get("all", (err, val) => {
    var jsonArray = JSON.parse(val).filter((obj)=>{ return obj.id==idG} );
    console.log(jsonArray);
    var json = jsonArray[0];
    console.log(json)
   // console.log(jsonArray[0])
    res.render("girl", { json: json });
  })

});
app.listen(3000, () => {
  console.log("server started on port 3000");
});