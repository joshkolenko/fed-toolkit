import path from 'path'
import chokidar from 'chokidar'
import build from './build.js'
import chalk from 'chalk'

const INIT_CWD = process.env.INIT_CWD

const options = {
  awaitWriteFinish: {
    stabilityThreshold: 50,
    pollInterval: 50
  }
}

const watcher = chokidar.watch(INIT_CWD, options)
const dir = path.basename(INIT_CWD)

const ignored = ['dist', 'images', 'files']

const handleWatch = changePath => {
  if (changePath) {
    const changeDir = path.basename(path.dirname(changePath))

    if (changeDir === 'dist') {
      let match = false

      ignored.forEach(item => {
        if (changeDir === item) {
          match = true
        }
      })

      if (match) return
    }
  }

  console.clear()
  console.log(`${chalk.cyanBright('Watching for changes in')} ${dir}\n`)

  build()
}

watcher.on('ready', () => {
  handleWatch()

  watcher.on('change', handleWatch)
  watcher.on('add', handleWatch)
  watcher.on('unlink', handleWatch)
})
