const routes = [
    {
        method: "GET",
        path: "/",
        handler: (request, h) => {
            return "homepage";
        },
    },
    {
        method: "*",
        path: "/",
        handler: (request, h) => {
            return "halaman tidak dapat diakses";
        },
    },
    {
        method: 'POST',
        path: '/login',
        handler: (request, h) => {
            const { username, password } = request.payload;
            return `Welcome ${username}!`;
        },
    },
    {
        method: "GET",
        path: "/about",
        handler: (request, h) => {
            return "about page";
        },
    },
    {
        method: "GET",
        path: "/hello/{name?}",
        handler: (request, h) => {
            const { name = "stranger" } = request.params;
            const { lang = "id" } = request.query;
            if (lang === "id") {
                return `hai ${name}`
            }
            return `hello ${name}`;
        },
    },
    {
        method: "*",
        path: "/about",
        handler: (request, h) => {
            return "Halaman tidak dapat diakses";
        },
    },
    {
        method: "*",
        path: "/{any*}",
        handler: (request, h) => {
            return "halaman belum tersedisa";
        },
    }
]

module.exports = routes;