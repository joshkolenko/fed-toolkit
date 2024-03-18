import fs from 'fs-extra'
import path from 'path'
import sass from 'sass'
import minify from 'minify'
import { format } from 'prettier'
import { rollup } from 'rollup'
import { parse } from 'node-html-parser'
import chalk from 'chalk'
import createConfig from './create-config.js'

const CWD = process.cwd()
const INIT_CWD = process.env.INIT_CWD

const build = async () => {
  const startTime = new Date()
  const hours = startTime.getHours()
  const minutes = startTime.getMinutes()
  const seconds = startTime.getSeconds()
  const ampm = hours >= 12 ? 'PM' : 'AM'

  const formatTime = (h, m, s) => {
    const leadingZero = num => {
      if (num < 10) return '0' + num
      return num
    }

    h = h % 12
    h = leadingZero(h)
    m = leadingZero(m)
    s = leadingZero(s)

    return ` ${h}:${m}:${s} ${ampm} `
  }

  console.log(
    chalk.bgWhiteBright(chalk.black(formatTime(hours, minutes, seconds))) +
      ` Starting build...\n`
  )

  const configPath = path.join(INIT_CWD, 'config.json')

  if (!fs.existsSync(configPath)) {
    const assets = fs.readdirSync(INIT_CWD).filter(file => file.includes('.html'))

    fs.writeFileSync(path.join(INIT_CWD, 'config.json'), createConfig(assets))

    console.log('No config.json found, a new one has been created.\n')
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

  try {
    const distDir = path.join(INIT_CWD, 'dist')

    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir)
    } else {
      fs.emptyDirSync(distDir)
    }

    let nodeCount = 0
    const assetCount = config.assets.length

    for (const asset of config.assets) {
      const assetPath = path.join(INIT_CWD, asset.path)

      if (!fs.existsSync(assetPath)) {
        throw { message: `No file found at path: ${assetPath}` }
      }

      const document = parse(
        format(fs.readFileSync(assetPath, 'utf-8'), {
          parser: 'html',
          printWidth: 500
        }),
        {
          comment: true
        }
      )
      const nodes = document.querySelectorAll('[bundle]')

      for (const node of nodes) {
        nodeCount++

        const filePath = path.join(INIT_CWD, node.attrs.href || node.attrs.src)

        if (!fs.existsSync(filePath)) {
          throw { message: 'File not found at:\n' + `${filePath}` }
        }

        const tag = node.tagName

        let output

        if (tag === 'LINK') {
          output = format(buildCSS(filePath), { parser: 'css' })

          if (config.minify) {
            output = await minify.css(output)
            output = `<style>${output}</style>`
          } else {
            output = `<style>\n${output}</style>`
          }
        }

        if (tag === 'SCRIPT') {
          output = format(await buildJS(filePath), { parser: 'babel' })

          if (config.minify) {
            output = await minify.js(output)
            output = `<script>${output}</script>`
          } else {
            output = `<script>\n${output}</script>`
          }
        }

        output = `<!-- ${path.join(CWD, node.attrs.href || node.attrs.src)} -->` + output

        node.replaceWith(parse(output))
      }

      const filePath = path.join(distDir, asset.path)
      fs.writeFileSync(filePath, document.toString())
    }

    const endTime = new Date() - startTime

    const lines = [
      chalk.greenBright(
        `\n✓ ${nodeCount} nodes bundled into ${assetCount} ${
          assetCount === 1 ? 'asset' : 'assets'
        }`
      ),
      `Built asset directory: ${chalk.yellowBright('dist/')}`,
      `Built assets: ${config.assets
        .map(asset => chalk.magentaBright(asset.path))
        .join(', ')}`,
      chalk.cyanBright(`\nDone in ${endTime}ms`)
    ]

    console.log(lines.join('\n') + '\n')
  } catch (error) {
    let message = chalk.redBright('An error occurred:\n\n')

    if (error.frame) {
      const frame = chalk.whiteBright(error.frame.replace(/\^/, chalk.red('^')))

      message += chalk.redBright(error.message) + '\n\n' + frame + '\n\n' + error.id
    } else {
      message += error.message
    }

    console.log('\n' + message + '\n')
  }
}

const buildCSS = filePath => {
  const result = sass.compile(filePath)
  const output = result.css

  return output
}

const buildJS = async filePath => {
  const result = await rollup({ input: filePath, treeshake: false })
  const output = (await result.generate({ format: 'iife' })).output[0].code

  return output
}

if (process.argv.includes('-Y')) build()

export default build
