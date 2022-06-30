import fs from 'fs-extra'
import path from 'path'
import { question } from 'readline-sync'
import createConfig from './createConfig.js'

const INIT_CWD = process.env.INIT_CWD

// const ticket = question('Ticket ID: ')
// const brand = question('Brand: ')
// const description = question('Description: ')
// const assets = question('Assets: ')

const ticket = 'FED-12345'
const brand = 'CHA'
const description = 'Test Ticket'
const assets = 'test-asset-20220701'.split(' ').map(asset => ({
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
const dir = path.join(INIT_CWD, dirName)

fs.mkdirSync(dir)
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
