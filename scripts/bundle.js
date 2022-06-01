const fs = require('fs-extra')
const path = require('path')
const esbuild = require('esbuild')
const sass = require('sass')
const prettier = require('prettier')
const minify = require('minify')
const chalk = require('chalk')

const { parse } = require('node-html-parser')

const INIT_CWD = process.env.INIT_CWD

global.__bundledir = INIT_CWD.replace(process.env.PWD, '')

exports.bundle = () => {
  const start = Date.now()

  let moduleCount = 0
  let bundledHtmlFileNames = []
  let error = ''

  const distPath = path.join(INIT_CWD, 'dist')

  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true })
  }

  fs.mkdirSync(distPath)

  const htmlFiles = fs
    .readdirSync(INIT_CWD)
    .filter(name => name.includes('.html'))
    .map(name => {
      return { name, path: path.join(INIT_CWD, name) }
    })

  htmlFiles.forEach(async htmlFile => {
    bundledHtmlFileNames.push(htmlFile.name)

    let html = parse(
      prettier.format(fs.readFileSync(htmlFile.path, 'utf-8'), {
        parser: 'html'
      })
    )

    const elementsToBundle = html.querySelectorAll('[bundle]')

    for (const element of elementsToBundle) {
      moduleCount++

      const filePath =
        element.getAttribute('src') || element.getAttribute('href')
      let fileType = filePath.match(/\.([^.]+)$/)[1]
      if (fileType === 'scss') fileType = 'css'

      let bundledFile = bundleFile(filePath, fileType)

      if (bundledFile.error) {
        error = htmlFile.name + ': ' + chalk.red(bundledFile.error)
      }

      if (__config.minify) {
        bundledFile = await minify[fileType](bundledFile)
      } else {
        bundledFile = '\n' + bundledFile
      }

      if (fileType === 'css') {
        element.replaceWith(`<style>${bundledFile}</style>`)
      } else if (fileType === 'js') {
        element.replaceWith(`<script>${bundledFile}</script>`)
      }
    }

    html = html.toString()

    if (!__config.minify) {
      html = prettier.format(html, { parser: 'html', semi: __config.semi })
    }

    const distHTMLPath = path.join(distPath, htmlFile.name)

    if (!error) fs.writeFileSync(distHTMLPath, html)
  })

  if (error) {
    console.log('\n' + error)
  } else {
    const buildTime = Date.now() - start

    console.log(
      '\n───────────────\n\n' +
        chalk.greenBright(
          `✓ ${moduleCount} module` +
            (moduleCount === 1 ? '' : 's') +
            ` bundled in ${bundledHtmlFileNames.length} file` +
            (bundledHtmlFileNames.length === 1 ? '' : 's') +
            '\n'
        ) +
        bundledHtmlFileNames
          .map(name => 'dist/' + chalk.magentaBright(name))
          .join(', ') +
        '\n\nDirectory: ' +
        chalk.cyanBright(__bundledir) +
        chalk.whiteBright(`\nBuilt in ${buildTime}ms\n`)
    )
  }
}

const bundleFile = (filePath, fileType) => {
  const fullFilePath = path.join(INIT_CWD, filePath)

  try {
    fs.readFileSync(fullFilePath)
  } catch {
    return { error: `${filePath} not found` }
  }

  if (fileType === 'js') {
    const output = esbuild.buildSync({
      entryPoints: [fullFilePath],
      bundle: true,
      write: false,
      minify: __config.minify,
      format: 'iife',
      target: ['chrome58', 'firefox57', 'safari11', 'edge16']
    })

    return prettier.format(output.outputFiles[0].text, {
      parser: 'babel'
    })
  }

  if (fileType === 'css') {
    const output = sass.compile(fullFilePath)

    return prettier.format(output.css, {
      parser: 'css'
    })
  }
}
