const path = require('path')
const chokidar = require('chokidar')

const chalk = require('chalk')

console.log(chalk.greenBright(chalk.bold('Watching for changes...')))

const { build } = require('./build')

const INIT_CWD = process.env.INIT_CWD

chokidar
  .watch(INIT_CWD, { ignored: path.join(INIT_CWD, 'dist') })
  .on('change', (event, path) => {
    const file = event.match(/([^\/]+)$/)[1]

    console.log(`\nFile changed:\n` + chalk.greenBright(file))
    build()
  })
