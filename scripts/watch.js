const path = require('path')
const chokidar = require('chokidar')
const chalk = require('chalk')
const { build } = require('./build')

const INIT_CWD = process.env.INIT_CWD

const options = {
  ignored: [
    path.join(INIT_CWD, 'dist'),
    path.join(INIT_CWD, 'assets'),
    path.join(INIT_CWD, 'ticket-files'),
    path.join(INIT_CWD, 'files')
  ],
  awaitWriteFinish: {
    stabilityThreshold: 50,
    pollInterval: 50
  }
}

const watcher = chokidar.watch(INIT_CWD, options)

watcher.on('ready', () => {
  const cb = () => console.log(chalk.cyanBright('Watching for changes...'))

  build(cb)

  watcher.on('change', () => build(cb))
  watcher.on('add', () => build(cb))
  watcher.on('unlink', () => build(cb))
})
