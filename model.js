
const redis = require('redis');
const client = redis.createClient('redis://localhost:6379');
exports.add = function (key, value) {
    client.set(key, JSON.stringify(value))


}

exports.get = function (key) {
    client.get(key, (err, val) => {
        if(err || val === null)
        console.log('does not exist');
       else
        console.log(JSON.parse(val));
       });
}
