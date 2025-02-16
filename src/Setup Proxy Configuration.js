const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://cdn-api.co-vin.in",
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/api",
      },
      onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      },
      // Add error handling
      onError: function (err, req, res) {
        console.error("Proxy Error:", err);
        res.status(500).send("Proxy Error");
      },
    })
  );
};
