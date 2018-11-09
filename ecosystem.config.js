module.exports = {
  apps : [{
    name: "web-server",
    script: "./dist/scripts/worker.js",
    wait_ready: true,
    listen_timeout: 3000,
  }],
}