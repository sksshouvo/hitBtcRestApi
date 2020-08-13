var W3CWebSocket = require('websocket').w3cwebsocket; 
var MongoClient = require('mongodb').MongoClient;
const express = require('express')
const app = express()
const port = 3000
var url = "mongodb://localhost:27017/";
var client = new W3CWebSocket('wss://api.hitbtc.com/api/2/ws', '');
var client2 = new W3CWebSocket('wss://api.hitbtc.com/api/2/ws', '');
var count = 0; 
var count2 = 0; 
// data entry function
var data_entry = function(tt){
    MongoClient.connect(url,{ useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("hitbtc");
        //var myobj = { symbol: value.symbol, timestamp: value.timestamp, volumeQuote:value.volumeQuote, volume:value.volume, high:value.high, low:value.low, open:value.open, last:value.last, bid:value.bid, ask:value.ask};
        dbo.collection("tickers").insertOne(tt, function(err, res) {
          if (err) throw err;
          //console.log(key+" document inserted");
        });
      }); 
}



client.onerror = function() {
    console.log('Connection Error');
};
client2.onerror = function() {
  console.log('Connection Error');
};
 
client.onopen = function() {
    console.log('WebSocket Client Connected');
 
    function sendNumber() {
        if (client.readyState === client.OPEN) {
            var toto = '{"method": "subscribeTicker","params": {"symbol": "ETHBTC"},"id": 123}';
            client.send(toto);
            setTimeout(sendNumber, 1000);
        }
    }
    sendNumber();
};

client2.onopen = function() {
  console.log('WebSocket Client Connected');

  function sendNumber2() {
      if (client2.readyState === client2.OPEN) {
          var toto = '{"method": "subscribeTicker","params": {"symbol": "BTCUSD"},"id": 123}';
          client2.send(toto);
          setTimeout(sendNumber2, 1000);
      }
  }
  sendNumber2();
};
 
client.onclose = function() {
    console.log('echo-protocol Client Closed');
};
client2.onclose = function() {
  console.log('echo-protocol Client Closed');
};
 
client.onmessage = function(e) {
count++;
    if (typeof e.data === 'string') {
       var rr = JSON.parse(e.data);
       if(rr.params!=undefined){
        data_entry(rr.params);
        console.log(rr.params.symbol+" no data "+ count);
    }
     
    }
};
client2.onmessage = function(e) {
  count2++;
      if (typeof e.data === 'string') {
        var rr = JSON.parse(e.data);
        if(rr.params!=undefined){
            data_entry(rr.params);
            console.log(rr.params.symbol+" no data "+ count2);
        }
        
      }
  };
  app.get('/', (req, res) => {
    MongoClient.connect(url,{ useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("hitbtc");
      dbo.collection("tickers").aggregate([
        {
          $sort:{
            timestamp:-1
          }
        }
        ,{
          $group:{
            _id:{symbol:"$symbol"},
            id:{$first:"$_id"},
            timestamp:{$first:"$timestamp"},
            ask:{$first:"$ask"},
            bid:{$first:"$bid"},
            last:{$first:"$last"},
            open:{$first:"$open"},
            low:{$first:"$low"},
            high:{$first:"$high"},
            volume:{$first:"$volume"},
            volumeQuote:{$first:"$volumeQuote"},
            symbol:{$first:"$symbol"}
            
          }
        }
       
      ]).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          res.send(result);
          db.close();
        });
  }); 
  })
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })