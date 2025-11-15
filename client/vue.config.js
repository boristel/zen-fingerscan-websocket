const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:50002',
        changeOrigin: true,
        secure: false
      }
    }
  },
  configureWebpack: {
    resolve: {
      fallback: {
        "fs": false,
        "path": false,
        "os": false
      }
    }
  }
})