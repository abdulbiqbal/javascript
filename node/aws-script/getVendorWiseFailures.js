var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var dynamodb = new AWS.DynamoDB();

function scan(ops) {
    var params = {
        ExpressionAttributeNames: {
            '#t': 'time',
          }, 
        ExpressionAttributeValues: {
          ":v2": {
              //26-Sep-2018 08:45
            S: "2018-09-26T07:00:00.000Z"
            //S: "2018-10-02T07:00:00.000Z"
           }
        },
        FilterExpression: "#t > :v2", 

        TableName: "SHADOW_MODE_ERROR_LOG"
    };
    var count = 0;
    var fs = require('fs');
    var vendors = {};
    var wstream = fs.createWriteStream('vendors.csv');
    var scanExecute = function () {
        dynamodb.scan(params, function (err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
               
            }
            else {
                           // successful response
                data.Items.forEach(item => {
                    
                    if (!vendors[item.vendorId.S]) {
                        vendors[item.vendorId.S] = {
                            'CREATE:Iap' : 0,
                            'UPDATE:Iap' : 0,
                            'GET:Iap' : 0,
                            'CREATE:Release' : 0,
                            'UPDATE:Release' : 0,
                            'GET:Release' : 0,
                            'CREATE:Submission' : 0,
                            'GET:Submission' : 0
                        }
                    } 

                    if (!vendors[item.vendorId.S][item.operation.S]) {
                        vendors[item.vendorId.S][item.operation.S] = 0;
                    }
                    vendors[item.vendorId.S][item.operation.S]++;
                    console.log(vendors[item.vendorId.S]);
                });
                
                count+=data.Count;
                if (data.LastEvaluatedKey) {
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    scanExecute();
                } else {
                    console.log(`Total Count ${count}`);

                    Object.keys(vendors).forEach(function(vendorId) {
                        value = vendors[vendorId];
                        wstream.write(`${vendorId},${value['CREATE:Iap']},${value['UPDATE:Iap']},${value['GET:Iap']},${value['CREATE:Release']},${value['UPDATE:Release']},${value['GET:Release']},${value['CREATE:Submission']},${value['GET:Submission']}\r\n`);
                    });
                    
                }
            }
        });
    }
    scanExecute();
}

scan(process.argv[2]);