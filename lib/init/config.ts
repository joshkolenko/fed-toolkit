import prompts from 'prompts';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import figures from 'figures';

import type { ConfigObj } from '../types/config.js';

export const configPath = path.resolve(process.cwd(), 'config.json');

export async function generateConfig() {
  if (fs.existsSync(configPath)) {
    const response = await prompts({
      type: 'confirm',
      name: 'continue',
      message: `Generating a new ${chalk.yellow(
        'config.json'
      )} will override the old one. Continue?`,
    });

    if (!response.continue) process.exit();
  }

  const responses: ConfigObj = await prompts(
    [
      {
        type: 'text',
        name: 'developer',
        message: 'What are your initials?',
      },
      {
        type: 'text',
        name: 'attribute',
        message: 'Attribute for bundling',
        initial: 'inline',
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

  fs.writeFileSync(configPath, JSON.stringify(responses as ConfigObj));

  console.log(
    `${chalk.green(figures.tick)} ${chalk.yellow(
      'config.json'
    )} created at: ${chalk.dim(configPath)}`
  );
}
