var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var dynamodb = new AWS.DynamoDB();


function getItem () {
var params = {
    RequestItems: {
     "SHADOW_MODE_ERROR_LOG": {
       Keys: [
          {
         "uid": {
           S: "749c62aa-0cd7-4514-9585-f983e5036371"
          },
          "operation": {
            "NULL": true
           }
        }
       ], 
       //ProjectionExpression: "hostName"
      }
    }
   };
dynamodb.batchGetItem(params, function (err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data.Responses.SHADOW_MODE_ERROR_LOG);           // successful response
});
}

function query(uid) {
    var params = {
        ExpressionAttributeValues: {
         ":v1": {
           S: uid
          }
        }, 
        KeyConditionExpression: "uid = :v1", 
        //ProjectionExpression: "hostName", 
        TableName: "SHADOW_MODE_ERROR_LOG"
       };
       dynamodb.query(params, function(err, data) {
         if (err) console.log(err, err.stack); // an error occurred
         else     console.log(data.Items);           // successful response
         /*
         data = {
          ConsumedCapacity: {
          }, 
          Count: 2, 
          Items: [
             {
            "SongTitle": {
              S: "Call Me Today"
             }
           }
          ], 
          ScannedCount: 2
         }
         */
       });
}

query(process.argv[2]);