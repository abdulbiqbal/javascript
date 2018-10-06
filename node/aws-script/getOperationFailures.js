var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "SHADOW_MODE_ERROR_LOG",
    //ProjectionExpression:"#yr, title, info.genres, info.actors[0]",
    IndexName: "operation-time-index",
    KeyConditionExpression: "#ops = :opsname and #tm > :startTime",
    ExpressionAttributeNames:{
        "#ops": "operation",
        "#tm": "time"
    },
    ExpressionAttributeValues: {
        ":opsname": {
            S : "CREATE:Iap"
        },
        ":startTime": {
            S : "2018-10-05T00:00:00.006Z"
        }
    }
};

dynamodb.query(params, function(err, data) {
    if (err) {
        console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            /* console.log(" -", item.year + ": " + item.title
            + " ... " + item.info.genres
            + " ... " + item.info.actors[0]); */
            console.log(item);
        });
    }
});

//scan(process.argv[2]);