const fs = require("fs");

const readableStream = fs.createReadStream("./stream/article.txt", {
    highWaterMark: 10
});

readableStream.on("readable", () => {
    try {
        process.stdout.write(`[${readableStream.read()}]`);
    } catch (error) {
        console.log(`gagal melakukan stream: ${error}`);
    }
});

readableStream.on("end", () => {
    console.log("done");
});