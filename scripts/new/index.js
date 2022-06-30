import fs from 'fs-extra'
import path from 'path'
import { question } from 'readline-sync'

const INIT_CWD = process.env.INIT_CWD

// const ticket = question('Ticket ID: ')
// const brand = question('Brand: ')
// const description = question('Description: ')
// const assets = question('Assets: ')

const ticket = 'FED-12345'
const brand = 'WOL'
const description = 'Test Ticket'
const assets = 'asset1 asset2 asset3'.split(' ').map(asset => {
  return {
    id: asset,
    html:
      `<!-- Ticket: ${ticket} -->\n` +
      `<!-- Brand: ${brand} -->\n` +
      `<!-- Description ${description} -->\n` +
      `<!-- Asset: ${asset} -->\n\n``<div></div>\n\n` +
      `<link rel="stylesheet" href="scss/${asset}.scss" bundle />`
  }
})

const dirName = `${ticket} ${brand} - ${description}`
const dir = path.join(INIT_CWD, dirName)

fs.mkdirSync(path.join(dir, 'assets'))
fs.mkdirSync(path.join(dir, 'files'))
fs.mkdirSync(path.join(dir, 'styles'))

assets.forEach(asset => {
  fs.createFileSync(path.join(dir, `${asset}.html`))
})
