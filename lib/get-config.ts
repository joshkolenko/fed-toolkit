import fs from 'fs';
import chalk from 'chalk';
import figures from 'figures';

import { configPath } from './init/config.js';
import { ConfigObj } from './types/config.js';

function checkForConfig() {
  if (!fs.existsSync(configPath)) {
    throw `${chalk.red(figures.cross)} No ${chalk.yellow(
      'config.js'
    )} found. Run ${chalk.cyan(
      `npm run init ${chalk.blue('config')}`
    )} before running other commands.`;
  }
}

function checkConfigProperties(config: ConfigObj) {
  const requiredConfigProperties = ['developer', 'stylesDir', 'jsDir'];

  requiredConfigProperties.forEach(property => {
    if (!config[property]) {
      throw `${chalk.red(figures.cross)} No ${chalk.magenta(
        property
      )} property in ${chalk.yellow(
        'config.js'
      )}. Either add the property or run ${chalk.cyan(
        `npm run init ${chalk.blue('config')}`
      )} to generate a new ${chalk.yellow(
        'config.js'
      )} file with all required properties.`;
    }
  });
}

export async function getConfig() {
  checkForConfig();
  const config: ConfigObj = (await import(configPath)).config;
  checkConfigProperties(config);

  return config;
}
