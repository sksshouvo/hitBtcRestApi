const https = require('https');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var express  = require('express');
var app = express();

setInterval(() => {
  https.get('https://api.hitbtc.com/api/2/public/ticker', (resp) => {
    let data = '';
  
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      var tt = JSON.parse(data);
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("cryptoCurrency");
        //var myobj = { symbol: value.symbol, timestamp: value.timestamp, volumeQuote:value.volumeQuote, volume:value.volume, high:value.high, low:value.low, open:value.open, last:value.last, bid:value.bid, ask:value.ask};
        dbo.collection("tickers").insertMany(tt, function(err, res) {
          if (err) throw err;
          //console.log(key+" document inserted");
        });
      }); 
      console.log(tt.length+" document inserted");
    });
  
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

}, 5000);
app.listen(3000);