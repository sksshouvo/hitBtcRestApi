var MongoClient = require('mongodb').MongoClient;
const express = require('express')
const app = express()
const port = 3000
var url = "mongodb://localhost:27017/";

app.get('/', function(req, res){
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
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });