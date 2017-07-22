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
   res.send("Hello world! B");
});

app.listen(3000);