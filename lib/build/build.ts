import fs from 'fs-extra';
import path from 'path';
import prettier from 'prettier';
import chalk from 'chalk';
import figures from 'figures';

import { inlineHTML } from '@joshkolenko/inline-html';

import { getConfig } from '../get-config.js';
import { getHtmlFiles } from '../get-html-files.js';

export async function build(dir: string) {
  try {
    const config = await getConfig();

    if (!fs.existsSync(dir)) {
      throw `${chalk.red(figures.cross)} No directory found at : ${chalk.dim(
        dir
      )}`;
    }

    const htmlFiles = getHtmlFiles(dir);

    if (!fs.existsSync(path.resolve(dir, config.outputDir))) {
      fs.mkdirSync(path.resolve(dir, config.outputDir));
    }

    if (config.cleanOutputDir !== false) {
      fs.emptyDirSync(path.resolve(dir, config.outputDir));
    }

    for (const htmlFile of htmlFiles) {
      const filePath = path.resolve(dir, htmlFile);
      const output = await inlineHTML(filePath, {
        attribute: config.attribute,
      });

      fs.writeFileSync(
        path.resolve(dir, config.outputDir, htmlFile),
        prettier.format(output, { parser: 'html' })
      );
    }

    console.log(
      `${chalk.green(figures.tick)} Compiled ${htmlFiles.length} ${chalk.yellow(
        'html'
      )} file${htmlFiles.length === 1 ? '' : 's'}. Output at: ${
        chalk.dim(config.outputDir) + '/'
      }`
    );
  } catch (error) {
    console.error(error);
  }
}
