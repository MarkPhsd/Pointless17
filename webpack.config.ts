module.exports = {
  resolve: {
      fallback: {
          fs: false,
          child_process: false,
          os: false,
          path: false,
          crypto: false,
          https: false,
          http: false,
          stream:false,
          zlib: false,
          winreg: false,
      },
  },
}
