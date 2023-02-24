import prompts from 'prompts';
import path from 'path';
import prettier from 'prettier';
import fs from 'fs';
import chalk from 'chalk';
import figures from 'figures';

import type { ConfigObj } from '../types/config.js';

export const configPath = path.resolve(process.cwd(), 'config.js');

export async function generateConfig() {
  const defaults = {
    attribute: 'inline',
    outputDir: 'dist',
  };

  try {
    if (fs.existsSync(configPath)) {
      const response = await prompts({
        type: 'confirm',
        name: 'continue',
        message: `Generating a new ${chalk.yellow(
          'config.js'
        )} will override the existing one. Continue?`,
      });

      if (!response.continue) process.exit();
    }

    const responses = await prompts(
      [
        {
          type: 'text',
          name: 'developer',
          message: 'What are your initials?',
        },
        {
          type: 'text',
          name: 'stylesDir',
          message: 'Styles directory',
          initial: 'styles',
        },
        {
          type: 'text',
          name: 'jsDir',
          message: 'JavaScript directory',
          initial: 'js',
        },
      ],
      {
        onCancel: () => process.exit(),
      }
    );

    const config: ConfigObj = { ...defaults, ...responses };

    fs.writeFileSync(
      configPath,
      prettier.format(
        `/** @type {import("./lib/types/config.js").ConfigObj} */\n\n` +
          `export const config = ${JSON.stringify(config)}`,
        {
          parser: 'babel',
        }
      )
    );

    console.log(
      `${chalk.green(figures.tick)} ${chalk.yellow(
        'config.js'
      )} created at: ${chalk.dim(configPath)}`
    );
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}
