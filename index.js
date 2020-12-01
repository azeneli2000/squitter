const express = require("express");
const app = express();
const path = require('path');
const crudRedis = require('./model')
const redis = require('redis');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');
const sharp = require('sharp');

//redis
const client = redis.createClient('redis://localhost:6379');
//ejs
app.set("view engine", "ejs");
// app.use(express.json());
// app.use(bodyParser.json());

//body parser
//app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
// app.use(express.urlencoded({extended: true}));
//path
app.use(express.static(path.join(__dirname, "/")));

app.use(function (req, res, next) {


  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', "*");

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  //res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return next();
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === 'audio/mp3') {
      cb(null, 'songs')
    } else if (file.mimetype === 'image/jpeg') {
      cb(null, 'uploads');
    } else {
      console.log(file.mimetype)
      cb({ error: 'Mime type not supported' })
    }
  }
})


var upload1 = multer([{ storage: storage }]);
//if does not exists create a key all with emty array
crudRedis.get("all");

//delete a file with given path 
function deleteFile(path) {
  try {
    fs.unlinkSync(path);
    console.log('successfully deleted ' + path);
  } catch (err) {
    // handle the error
  }
}
//upload new girl
var upload1 = multer({ storage });
app.post('/upload', upload1.any(), (req, res) => {
  //give unique id 
  let id = uuid();
  let data = req.body; 
  data.id = id;
  data.reviews = [];
  crudRedis.add("all",data);
  for (let index = 0; index < req.files.length; index++) {
    if (index == 0) {
      //rename profile photo
      fs.rename(req.files[0].path, "./uploads/" + data.id + "p0.jpg", (err) => {
        console.log(err);
      });
      //resize profile photo
      sharp.cache(false);
      sharp("uploads/" + data.id + "p0.jpg").resize(263, 310).jpeg({ quality: 90 }).toFile("uploads/" + data.id + "-profile.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
         // deleteFile("./uploads/" + data.id + "p0.jpg");
        }
      })
      sharp("uploads/" + data.id + "p0.jpg").resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + data.id + "-profile-detail.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          deleteFile("./uploads/" + data.id + "p0.jpg");
        }
      })
    }
    //photo 1
    if (index == 1) {
      //rename profile photo
      fs.rename(req.files[1].path, "./uploads/" + data.id + "p1.jpg", (err) => {
        console.log(err);
      });
      //resize profile photo 
      sharp.cache(false);
      sharp("uploads/" + data.id + "p1.jpg").resize(236,279).jpeg({ quality: 70 }).toFile("uploads/" + data.id + "-photo1-thumb.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          // deleteFile("./uploads/" + data.id + "p1.jpg")        
        }
      })
      sharp("uploads/" + data.id + "p1.jpg").resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + data.id + "-photo1.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          deleteFile("./uploads/" + data.id + "p1.jpg")
        }
      })
    }
    //photo 2
    if (index == 2) {
      //rename profile photo
      fs.rename(req.files[2].path, "./uploads/" + data.id + "p2.jpg", (err) => {
        console.log(err);
      });
      //resize profile photo
      sharp.cache(false);
      sharp("uploads/" + data.id + "p2.jpg").resize(236,279).jpeg({ quality: 70 }).toFile("uploads/" + data.id + "-photo2-thumb.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          // deleteFile("./uploads/" + data.id + "p2.jpg")   
        }
      })
      sharp("uploads/" + data.id + "p2.jpg").resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + data.id + "-photo2.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          deleteFile("./uploads/" + data.id + "p2.jpg")
        }
      })
    }
    //photo 2
    if (index == 3) {
      //rename profile photo
      fs.rename(req.files[3].path, "./uploads/" + data.id + "p3.jpg", (err) => {
        console.log(err);
      });
      //resize profile photo
      sharp.cache(false);

      sharp("uploads/" + data.id + "p3.jpg").resize(236,279).jpeg({ quality: 70 }).toFile("uploads/" + data.id + "-photo3-thumb.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          //  deleteFile("./uploads/" + data.id + "p3.jpg")        
        }
      })
      sharp("uploads/" + data.id + "p3.jpg").resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + data.id + "-photo3.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          deleteFile("./uploads/" + data.id + "p3.jpg")
        }
      })
    }
  }
  res.send(req.body);
})

//aading review to girl
app.post('/review',upload1.any(),(req,res)=>
{
  let d= req;
crudRedis.addReview(req.body.girlID,{name :req.body.name,email : req.body.email ,star : req.body.stars,feedback : req.body.feedback}); 
res.send(req.body);
})


//getting all girls
app.get("/", (req, res) => {
  client.get("all", (err, val) => {
    var allGirls = JSON.parse(val);
    res.render("home", { allGirls: allGirls });
  });
});
//serving model with particular id
app.get("/:id", (req, res) => {
  var idG = req.params.id;
  //console.log(idG )
  client.get("all", (err, val) => {
//random girls
let jsonall =  JSON.parse(val);
function random  (min, max){ 
     var n = []; 
     for(var i=0;i<3;i++){ 
       let index = Math.floor(Math.random() * max) + min;
    n.push({ id : jsonall[index].id,
      name : jsonall[index].name,
      years : jsonall[index].years,
      hobby : jsonall[index].hobby,
    }); 
     } 
     return n; 
     }
    
    var jsonArray = JSON.parse(val).filter((obj) => { return obj.id == idG });
    //console.log(jsonArray);
    var json = jsonArray[0];
    // console.log(json.reviews[0].name)
    //console.log(random(0,1));
  json.similarGirls = random(0,jsonall.length)
   console.log(json)
    // console.log(jsonArray[0])
    res.render("girl", { json: json });
  });
});
app.listen(3000, () => {
  console.log("server started on port 3000");
}); 