import path from 'path'
import chokidar from 'chokidar'
import build from './build.js'
import chalk from 'chalk'

const INIT_CWD = process.env.INIT_CWD

const options = {
  ignored: [
    path.join(INIT_CWD, 'dist'),
    path.join(INIT_CWD, 'images'),
    path.join(INIT_CWD, 'files')
  ],
  awaitWriteFinish: {
    stabilityThreshold: 50,
    pollInterval: 50
  }
}

const watcher = chokidar.watch(INIT_CWD, options)

const dir = INIT_CWD.match(/\/[^\/]+$/)[0]

const handleWatch = () => {
  console.clear()
  console.log(`${chalk.cyanBright('Watching for changes in')} ${dir}\n`)

  build()
}

watcher.on('ready', () => {
  handleWatch()

  watcher.on('change', () => handleWatch())
  watcher.on('add', () => handleWatch())
  watcher.on('unlink', () => handleWatch())
})
