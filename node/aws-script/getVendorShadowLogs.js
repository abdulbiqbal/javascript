var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var dynamodb = new AWS.DynamoDB();


function generateExpressionAttributeValueList(AttributeValuesObject, valueList) {
    var valueVars = [];
    var index = 0;
    valueList.forEach(function(value) {
        index++;
        var entry = {S: value};
        var valueKey = ":vendor"+index;
        AttributeValuesObject[valueKey.toString()] = entry;
        valueVars.push(valueKey);
      });
      return valueVars;
}

function scan(ops) {
    var vendors = [
        'M12GUKWG9KL647','M14T8IBHHVMWX2','M1AGII9EV2F3Y2','M1BKNR6QCKC7S','M2JRRKPU730GGN','MB58X28QP9H5U','MCYZDPAAS2A4S','MJ2K5JK3E3F0V','MMUJ6H3XFA04W','MPJ3X1AAZLVVE'
    ];
    
    var AttributeValuesObject = {
        ":v1": {
            S: "2018-10-09T00:00:00.000Z"
        }
    };
    var vendorVars = generateExpressionAttributeValueList(AttributeValuesObject, vendors);
    var params = {
        ExpressionAttributeNames: {
            '#t': 'time',
            '#v': 'vendorId'
        },
        ExpressionAttributeValues: AttributeValuesObject,
        //FilterExpression: "#t > :v1 and #v in (:ven1,:ven2,:ven3,:ven4,:ven5,:ven6,:ven7,:ven8,:ven9,:ven10)",
        FilterExpression: `#t > :v1 and #v in (${vendorVars.toString()})`,

        TableName: "SHADOW_MODE_ERROR_LOG"
    };
    console.log(params.ExpressionAttributeValues);
    var count = 0;
    var fs = require('fs');
    var vendors = {};
    var wstream = fs.createWriteStream('vendors_t2.csv');
    var scanExecute = function () {
        dynamodb.scan(params, function (err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred

            }
            else {
                // successful response
                data.Items.forEach(item => {
                    console.log(item.exception);

                    if (!vendors[item.vendorId.S]) {
                        vendors[item.vendorId.S] = {
                            'CREATE:Iap': 0,
                            'UPDATE:Iap': 0,
                            'GET:Iap': 0,
                            'CREATE:Release': 0,
                            'UPDATE:Release': 0,
                            'GET:Release': 0,
                            'CREATE:Submission': 0,
                            'GET:Submission': 0
                        }
                    }

                    if (!vendors[item.vendorId.S][item.operation.S]) {
                        vendors[item.vendorId.S][item.operation.S] = 0;
                    }
                    vendors[item.vendorId.S][item.operation.S]++;
                    //console.log(vendors[item.vendorId.S]);
                });

                count += data.Count;
                if (data.LastEvaluatedKey) {
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    scanExecute();
                } else {
                    console.log(`Total Count ${count}`);

                    Object.keys(vendors).forEach(function (vendorId) {
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