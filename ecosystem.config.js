module.exports = {
  apps: [{
    name: 'dtrb2-viewer',
    script: './dtrb2-viewer-linux',
    args: '-port 9090',
    env: {
      NODE_ENV: 'production'
    }
  }]
}