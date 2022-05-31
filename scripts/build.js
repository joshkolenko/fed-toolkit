const fs = require('fs')
const path = require('path')
const esbuild = require('esbuild')
const sass = require('sass')
const prettier = require('prettier')
const minify = require('minify')
const chalk = require('chalk')

const { parse } = require('node-html-parser')

const INIT_CWD = process.env.INIT_CWD
const htmlFilePath = path.join(INIT_CWD, 'index.html')

const configPath = path.join(INIT_CWD, '/config.js')
const { config } = fs.existsSync(configPath)
  ? require(configPath)
  : {
      config: {
        minify: false
      }
    }

global.__builddir = INIT_CWD.replace(process.env.PWD, '')

const build = async () => {
  global.__buildconfig = config

  const start = Date.now()

  let html = parse(fs.readFileSync(htmlFilePath, 'utf-8'))

  const inlineElements = html.querySelectorAll('[inline]')
  const inlinePaths = inlineElements.map(
    el => el.getAttribute('src') || el.getAttribute('href')
  )

  const files = inlinePaths.map(inlinePath => {
    const fileType = inlinePath.match(/\.([^.]+)$/)[1]

    return bundleFile(inlinePath, fileType)
  })

  inlineElements.forEach(el => {
    el.remove()
  })

  html = parse(prettier.format(html.toString(), { parser: 'html' }))

  for (const file of files) {
    const minified = async () => {
      return await minify[file.type](file.content)
    }

    if (__buildconfig.minify) {
      file.content = await minified()
    } else {
      file.content = '\n' + file.content
    }

    if (file.type === 'css') {
      html.appendChild(parse(`\n<style>${file.content}</style>`))
    }

    if (file.type === 'js') {
      // if (config.minify) file = minify.js(file)
      html.appendChild(parse(`\n\n<script>${file.content}</script>`))
    }
  }

  html = html.toString()

  const distPath = path.join(INIT_CWD, 'dist')
  const distHTMLPath = path.join(distPath, 'index.html')

  if (!fs.existsSync(distPath)) fs.mkdirSync(distPath)
  if (fs.existsSync(distHTMLPath)) fs.rmSync(distHTMLPath)

  fs.writeFileSync(distHTMLPath, html)

  const buildTime = Date.now() - start

  console.log(
    chalk.whiteBright(chalk.bold(`\nBuilt in ${buildTime}ms\n`)) +
      `${files.length} files inlined ✅\n` +
      chalk.cyanBright(`Output directory: ` + chalk.bold('/dist'))
  )
}

const bundleFile = (filePath, fileType) => {
  const fullFilePath = path.join(INIT_CWD, filePath)

  try {
    fs.readFileSync(fullFilePath)
  } catch {
    console.error(chalk.red(`File: ${filePath} not found`))
    process.exit()
  }

  if (fileType === 'js') {
    const output = esbuild.buildSync({
      entryPoints: [fullFilePath],
      bundle: true,
      write: false,
      minify: __buildconfig.minify,
      format: 'iife',
      target: ['chrome58', 'firefox57', 'safari11', 'edge16']
    })

    return {
      type: 'js',
      content: prettier.format(output.outputFiles[0].text, {
        parser: 'babel',
        semi: true
      })
    }
  }

  if (fileType === 'scss') {
    const output = sass.compile(fullFilePath)

    return {
      type: 'css',
      content: prettier.format(output.css, {
        parser: 'css'
      })
    }
  }

  if (fileType === 'css') {
    return {
      type: 'css',
      content: prettier.format(fs.readFileSync(fullFilePath, 'utf-8'), {
        parser: 'css'
      })
    }
  }
}

build()

exports.build = build
