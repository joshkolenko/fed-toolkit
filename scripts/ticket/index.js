const fs = require('fs-extra')
const path = require('path')
const { question, keyInYN, keyInSelect } = require('readline-sync')
const chalk = require('chalk')

const INIT_CWD = process.env.INIT_CWD

const ticket = question('Ticket ID: ')
const description = question('Description: ')
const ticketPath = path.join(INIT_CWD, `${ticket} - ${description}`)
const assets = question('Asset IDs (Separated by space): ')
  .split(' ')
  .map(asset => {
    const templatesPath = path.join(__dirname, 'templates')
    let templatePath = path.join(templatesPath, 'default')

    if (keyInYN(`Use template for ${asset}? `)) {
      const devsPath = path.join(templatesPath, 'dev')
      const devs = fs.readdirSync(devsPath)
      const dev = devs[keyInSelect(devs, 'Choose template folder')]

      const devTemplatesPath = path.join(devsPath, dev)
      const devTemplates = fs.readdirSync(devTemplatesPath)
      const devTemplate =
        devTemplates[keyInSelect(devTemplates, 'Choose a template')]

      templatePath = path.join(devTemplatesPath, devTemplate)
    }

    return { asset, templatePath }
  })

if (fs.existsSync(ticketPath)) {
  console.log('Ticket folder already exists')
  process.exit()
}

fs.mkdirSync(ticketPath)
