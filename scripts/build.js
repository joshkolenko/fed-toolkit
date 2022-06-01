const fs = require('fs-extra')
const path = require('path')
const { bundle } = require('./bundle')

const INIT_CWD = process.env.INIT_CWD

exports.build = build = callback => {
  let config = {
    minify: false,
    semi: true
  }

  const configPath = path.join(INIT_CWD, 'config.json')

  config = fs.existsSync(configPath)
    ? {
        ...config,
        ...JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      }
    : config

  global.__config = config

  bundle()

  if (typeof callback === 'function') callback()
}

if (process.argv[2] === 'bundle') {
  build()
}
