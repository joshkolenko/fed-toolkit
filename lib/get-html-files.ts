import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import figures from 'figures';

export function getHtmlFiles(dir: string) {
  const htmlFiles = fs
    .readdirSync(dir)
    .filter(item => path.parse(item).ext === '.html');

  if (!htmlFiles.length) {
    throw `${chalk.red(figures.cross)} No ${chalk.yellow(
      'html'
    )} files found at: ${chalk.dim(dir)}`;
  }

  return htmlFiles;
}
