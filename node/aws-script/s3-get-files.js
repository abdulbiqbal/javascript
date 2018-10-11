
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var s3 = new AWS.S3

const BUCKET = 'iap-csv-export-prod';

var params = {
    Bucket: BUCKET,
    Prefix: 'export.csv_',
    //Prefix: 'amazon.sdktester.json_'
};

var fileList = [];
var afterDate = new Date('2018-08-01T00:00:00.000Z');
var beforeDate = new Date('2018-10-01T00:00:00.000Z');
/* s3.listObjects(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else {
           //console.log(data);           // successful response
           data.Contents.forEach(obj => {
               console.log(obj.LastModified );
              if (obj.LastModified > afterDate && obj.LastModified < beforeDate) {
                  fileList.push(obj);
              }
           });
  }
  console.log(fileList.length);
}); */


function listAllObjects(token, cb) {
    if (token) params.ContinuationToken = token;

    s3.listObjectsV2(params, function (err, data) {
        data.Contents.forEach(obj => {
            if (obj.LastModified > afterDate && obj.LastModified < beforeDate) {
                fileList.push(obj);
            }
        });

        if (data.IsTruncated)
            listAllObjects(data.NextContinuationToken, cb);
        else
            cb();
    });
}

function date2str(x, y) {
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
    });

    return y.replace(/(y+)/g, function (v) {
        return x.getFullYear().toString().slice(-v.length)
    });
}
function getCSVLineCount(key, resolve, reject) {
    var count = 0;
    var fileParam = {
        Bucket: BUCKET,
        Key: key
    };

    const s3Stream = s3.getObject(fileParam).createReadStream()
    require('fast-csv').fromStream(s3Stream)
        .on('data', (data) => {
            //console.log(data);
            count++;
        }).on('end', () => {
            resolve(count);
        });
}

function getJSONKeyCount(key, resolve, reject) {
    var count = 0;
    var fileParam = {
        Bucket: BUCKET,
        Key: key
    };

    const s3Stream = s3.getObject(fileParam).createReadStream();
    const StreamObject = require('stream-json/streamers/StreamObject');
    const pipeline = s3Stream.pipe(StreamObject.withParser());
    pipeline
        .on('data', (data) => {
            //console.log(data);
            count++;
        }).on('end', () => {
            resolve(count);
        })
        .on('error', () => {
            resolve(count + ' : (error)');
        });
}
var fs = require('fs');
var wstream = fs.createWriteStream('exports_csv.csv');
wstream.write(`key,lastModified,count\r\n`);
listAllObjects(null, () => {
    console.log(fileList.length);

    /* fileList.forEach(file => {
        var lineCount = getLineCount(fileList[0].Key) - 1; // remove header
    }); */

    var promiseList = fileList.map(file => {
        return new Promise((resolve, reject) => {
            getCSVLineCount(file.Key, resolve, reject);
            //getJSONKeyCount(file.Key, resolve, reject);
        }).then((n) => {
            console.log(n);
            wstream.write(`${file.Key},${file.LastModified},${n}\r\n`);
        });
    });

    Promise.all(promiseList).then(() => {
        console.log("Done!");
        wstream.close();
    });


});