
const { json } = require('express');
const redis = require('redis');
const client = redis.createClient('redis://localhost:6379');


exports.add = function (key, value) {
    client.get("all", (err, val) => {
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
            // console.log(temp.id)
            // console.log("ID :" + idKey)   

            if (temp.id.trim() === idKey.trim()) {

                temp.reviews.push(review);
                console.log("temp.id")
            }
            return temp;
        });
        console.log("array")
       // console.log(newArray)
       client.set("all", JSON.stringify(newArray));
      
    });
}
    exports.similarGirls = function () {
        let res1;
      client.get("all",(err,val)=>{
     let json =  JSON.parse(val);
   function random  (min, max){ 
        var n = []; 
        for(var i=0;i<3;i++){ 
       n.push(json[Math.floor(Math.random() * max) + min].id); 
        } 
        return n; 
        }
        let res = random(0,1)
        console.log(res)
        //return res;
        res1 = res;
    })
     return res1;
    }



exports.get = function (key) {
    client.get(key, (err, val) => {
        if (err || val === null)
            client.set(key, "[]")
        else
            console.log("array exists");
            //  console.log(JSON.parse(val))
    });
}
