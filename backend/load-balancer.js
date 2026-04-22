const http = require("http");

const servers = [
  "http://localhost:3001",
  "http://localhost:3002"
];

let i = 0;

const server = http.createServer((req, res) => {
  const target = servers[i];
  i = (i + 1) % servers.length;

  const proxy = http.request(target + req.url, {
    method: req.method,
    headers: req.headers,
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on("error", (err) => {
    console.log("Backend error:", err.message);
    res.writeHead(500);
    res.end("Server unavailable");
  });

  req.pipe(proxy);
});

server.listen(4000, () => {
  console.log("Load Balancer running on port 4000");
});