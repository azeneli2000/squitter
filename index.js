const express = require("express");
const app = express();
const path = require('path');
const crudRedis = require('./model')
const redis = require('redis');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');
//  const {"v4": uuidv4} = require('uuid');

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
    // if (file.mimetype === 'video/quicktime' || file.mimetype === 'video/mp4' ) {
    //   cb(null, 'video')
    // } else if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    //   cb(null, 'uploads');
    // } else {
    //   console.log(file.mimetype)
    //   cb({ error: 'Mime type not supported' })
    // }
    cb(null,'uploads')
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
//serve new girl form
var upload1 = multer({ storage });
app.get("/newgirl",(req,res)=>{
  client.get("all",(err,value)=>{
    if (err)
     console.log(err);
     let usernames = []
    let allGirls =  JSON.parse(value);
    for (let i = 0; i < allGirls.length; i++) {
     usernames.push(allGirls[i].username)
    }
    res.render("newgirl",{usernames : usernames})

  })
})
//upload new girl data
app.post('/upload', upload1.any(), (req, res) => {
console.log("called") ;
 let id = uuid();
  let data = req.body;
  data.id = id;
  data.reviews = [];
  data.storiePath = [];
  data.photoPath = [];

  data.storiePath.push(data.id + "-profile-detail.jpg");
  crudRedis.add("all", data);
//  new directory for the girl
    fs.mkdirSync('./uploads/'+data.id);
    fs.mkdirSync('./uploads/'+data.id + "/profile");
    fs.mkdirSync('./uploads/'+data.id + "/video");
    fs.mkdirSync('./uploads/'+data.id + "/storie");
    fs.mkdirSync('./uploads/'+data.id + "/photos");
    fs.mkdirSync('./uploads/'+data.id + "/thumbs");


    console.log(req.files)
      //rename profile photo
      fs.rename(req.files[0].path, "./uploads/"  + id + "p0.jpg", (err) => {
        console.log(err);
      });
      //resize profile photo
      sharp.cache(false);
     // const {orientation} = sharp("uploads/" + girlID+ "p0.jpg").metadata();
      // console.log({orientation});
      sharp("uploads/" + id+ "p0.jpg").rotate().resize(263, 310).jpeg({ quality: 90 }).toFile("uploads/" + id + "/profile/" + id + "-profile.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          // deleteFile("./uploads/" + data.id + "p0.jpg");
        }
      });
      sharp("uploads/" + id + "p0.jpg").rotate().resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + id + "/storie/" +id + "-profile-detail.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          // deleteFile("./uploads/" + id+ "p0.jpg");
        }
      }); 
      sharp("uploads/" + id + "p0.jpg").rotate().resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + id + "/profile/" +id + "-profile-detail.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          deleteFile("./uploads/" + id+ "p0.jpg");
        }
      })
 
  res.sendStatus(200)
})
//ading review to girl
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
   console.log(json)
    res.render("girlContentNew", { json: json });
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
    function escortsAll(){
		
      let cityStories = [];
      for (let i = 0; i < allGirls.length; i++) {
     
       cityStories.push(allGirls[i].id);
       
      }
      return cityStories;
  }
  let allVideos = escortsAll();
    res.render("videosNew", { allGirls: allVideos});
  });
});

app.get("/allvideos/:city/:gender" ,(req,res)=>{
  var city = req.params.city;
  var gender  = req.params.gender

  client.get("all", (err, val) => {

    var allGirls = JSON.parse(val);
    function escortsByCity(city){
		
      let cityStories = [];
      for (let i = 0; i < allGirls.length; i++) {
       if(allGirls[i].city.toUpperCase()== city.toUpperCase() && allGirls[i].gender.toUpperCase()== gender.toUpperCase()){				
       cityStories.push(allGirls[i].id);
       }
      }
      return cityStories;
  }
    let allEscortsCity= escortsByCity(city);
    console.log(allEscortsCity)
    res.render("videosNew", { allGirls: allEscortsCity });
  });
});

app.get("/allvideos/:city" ,(req,res)=>{
  var city = req.params.city;

  client.get("all", (err, val) => {

    var allGirls = JSON.parse(val);
    function escortsByCity(city){
		
      let cityStories = [];
      for (let i = 0; i < allGirls.length; i++) {
       if(allGirls[i].city.toUpperCase()== city.toUpperCase()){				
       cityStories.push(allGirls[i].id);
       }
      }
      return cityStories;
  }
    let allEscortsCity= escortsByCity(city);
    console.log(allEscortsCity)
    res.render("videosNew", { allGirls: allEscortsCity });
  });
});
app.get("/videos/:gender" ,(req,res)=>{
  console.log("caalled");
  var gender = req.params.gender;
  
console.log("gender : " + gender);
  client.get("all", (err, val) => {

    var allGirls = JSON.parse(val);
    function escortsByGender(gender){
		
      let cityStories = [];
      for (let i = 0; i < allGirls.length; i++) {
       if(allGirls[i].gender.toUpperCase()== gender.toUpperCase()){				
       cityStories.push(allGirls[i].id);
       }
      }
      return cityStories;
  }
    let allEscortsGender= escortsByGender(gender);
    console.log(escortsByGender)
    res.render("videosNew", { allGirls: allEscortsGender });
  });
});
//getting video with id
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
//getting girl info
app.get("/girlinfo/:id",(req,res)=>{
  var girlID = req.params.id;
  client.get("all",(err,value)=>{
    var jsonArray = JSON.parse(value).filter((obj) => { return obj.id.trim() == girlID.trim() });
    var json = jsonArray[0];
    res.render("girlInfo.ejs",{json:json});
  });
});
//uploading girl info
app.post("/uploadinfo/:id",upload1.any(),(req,res)=>{
  let girlID = req.params.id;
  let info = JSON.parse(JSON.stringify( req.body));
  crudRedis.updateGirlInfo(girlID,info);
  res.send(req.body);
});
//uploading profile girl photo
app.post("/uploadphotos/:id",upload1.any(),(req,res)=>{
  let girlID = req.params.id;
  for (let index = 0; index < req.files.length; index++) {
    if (index == 0) {
      //rename profile photo
      fs.rename(req.files[0].path, "./uploads/"  + girlID + "p0.jpg", (err) => {
        console.log(err);
      });
      //resize profile photo
      sharp.cache(false);
     // const {orientation} = sharp("uploads/" + girlID+ "p0.jpg").metadata();
      // console.log({orientation});
      sharp("uploads/" + girlID+ "p0.jpg").rotate().resize(263, 310).jpeg({ quality: 90 }).toFile("uploads/" + girlID + "/profile/" + girlID + "-profile.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          // deleteFile("./uploads/" + data.id + "p0.jpg");
        }
      })
      sharp("uploads/" + girlID + "p0.jpg").rotate().resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + girlID + "/profile/" +girlID + "-profile-detail.jpg", (err, info) => {
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
      sharp("uploads/" + girlID + "p1.jpg").rotate().resize(236, 279).jpeg({ quality: 70 }).toFile("uploads/" + girlID + "/profile/" + girlID + "-photo1-thumb.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          // deleteFile("./uploads/" + data.id + "p1.jpg")
        }
      })
      sharp("uploads/" + girlID + "p1.jpg").rotate().resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + girlID + "/profile/" + girlID + "-photo1.jpg", (err, info) => {
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
      sharp("uploads/" + girlID+ "p2.jpg").rotate().resize(236, 279).jpeg({ quality: 70 }).toFile("uploads/" + girlID + "/profile/" + girlID + "-photo2-thumb.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          // deleteFile("./uploads/" + data.id + "p2.jpg")
        }
      })
      sharp("uploads/" + girlID+ "p2.jpg").rotate().resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + girlID + "/profile/" + girlID + "-photo2.jpg", (err, info) => {
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

      sharp("uploads/" + girlID + "p3.jpg").rotate().resize(236, 279).jpeg({ quality: 70 }).toFile("uploads/" + girlID + "/profile/" + girlID + "-photo3-thumb.jpg", (err, info) => {
        if (err) {
          console.log(err);
        } else {
          //  deleteFile("./uploads/" + data.id + "p3.jpg")
        }
      })
      sharp("uploads/" + girlID+ "p3.jpg").rotate().resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + girlID + "/profile/" + girlID + "-photo3.jpg", (err, info) => {
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
//uploading girls photos
app.post("/uploadthumb/:id",upload1.any(),(req,res)=>{
  let girlID = req.params.id;
  function deletePhotos()
  {
   files = fs.readdirSync("./uploads/" + girlID + "/photos/");
   console.log(files)
    if(files.length>0){
     files.forEach((f)=>{
      fs.unlinkSync("./uploads/" + girlID + "/photos/" + f)
     });
    }
    files = fs.readdirSync("./uploads/" + girlID + "/thumbs/");
   console.log(files)
    if(files.length>0){
     files.forEach((f)=>{
      fs.unlinkSync("./uploads/" + girlID + "/thumbs/" + f)
     });
    }
  }
  function returnArray() {
  var photoPath = []
  Array.from(req.files).forEach((f)=>{
    photoPath.push(f.originalname);
    // fs.rename(f.path, "./uploads/" + girlID + "/photos/" + f.originalname , (err) => {
    //   if (err)
    //   console.log(err);
    //   else
    //   {
    //     console.log(f.originalname)
    //   console.log("Photo uploaded!");
    //   }
    //  });
    sharp.cache(false);
    sharp(f.path).rotate().resize(236, 279).jpeg({ quality: 70 }).toFile("uploads/" + girlID + "/thumbs/" + f.originalname , (err, info) => {
      if (err) {
        console.log(err);
      } else {
        // deleteFile("./uploads/" + data.id + "p1.jpg")
      }
    })
    sharp(f.path).rotate().resize(458, 542).jpeg({ quality: 90 }).toFile("uploads/" + girlID + "/photos/" +f.originalname, (err, info) => {
      if (err) {
        console.log(err);
      } else {
       deleteFile(f.path)
      }
    })
    });
    return photoPath;
  }
  deletePhotos();
  s =returnArray();
  crudRedis.updateGirlThumb(girlID,s);
  res.send("photo uploaded");
  });

//uploading girl viedo
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
});
//***************Stories ********************************/
//uploading girl stories
app.post("/uploadstorie/:id",upload1.any(),(req,res)=>{
let girlID = req.params.id;
function deleteStoreies()
{
 files = fs.readdirSync("./uploads/" + girlID + "/storie/");
 console.log(files)
  if(files.length>0){
   files.forEach((f)=>{
    fs.unlinkSync("./uploads/" + girlID + "/storie/" + f)
   });
  }

}
function returnArray() {
var storiesPath = []
Array.from(req.files).forEach((f)=>{
  storiesPath.push(f.originalname);
  fs.rename(f.path, "./uploads/" + girlID + "/storie/" + f.originalname , (err) => {
    if (err)
    console.log(err);
    else
    {
      console.log(f.originalname)
    console.log("Storie uploaded!");
    }
   });
  });
  return storiesPath;
}
deleteStoreies();
s =returnArray();
crudRedis.updateGirlStory(girlID,s);
res.send("storie uploaded");
});
//*************Login************/
//getting login view
app.get("/login/",(req,res)=>{
  res.render("login");
});
//verifying login credentials
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
app.listen(3003, () => {
  console.log("server started on port 3000");
});