import path from 'path'
import fs from 'fs-extra'
import { format } from 'prettier'
import { parse } from 'node-html-parser'
import chalk from 'chalk'
import converter from 'styleflux-web'

const INIT_CWD = process.env.INIT_CWD

const unbundle = () => {
  const configPath = path.join(INIT_CWD, 'config.json')

  if (!fs.existsSync(configPath)) {
    const assets = fs
      .readdirSync(INIT_CWD)
      .filter(file => file.includes('.html'))

    fs.writeFileSync(path.join(INIT_CWD, 'config.json'), createConfig(assets))

    console.log('No config.json found, a new one has been created.\n')
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

    for (const asset of config.assets) {
      if (asset.ignore) return

      const assetName = asset.path.replace(/(.[^.]+)$/, '')
      const assetPath = path.join(INIT_CWD, asset.path)

      if (!fs.existsSync(assetPath)) {
        throw { message: `No file found at path: ${assetPath}` }
      }

      const document = parse(
        format(fs.readFileSync(assetPath, 'utf-8'), {
          parser: 'html',
          printWidth: 150
        }),
        {
          comment: true
        }
      )

      const styles = document.querySelectorAll('style')

      if (styles.length) {
        const css = styles.map(style => style.innerHTML).join('\n')
        const dirPath = path.join(INIT_CWD, 'styles')
        const filePath = path.join(dirPath, `${assetName}.scss`)
        const scss = converter.cssToScss(css)

        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath)
        }

        fs.writeFileSync(filePath, format(scss, { parser: 'scss' }))
        styles.forEach(style => style.remove())

        const tag = parse(
          `<link rel="stylesheet" href="styles/${assetName}.scss" bundle>`
        )
        document.appendChild(tag)
      }

      const scripts = document.querySelectorAll('script')

      if (scripts.length) {
        const js = scripts.map(script => script.innerHTML).join('\n')
        const dirPath = path.join(INIT_CWD, 'js')
        const filePath = path.join(dirPath, `${assetName}.js`)

        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath)
        }

        fs.writeFileSync(filePath, format(js, { parser: 'babel' }))
        scripts.forEach(script => {
          if (script.innerHTML) {
            script.remove()
          }
        })

        const tag = parse(`\n<script src="js/${assetName}.js" bundle></script>`)
        document.appendChild(tag)
      }

      fs.writeFileSync(
        assetPath,
        format(document.toString(), { parser: 'html' })
      )
    }
  } catch (error) {
    let message = chalk.redBright('An error occurred:\n\n')

    if (error.frame) {
      const frame = chalk.whiteBright(error.frame.replace(/\^/, chalk.red('^')))

      message +=
        chalk.redBright(error.message) + '\n\n' + frame + '\n\n' + error.id
    } else {
      message += error.message
    }

    console.log('\n' + message + '\n')
  }
}

unbundle()
