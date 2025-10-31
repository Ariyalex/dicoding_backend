const http = require("http");

const requestListener = (request, response) => {
    const { method, url } = request;

    response.setHeader("Content-Type", "application/json");
    response.setHeader("Powered-By", "Node.js")


    if (url === "/") {
        if (method === "GET") {
            response.statusCode = 200;
            const body = JSON.stringify({
                message: "ini home",
            });

            response.end(body);
        } else {
            response.statusCode = 400;
            const body = JSON.stringify({
                message: `halaman tidk dapat diakses dengan ${method} request`
            });
            response.end(body)
        }
    } else if (url === "/about") {
        if (method === "GET") {
            response.statusCode = 200;
            const body = JSON.stringify({
                message: "ini about",
            });

            response.end(body);
        } else if (method === "POST") {
            let body = [];

            request.on("data", (chunk) => {
                body.push(chunk);
            });

            request.on("end", () => {
                body = Buffer.concat(body).toString();
                const { name } = JSON.parse(body);
                response.statusCode = 200;

                const body = JSON.stringify({
                    message: `Halo ${name}, ini halaman about`,
                });

                response.end(body);
            })
        } else {
            response.statusCode = 400;
            const body = JSON.stringify({
                message: `halaman tidk dapat diakses dengan ${method} request`
            });
            response.end(body)
        }
    } else {
        response.statusCode = 400;
        const body = JSON.stringify({
            message: `halaman tidak ditemukan`
        });
        response.end(body)
    }
}

const server = http.createServer(requestListener);

const port = 5000;
const host = "localhost";

server.listen(port, host, () => {
    console.log(`server berjalan pada http://${host}:${port}`);

})