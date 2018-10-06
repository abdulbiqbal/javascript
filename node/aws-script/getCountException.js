var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var dynamodb = new AWS.DynamoDB();

function scan(ex) {
    var params = {
        /* ExpressionAttributeNames: {
            '#e': 'exception',
          }, 
        ExpressionAttributeValues: {
         ":v1": {
           S: ex
          }
        }, */
        //FilterExpression: "#e= :v1", 
        //ProjectionExpression: "hostName", 
        ScanFilter: {
            "exception": {
                ComparisonOperator: "CONTAINS",
                AttributeValueList: [
                    {
                        S: ex
                    }
                ]
            }
        },

        TableName: "SHADOW_MODE_ERROR_LOG"
    };
    var count = 0;
    var scanExecute = function () {
        dynamodb.scan(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log(data.Count);           // successful response

                count+=data.Count;
                if (data.LastEvaluatedKey) {
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    scanExecute();
                } else {
                    console.log(`Total Count ${count}`);
                }
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
            }
        });
    }
    scanExecute();
}

scan(process.argv[2]);