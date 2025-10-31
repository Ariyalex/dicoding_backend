const fs = require('fs');

const fileReadCallback = (error, data) => {
    if (error) {
        console.log(`gagal membaca berkas: ${error}`);
        return;
    }
    console.log(data);

};

fs.readFile("./filesystem/notes.txt", 'UTF-8', fileReadCallback);