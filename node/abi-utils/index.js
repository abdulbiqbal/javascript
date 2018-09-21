export function add(a,b) {
    return a+b;
}

export function convertCsvToJson(filePath, callback, header) {
    const fs = require('fs');
    const readline = require('readline');
    const rl = readline.createInterface(fs.createReadStream(filePath));

    let propSet = false;
    let propLength = -1;
    if (header) {
        propSet = true;
        propLength = header.length;
    } else {
        header = [];
    }

    rl.on('line', (line) => {
        var obj = {};
        var str_array = line.split(',');

        if (propLength < 0) {
            propLength = str_array.length
        }
        
        for(var i = 0; i < propLength; i++) {
           // Trim the excess whitespace.
           if (str_array[i])
            str_array[i] = str_array[i].replace(/^\s*/, "").replace(/\s*$/, "");
           if (propSet) {
               obj[header[i]] = str_array[i] ? str_array[i] : null;
           } else {
               header[i] = str_array[i];
           }
        }
        propSet = true;
        callback(obj);
      });

}