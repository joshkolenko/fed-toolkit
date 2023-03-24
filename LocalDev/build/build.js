import fs from 'fs'
import path from 'path'
import prompts from 'prompts'
import url from 'url'

//prompt for final relative server path
const finalPath = await prompts({
  type: 'text',
  name: 'path',
  message: 'What is the final relative path to the server?',
  initial: '/content/seasonal-content/'
})


const sourceDirectory = '../src'
const distDirectory = '../dist'

if (!fs.existsSync(distDirectory)) {
  fs.mkdirSync(distDirectory)
}

const buildImages = html => {
  return html.replace(
    /<(img|picture|source)[^>]*(src|srcset)="http:\/\/127\.0\.0\.1:\d+\/images\/([^"]*)"/g, //thanks copilot
    (match, element, attr, src) => {
      if (!src.includes('?$staticlink$')) {
        const parsedImg_Url = url.parse(src);
        const imgFilePath = path.join(finalPath.path, parsedImg_Url.pathname);
        src = `${imgFilePath}?$staticlink$`;
      }
      return `<${element} ${attr}="${src}"`;
    }
  );
};

const buildStylesAndScripts = html => {
  return html.replace(
    /<(link|script)[^>]*(href|src)="([^"]*)"/g,
    (match, element, attr, src) => {
      if (src.includes('?$staticlink$') || src.includes('https')) {
        return match;
      }
      const parsedUrl_Link = url.parse(src);
      const filePath = path.join(finalPath.path, parsedUrl_Link.path);
      if (element === 'link') {
        return `<link rel="stylesheet" href="${filePath}?$staticlink$"`;
      } else if (!src.startsWith('https')) {
        return `<script src="${filePath}?$staticlink$"`;
      }
      return match;
    }
  );
};

fs.readdir(sourceDirectory, (err, files) => {
  if (err) throw err

  files.forEach(file => {
    if (path.extname(file) === '.html') {
      fs.readFile(path.join(sourceDirectory, file), 'utf8', (err, data) => {
        if (err) throw err

        const builtHtml = buildStylesAndScripts(buildImages(data))

        const distFile = path.join(distDirectory, file)
        if (fs.existsSync(distFile)) {
          fs.writeFile(distFile, builtHtml, err => {
            if (err) throw err
            console.log(`Overwrote ${file} in ${distDirectory}`)
          })
        } else {
          fs.writeFile(distFile, builtHtml, err => {
            if (err) throw err
            console.log(`Created and wrote ${file} in ${distDirectory}`)
          })
        }
      })
    }
  })
})
