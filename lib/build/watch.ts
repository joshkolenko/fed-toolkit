import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import chalk from 'chalk';
import figures from 'figures';

import { build } from './build.js';
import { getConfig } from '../get-config.js';
import { getHtmlFiles } from '../get-html-files.js';

export async function watch(dir: string) {
  try {
    if (!fs.existsSync(dir)) {
      throw `${chalk.red(figures.cross)} No directory found at: ${chalk.dim(
        dir
      )}`;
    }

    const config = await getConfig();
    const ignored = [path.resolve(dir, config.outputDir)];

    if (config.ignoredPaths) {
      if (Array.isArray(config.ignoredPaths)) {
        config.ignoredPaths.forEach(ignoredPath => {
          const fullIgnoredPath = path.resolve(dir, ignoredPath);
          ignored.push(fullIgnoredPath);
        });
      } else {
        throw `${chalk.red(figures.cross)} Property ${chalk.magenta(
          'ignoredPaths'
        )} in ${chalk.yellow('config.js')} must be an array.`;
      }
    }

    getHtmlFiles(dir);

    const watcher = chokidar.watch(dir, {
      ignored,
      usePolling: true,
      interval: 100,
    });

    watcher.on('ready', () => {
      console.log(
        `${chalk.green(
          figures.circleDotted
        )} Watching for changes in: ${chalk.dim(dir)}\n`
      );

      build(dir);

      watcher.on('all', (e, p) => {
        build(dir);
      });
    });
  } catch (error) {
    console.error(error);
  }
}
