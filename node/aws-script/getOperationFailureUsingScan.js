var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var dynamodb = new AWS.DynamoDB();

function scan(ops) {
    var params = {
        ExpressionAttributeNames: {
            '#o': 'operation',
            '#t': 'time',
          }, 
        ExpressionAttributeValues: {
         ":v1": {
           S: ops
          },
          ":v2": {
              //26-Sep-2018 08:45
            S: "2018-10-05T07:00:00.000Z"
            //S: "2018-10-02T07:00:00.000Z"
           }
        },
        FilterExpression: "#o= :v1 and #t > :v2", 

        TableName: "SHADOW_MODE_ERROR_LOG"
    };
    var count = 0;
    var fs = require('fs');
    var wstream = fs.createWriteStream('submit-iap.csv');
    var scanExecute = function () {
        dynamodb.scan(params, function (err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
                wstream.close();
            }
            else {
                           // successful response
                data.Items.forEach(item => {
                    console.log(item);
                    if (item.mulliganReleaseId) {
                        wstream.write(`${item.titleId.S},${item.vendorId.S},${item.mulliganReleaseId.S}\r\n`);
                    } else {
                        wstream.write(`${item.titleId.S},${item.vendorId.S},\r\n`);
                    }
                });
                
                count+=data.Count;
                if (data.LastEvaluatedKey) {
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    scanExecute();
                } else {
                    console.log(`Total Count ${count}`);
                    wstream.close();
                }
            }
        });
    }
    scanExecute();
}

scan(process.argv[2]);