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
var vs = require('./videoresize');
const { json } = require("express");

//redis
const client = redis.createClient('redis://localhost:6379');
//ejs
app.set("view engine", "ejs");
//body parser
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
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
    if (file.mimetype === 'video/quicktime' || file.mimetype === 'video/mp4' ) {
      cb(null, 'video')
    } else if (file.mimetype === 'image/jpeg') {
      cb(null, 'uploads');
    } else {
      console.log(file.mimetype)
      cb({ error: 'Mime type not supported' })
    }
  }
})
var upload1 = multer([{ storage: storage }]);
//if does not exists create a key all/allblogs with empty array
crudRedis.get("all");
crudRedis.get("allblogs");
//crudRedis.createPreviewVideo("./video/video1.mp4","./video/v3.mp4",4);
//delete a file with given path 
function deleteFile(path) {
  try {
    fs.unlinkSync(path);
    console.log('successfully deleted ' + path);
  } catch (err) {
    // handle the error
  }
}
//**************GIRLS*********************
//upload new girl
var upload1 = multer({ storage });
app.get("/newgirl",(req,res)=>{
  res.render("newgirl")
})
app.post('/upload', upload1.any(), (req, res) => {
  //give unique id 
  let id = uuid();
  let data = req.body;
  data.id = id;
  data.reviews = [];
  crudRedis.add("all", data);
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
      sharp("uploads/" + data.id + "p1.jpg").resize(236, 279).jpeg({ quality: 70 }).toFile("uploads/" + data.id + "-photo1-thumb.jpg", (err, info) => {
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
      sharp("uploads/" + data.id + "p2.jpg").resize(236, 279).jpeg({ quality: 70 }).toFile("uploads/" + data.id + "-photo2-thumb.jpg", (err, info) => {
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

      sharp("uploads/" + data.id + "p3.jpg").resize(236, 279).jpeg({ quality: 70 }).toFile("uploads/" + data.id + "-photo3-thumb.jpg", (err, info) => {
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
app.post('/review', upload1.any(), (req, res) => {
  let d = req;
  crudRedis.addReview(req.body.girlID, { name: req.body.name, email: req.body.email, star: req.body.stars, feedback: req.body.feedback });
  res.send(req.body);
})
//getting all girls
app.get("/", (req, res) => {
 var allGirls;
  client.get("all", (err, val) => {
     allGirls = JSON.parse(val);
     console.log(allGirls)
     function random(min, max) {
      var n = [];
      if(allGirls.length>0)
     {
      for (var i = 0; i <= 3; i++) {
        let index = Math.floor(Math.random() * max) + min;
        n.push({
          id: allGirls[index].id,
          name: allGirls[index].name,
          years: allGirls[index].years,
          hobby: allGirls[index].hobby,
        });
      }
      return n;
     } 
    }
    client.get("allblogs",(err,valblog)=>{
      var allBlogs = JSON.parse(valblog);
      allGirls.similarGirls = random(0, allGirls.length)
      allGirls.allBlogs = allBlogs;
      console.log(allGirls.similarGirls)
     res.render("home", { allGirls: allGirls });
     });
   
  });
});
//serving girl with particular id
app.get("/all/:id", (req, res) => {
  var idG = req.params.id;
  client.get("all", (err, val) => {
    //random girls
    let jsonall = JSON.parse(val);
    function random(min, max) {
      var n = [];
      for (var i = 0; i <= 3; i++) {
        let index = Math.floor(Math.random() * max) + min;
        n.push({
          id: jsonall[index].id,
          name: jsonall[index].name,
          years: jsonall[index].years,
          hobby: jsonall[index].hobby,
        });
      }
      return n;
    }
    var jsonArray = JSON.parse(val).filter((obj) => { return obj.id == idG });
    var json = jsonArray[0];
    json.similarGirls = random(0, jsonall.length)
   // console.log(json)
    res.render("girl", { json: json });
  })
});
//**************BLOG******************* */
//getting blog
app.get("/blog", (req, res) => {
  client.get("all", (err, val) => {
    //random girls
    let jsonall = JSON.parse(val);
    function random(min, max) {
      var n = [];
      for (var i = 0; i < 3; i++) {
        let index = Math.floor(Math.random() * max) + min;
        n.push({
          id: jsonall[index].id,
          name: jsonall[index].name,
          years: jsonall[index].years,
          hobby: jsonall[index].hobby,
        });
      }
      return n;
    } 
  client.get("allblogs", (err, val) => {
    var allBlogs = JSON.parse(val);
    allBlogs.similarGirls = random(0, jsonall.length);
    console.log(allBlogs.similarGirls);
    res.render("blog", { allBlogs: allBlogs });
  });
});
});
//serving blog with particular id
app.get("/blog/:id", (req, res) => {
  var idB = req.params.id;
  client.get("all", (err, val) => {
    //random girls
    let jsonall = JSON.parse(val);
    function random(min, max) {
      var n = [];
      for (var i = 0; i < 3; i++) {
        let index = Math.floor(Math.random() * max) + min;
        n.push({
          id: jsonall[index].id,
          name: jsonall[index].name,
          years: jsonall[index].years,
          hobby: jsonall[index].hobby,
        });
      }
      return n;
    } 
    client.get("allblogs",(err,value)=>{
    var jsonArray = JSON.parse(value).filter((obj) => { return obj.id.trim() == idB.trim() });
    var json = jsonArray[0];
   
    json.similarGirls = random(0, jsonall.length);
   // json.avgstar = avgString;
   // console.log(json)
    res.render("blogContent", { json: json });
    })
});
});
//getting new blog
app.get("/newblog",(req,res)=>{
  res.render("newblog");
})
//uploading blog
app.post('/uploadblog', upload1.any(), (req, res) => {
  //give unique id 
  let id = uuid();
  let data = req.body;
  data.id = id;
  data.messages = [];
  console.log(data);
  crudRedis.addBlog("allblogs", data);
  //rename blog photo
  fs.rename(req.files[0].path, "./blogs/" + data.id + "b0.jpg", (err) => {
    console.log(err);
  });
  sharp("blogs/" + data.id + "b0.jpg").resize(195, 195).jpeg({ quality: 90 }).toFile("blogs/" + data.id + "-preview.jpg", (err, info) => {
    if (err) {
      console.log(err);
    } else {
     // deleteFile("./blogs/" + data.id + "b0.jpg");
    }
  })
  //resize blog photo
  sharp.cache(false);
  sharp("blogs/" + data.id + "b0.jpg").resize(750, 350).jpeg({ quality: 90 }).toFile("blogs/" + data.id + ".jpg", (err, info) => {
    if (err) {
      console.log(err);
    } else {
      deleteFile("./blogs/" + data.id + "b0.jpg");
    }
  })
  res.send(req.body);
});
//uploading message to blog
app.post('/blogmessage', upload1.any(), (req, res) => {
  let d = req;
  crudRedis.addblogMessage(req.body.blogID, { name: req.body.name, email: req.body.email, star: req.body.stars, message: req.body.message });
  res.send(req.body);
})
//*******************VIDEOS *********************/
//getting all videos
app.get("/allvideos" ,(req,res)=>{
  client.get("all", (err, val) => {
    var allGirls = JSON.parse(val);
    res.render("allvideos", { allGirls: allGirls });
  });
})
app.get("/allvideos/:id", (req, res) => {
  var idB = req.params.id;
  client.get("all", (err, val) => {
    //random girls
    let jsonall = JSON.parse(val);
    function random(min, max) {
      var n = [];
      for (var i = 0; i < 3; i++) {
        let index = Math.floor(Math.random() * max) + min;
        n.push({
          id: jsonall[index].id,
          name: jsonall[index].name,
          years: jsonall[index].years,
          hobby: jsonall[index].hobby,
        });
      }
      return n;
    } 
    client.get("all",(err,value)=>{
    var jsonArray = JSON.parse(value).filter((obj) => { return obj.id.trim() == idB.trim() });
    var json = jsonArray[0];
   
    json.similarGirls = random(0, jsonall.length);
   // json.avgstar = avgString;
   // console.log(json)
    res.render("videoContent", { json: json });
    })
});
});

//**********Girl Info *********************/
app.get("/girlinfo/:id",(req,res)=>{
  var girlID = req.params.id;
  client.get("all",(err,value)=>{
    var jsonArray = JSON.parse(value).filter((obj) => { return obj.id.trim() == girlID.trim() });
    var json = jsonArray[0];
    res.render("girlInfo.ejs",{json:json});
  });
});
app.post("/uploadinfo/:id",upload1.any(),(req,res)=>{
  let girlID = req.params.id;
  let info = JSON.parse(JSON.stringify( req.body));
  crudRedis.updateGirlInfo(girlID,info);
  res.send(req.body);
});
app.post("/uploadphotos/:id",upload1.any(),(req,res)=>{
  let girlID = req.params.id;
  for (let index = 0; index < req.files.length; index++) {
    if (index == 0) {
      //rename profile photo
      fs.rename(req.files[0].path, "./uploads/" + girlID + "p0.jpg", (err) => {
        console.log(err);
      });
      //resize profile photo
      sharp.cache(false);
     // const {orientation} = sharp("uploads/" + girlID+ "p0.jpg").metadata();
      // console.log({orientation});
      sharp("uploads/" + girlID+ "p0.jpg").rotate().resize(263, 310).jpeg({ quality: 90 }).toFile("uploads/" + girlID + "-profile.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          // deleteFile("./uploads/" + data.id + "p0.jpg");
        }
      })
      sharp("uploads/" + girlID + "p0.jpg").rotate().resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" +girlID + "-profile-detail.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          deleteFile("./uploads/" + girlID+ "p0.jpg");
        }
      })
    }
    //photo 1
    if (index == 1) {
      //rename profile photo
      fs.rename(req.files[1].path, "./uploads/" + girlID + "p1.jpg", (err) => {
        console.log(err);
      });
      //resize profile photo 
      sharp.cache(false);
      sharp("uploads/" + girlID + "p1.jpg").rotate().resize(236, 279).jpeg({ quality: 70 }).toFile("uploads/" + girlID + "-photo1-thumb.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          // deleteFile("./uploads/" + data.id + "p1.jpg")        
        }
      })
      sharp("uploads/" + girlID + "p1.jpg").rotate().resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + girlID + "-photo1.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          deleteFile("./uploads/" + girlID+ "p1.jpg")
        }
      })
    }
    //photo 2
    if (index == 2) {
      //rename profile photo
      fs.rename(req.files[2].path, "./uploads/" + girlID + "p2.jpg", (err) => {
        console.log(err);
      });
      //resize profile photo
      sharp.cache(false);
      sharp("uploads/" + girlID+ "p2.jpg").rotate().resize(236, 279).jpeg({ quality: 70 }).toFile("uploads/" + girlID + "-photo2-thumb.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          // deleteFile("./uploads/" + data.id + "p2.jpg")   
        }
      })
      sharp("uploads/" + girlID+ "p2.jpg").rotate().resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + girlID + "-photo2.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          deleteFile("./uploads/" + girlID + "p2.jpg")
        }
      })
    }
    //photo 2
    if (index == 3) {
      //rename profile photo
      fs.rename(req.files[3].path, "./uploads/" + girlID+ "p3.jpg", (err) => {
        console.log(err);
      });
      //resize profile photo
      sharp.cache(false);

      sharp("uploads/" + girlID + "p3.jpg").rotate().resize(236, 279).jpeg({ quality: 70 }).toFile("uploads/" + girlID + "-photo3-thumb.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          //  deleteFile("./uploads/" + data.id + "p3.jpg")        
        }
      })
      sharp("uploads/" + girlID+ "p3.jpg").rotate().resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + girlID + "-photo3.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          deleteFile("./uploads/" + girlID + "p3.jpg")
        }
      })
    }
  }
  res.send(req.body);
});
app.post("/uploadvideo/:id",upload1.any(),(req,res)=>{
  let girlID = req.params.id;
  console.log(req.files[0])
 
  fs.rename(req.files[0].path, "./video/" + girlID + ".mp4", (err) => {
  if (err)
  console.log(err);
  else
  {
  
  //  vs.videoScale("./video/" + girlID + ".mp4", 770, 577);
  //       console.log("done!!!!!!")
  }
  crudRedis.createPreviewVideo("./video/"+ girlID+ ".mp4","./video/"+ girlID+ "-preview.mp4",4);
  res.send("video uploaded");
  });
})
//*************Login************/
app.get("/login/",(req,res)=>{
  res.render("login");
});
app.post("/verifylogin/",upload1.any(), (req,res)=>{
let username = req.body.username;
let password = req.body.password;
  client.get("all",(err,val)=>{
    let jsonArray = []
   jsonArray=    JSON.parse(val);
  let filteredArray = jsonArray.filter((item)=>{ return item.username.trim().toLowerCase()==username.trim().toLowerCase() && item.password.trim()==password.trim()})
  console.log(filteredArray)
  res.send(filteredArray[0]);
});
})
//prova
app.get("/stories",(req,res)=>{
  res.render("prova.ejs")
})
//server
app.listen(3000, () => {
  console.log("server started on port 3000");
}); 