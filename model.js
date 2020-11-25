
const { json } = require('express');
const redis = require('redis');
const client = redis.createClient('redis://localhost:6379');


exports.add = function (key, value) {
   client.get("all",(err,val)=>{
    var json = JSON.parse(val);
     json.push(value);
    client.set(key, JSON.stringify(json));
   });


}

exports.get = function (key) {
    client.get(key, (err, val) => {
        if(err || val === null)
        console.log('does not exist');
       else
        console.log(JSON.parse(val));
       });
}
