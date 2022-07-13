import fs from 'fs-extra'
import path from 'path'
import { prompt, promptLoop } from 'readline-sync'
import chalk from 'chalk'
import createConfig from './createConfig.js'

const INIT_CWD = process.env.INIT_CWD

const { cyan, magenta, green, whiteBright, bgCyan, bold, dim } = chalk
const options = {
  limit: /^(?!\s*$).+/,
  limitMessage: chalk.red('\nInput cannot be a blank string.')
}

const message = lines => {
  console.clear()
  console.log(lines.join('\n'))
}

message([
  bgCyan(bold(' Ticket ID ')),
  '',
  cyan('Enter the JIRA ticket ID'),
  '',
  'This is used to generate the ticket',
  'folder and the asset comment.',
  '',
  dim('Example: FED-12345')
])

const ticket = prompt(options)

message([
  bgCyan(bold(' Brand ')),
  '',
  cyan(`Enter the Brand abbreviation associated with ${ticket}`),
  '',
  'This is used to generate the ticket',
  'folder.',
  '',
  dim('Example: MER')
])

const brand = prompt(options)

message([
  bgCyan(bold(' Description ')),
  '',
  cyan(`Enter the description of ${ticket}`),
  '',
  'This is used to generate the ticket',
  'folder and the asset comment.',
  '',
  dim('Example: Homepage Update')
])

const description = prompt(options)

let assets = []
const assetLog = () => {
  message([
    bgCyan(bold(' Content Assets ')),
    '',
    cyan(`Enter the IDs of content assets needed for ${ticket}`),
    '',
    'This is used to generate the html and scss files for the asset.',
    green(`Enter 'Y' to proceed or 'D' to delete.`),
    '',
    assets.length
      ? whiteBright('Current assets: ') + assets.map(a => magenta(a)).join(', ')
      : dim('Example: promo-20220701')
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
    `<!-- Ticket: ${ticket} -->\n` +
    `<!-- Brand: ${brand} -->\n` +
    `<!-- Description: ${description} -->\n` +
    `<!-- Asset: ${asset} -->\n\n` +
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

const startOfPath = dir.replace(/\/[^\/]+$/, '')
const endOfPath = dir.match(/\/[^\/]+$/)[0]

message([
  `Ticket folder has been generated at:`,
  dim(startOfPath) + magenta(endOfPath),
  '',
  whiteBright('Assets created: ') + assets.map(a => magenta(a.id)).join(', '),
  '',
  'From the ticket folder, run:',
  '',
  cyan(' npm run watch'),
  cyan(' npm run build'),
  ''
])
