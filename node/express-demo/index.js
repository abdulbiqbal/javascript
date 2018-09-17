var express = require('express');
var app = express();

app.get('/a', function(req, res){
   res.send("Hello world! A");
   
   console.log(req.constructor);
   
   /*for(x in req){
	   console.log(x);
   }*/
});

app.get('/*', function(req, res){
    console.log(req.originalUrl);
    console.log(req.query.id);
    setTimeout(function(){
        
        res.send(new Date());
    },5000);
   
});

app.listen(3000);