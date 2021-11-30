
const { json } = require('express');
const redis = require('redis');
const client = redis.createClient('redis://localhost:6379');
var ffmpeg = require('fluent-ffmpeg');

exports.add = function (key, value) {
    client.get("all", (err, val) => {
        var json = JSON.parse(val);
        json.push(value);
        client.set(key, JSON.stringify(json));
    });
}

exports.updateGirlInfo = function (idKey, info) {
  client.get("all", (err, val) => {  
    console.log(info)  ;
    var jsonAll = JSON.parse(val);
var newArray= jsonAll.map(item => {
        var temp = Object.assign({}, item);
        if (temp.id.trim() === idKey.trim()) {
            temp.name = info.name;
            temp.years = info.years;
            temp.hobby = info.hobby;
            temp.height = info.height;
            temp.weight = info.weight;
            temp.cest = info.cest;
            temp.pricenight = info.pricenight;
            temp.pricehour = info.pricehour;
            temp.priceday = info.priceday;
            temp.country = info.country;
            temp.about = info.about;

            console.log("temp.id")
       //changig avg stars
     
        }
        return temp;
    });
    console.log(newArray)
   client.set("all", JSON.stringify(newArray));
  
});
}


exports.updateGirlStory = function (idKey, info) {
  client.get("all", (err, val) => {  
    var jsonAll = JSON.parse(val);
var newArray= jsonAll.map(item => {
        var temp = Object.assign({}, item);
        if (temp.id.trim() === idKey.trim()) {
            temp.storiePath=info;
          //  console.log("temp.id")
     
        }
        return temp;
    });
   client.set("all", JSON.stringify(newArray));
  
});
}

exports.updateGirlThumb = function (idKey, info) {
  client.get("all", (err, val) => {  
    var jsonAll = JSON.parse(val);
var newArray= jsonAll.map(item => {
        var temp = Object.assign({}, item);
        if (temp.id.trim() === idKey.trim()) {
            temp.photoPath=info;
          //  console.log("temp.id")
     
        }
        return temp;
    });
   client.set("all", JSON.stringify(newArray));
  
});
}

exports.addBlog = function (key, value) {
    client.get("allblogs", (err, val) => {
        var json = JSON.parse(val);
        json.push(value);
        client.set(key, JSON.stringify(json));
    });


}

exports.addReview = function (idKey, review) {
    client.get("all", (err, val) => {  
        console.log(review)  ;
        var jsonAll = JSON.parse(val);
   var newArray= jsonAll.map(item => {
            var temp = Object.assign({}, item);
            if (temp.id.trim() === idKey.trim()) {
                temp.reviews.push(review);
                console.log("temp.id")
           //changig avg stars
         
            }
            return temp;
        });
        console.log("array")
       client.set("all", JSON.stringify(newArray));
      
    });
}

exports.addblogMessage = function (idKey, message) {
    client.get("allblogs", (err, val) => {  
        var jsonAll = JSON.parse(val);
      console.log("array all maess")
        console.log(jsonAll.messages)  ;

   var newArray= jsonAll.map(item => {
            var temp = Object.assign({}, item);
            if (temp.id.trim() === idKey.trim()) {
                temp.messages.push(message);
                //changing avg
                    let tot_stars =0;
                    for (let index = 0; index < temp.messages.length; index++) {
                        tot_stars = parseInt( temp.messages[index].star) + parseInt( tot_stars);
                    };
                    var avg = tot_stars/temp.messages.length;
                    var avgString = avg.toString()
                    if(avgString.length>1)
                    {
                        avgString = avgString.substring(0,3).slice(0, -2) + '_5';;
                    }
            temp.avg = avgString;
            }
            return temp;
        });
        
        console.log(newArray.messages)
       client.set("allblogs", JSON.stringify(newArray));
      
    });
}

exports.get = function (key) {
    client.get(key, (err, val) => {
        if (err || val === null){
            
            client.set(key, "[]")
            console.log("created")
        }
        else
            console.log("array exists");
    });
}


exports.createPreviewVideo = async function  createFragmentPreview  (
    inputPath,
    outputPath,
    fragmentDurationInSeconds = 4,
  ) {
    return new Promise(async (resolve, reject) => {
      const { durationInSeconds: videoDurationInSeconds } = await getVideoInfo(
        inputPath,
      );
  
      const startTimeInSeconds = getStartTimeInSeconds(
        videoDurationInSeconds,
        fragmentDurationInSeconds,
      );
  
      return ffmpeg()
        .input(inputPath)
        .inputOptions([`-ss ${startTimeInSeconds}`])
        .outputOptions([`-t ${fragmentDurationInSeconds}`])
        .noAudio()
        .size("458x542")        //220x165
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  };
  const getStartTimeInSeconds = (
    videoDurationInSeconds,
    fragmentDurationInSeconds,
  ) => {
    // by subtracting the fragment duration we can be sure that the resulting
    // start time + fragment duration will be less than the video duration
    const safeVideoDurationInSeconds =
      videoDurationInSeconds - fragmentDurationInSeconds;
  
    // if the fragment duration is longer than the video duration
    if (safeVideoDurationInSeconds <= 0) {
      return 0;
    }
  
    return getRandomIntegerInRange(
      0.25 * safeVideoDurationInSeconds,
      0.75 * safeVideoDurationInSeconds,
    );
  };
  
  const getRandomIntegerInRange = (min, max) => {
    const minInt = Math.ceil(min);
    const maxInt = Math.floor(max);
  
    return Math.floor(Math.random() * (maxInt - minInt + 1) + minInt);
  };

  const getVideoInfo = (inputPath) => {
    return new Promise((resolve, reject) => {
      return ffmpeg.ffprobe(inputPath, (error, videoInfo) => {
        if (error) {
          return reject(error);
        }
  
        const { duration, size } = videoInfo.format;
  
        return resolve({
          size,
          durationInSeconds: Math.floor(duration),
        });
      });
    });
  };