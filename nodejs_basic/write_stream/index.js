const fs = require("fs");

const writeableSteram = fs.createWriteStream("./write_stream/output.txt");
const readableStream = fs.createReadStream("./write_stream/input.txt", {
    highWaterMark: 15,
});

let temp;

readableStream.on("readable", () => {
    try {
        writeableSteram.write(`${readableStream.read()}\n`)
    } catch (error) {
        console.log(`error : ${error}`);
    }
});

readableStream.on("end", () => {
    writeableSteram.end();
})
