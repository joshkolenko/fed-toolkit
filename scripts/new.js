import fs from 'fs-extra'
import path from 'path'
import { prompt, promptLoop } from 'readline-sync'
import chalk from 'chalk'
import createConfig from './create-config.js'
import clipboard from 'clipboardy'

const INIT_CWD = process.env.INIT_CWD

const options = {
  limit: /^(?!\s*$).+/,
  limitMessage: chalk.red('\nInput cannot be a blank string.')
}

const message = lines => {
  console.clear()
  console.log(lines.join('\n'))
}

message([
  chalk.cyanBright('Enter the JIRA ticket ID'),
  '',
  'This is used to generate the ticket',
  'folder and the asset comment.',
  '',
  chalk.dim('Example: FED-12345')
])

const ticket = prompt(options)

message([
  chalk.cyanBright('Enter the Brand abbreviation'),
  chalk.cyanBright('associated with ticket: ') + ticket,
  '',
  'This is used to generate the ticket folder.',
  '',
  chalk.dim('Example: MER')
])

const brand = prompt(options)

message([
  chalk.cyanBright(`Enter the description of ${ticket}`),
  '',
  'This is used to generate the ticket',
  'folder and the asset comment.',
  '',
  chalk.dim('Example: Homepage Update')
])

const description = prompt(options)

let assets = []
const assetLog = () => {
  message([
    chalk.cyanBright(`Enter the IDs of content assets needed for ${ticket}`),
    '',
    'This is used to generate the html and scss files for the asset.',
    chalk.greenBright(`Enter 'Y' to proceed or 'D' to delete.`),
    '',
    assets.length
      ? chalk.whiteBright('Current assets: ') +
        assets.map(a => chalk.magentaBright(a)).join(', ')
      : chalk.dim('Example: promo-20220701')
  ])
}

assetLog()

promptLoop(input => {
  if (input === 'Y') {
    if (!assets.length) {
      console.log(chalk.red('\nInput at least one asset.'))

      return false
    }

    return true
  }
  if (input === 'D') {
    assets.pop()

    assetLog()
    return false
  }

  assets.push(input)
  assetLog()
}, options)

assets = assets.map(asset => ({
  id: asset,
  path: `${asset}.html`,
  html:
    `<!--\n` +
    `  Ticket: ${ticket}\n` +
    `  Brand: ${brand}\n` +
    `  Description: ${description}\n` +
    `  Asset: ${asset}\n` +
    `-->\n\n` +
    `<div></div>\n\n` +
    `<link rel="stylesheet" href="styles/${asset}.scss" bundle />`
}))

const dirName = `${ticket} ${brand} - ${description}`

let dir = path.join(INIT_CWD, dirName)

const createDir = () => {
  try {
    fs.mkdirSync(dir)
  } catch {
    dir += ' (Duplicate)'

    createDir()
  }
}

createDir()

fs.mkdirSync(path.join(dir, 'images'))
fs.mkdirSync(path.join(dir, 'files'))
fs.mkdirSync(path.join(dir, 'styles'))

assets.forEach(asset => {
  fs.writeFileSync(path.join(dir, asset.path), asset.html)
  fs.writeFileSync(path.join(dir, 'styles', `${asset.id}.scss`), '')
})

fs.writeFileSync(
  path.join(dir, 'config.json'),
  createConfig(assets.map(asset => asset.path))
)

const startOfPath = path.dirname(dir)
const endOfPath = path.basename(dir)
const command = `cd "${endOfPath}"`

message([
  chalk.dim(startOfPath) + ' ' + chalk.yellowBright(endOfPath),
  '',
  chalk.whiteBright('Assets created: ') +
    assets.map(a => chalk.magentaBright(a.id)).join(', '),
  '',
  chalk.greenBright(command) + chalk.whiteBright(' has been copied to your clipboard'),
  '',
  'From the ticket folder, run:',
  '',
  chalk.cyanBright(' npm run watch'),
  chalk.cyanBright(' npm run build'),
  ''
])

clipboard.writeSync(command)
