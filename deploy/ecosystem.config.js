module.exports = {
  apps: [{
    name: 'dtrb2-viewer',
    script: './build/dtrb2-viewer-linux',
    args: '-port 9090',
    env: {
      NODE_ENV: 'production'
    }
  }]
}