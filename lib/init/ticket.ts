import prompts from 'prompts';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import figures from 'figures';

import { configPath } from './config.js';

import type { ConfigObj } from '../types/config.js';

const INIT_CWD = process.env.INIT_CWD as string;

export async function generateTicket() {
  try {
    if (!fs.existsSync(configPath)) {
      throw `${chalk.red(figures.cross)} No ${chalk.yellow(
        'config.json'
      )} found. Run ${chalk.cyan(
        `npm run init ${chalk.blue('config')}`
      )} before running other commands.`;
    }

    const config: ConfigObj = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    const requiredConfigProperties = [
      'developer',
      'attribute',
      'stylesDir',
      'jsDir',
    ];

    requiredConfigProperties.forEach(property => {
      if (!config[property]) {
        throw `${chalk.red(figures.cross)} No ${chalk.yellow(
          property
        )} property in config.json. Either add the property or run ${chalk.cyan(
          `npm run init ${chalk.blue('config')}`
        )} to generate a new config.json file.`;
      }
    });

    interface Responses {
      ticket: string;
      description: string;
      assets: string[];
    }

    const responses: Responses = await prompts(
      [
        {
          type: 'text',
          name: 'ticket',
          message: 'Ticket #',
          validate: value => {
            if (!value) {
              return 'Please enter the ticket #';
            }

            return true;
          },
        },
        {
          type: 'text',
          name: 'description',
          message: 'Description',
          validate: value => {
            if (!value) {
              return 'Please enter the ticket description';
            }

            return true;
          },
        },
        {
          type: 'list',
          name: 'assets',
          message: 'Content assets',
          validate: value => {
            if (!value) {
              return 'Please enter 1 or more content asset ids';
            }

            return true;
          },
        },
      ],
      {
        onCancel: () => process.exit(),
      }
    );

    interface AssetObj {
      id: string;
      files: Array<'scss' | 'css' | 'js'>;
    }

    const assetObjs: AssetObj[] = [];

    for (const asset of responses.assets) {
      const {
        structure,
      }: { structure: 'scss' | 'scss-js' | 'css' | 'css-js' } = await prompts(
        {
          type: 'select',
          name: 'structure',
          message: `${chalk.yellow(asset)} file structure`,
          choices: [
            { title: 'scss', value: 'scss' },
            { title: 'scss-js', value: 'scss-js' },
            { title: 'css', value: 'css' },
            { title: 'css-js', value: 'css-js' },
          ],
        },
        {
          onCancel: () => process.exit(),
        }
      );

      assetObjs.push({
        id: asset,
        files: structure.split('-') as Array<'scss' | 'css' | 'js'>,
      });
    }

    const ticketName = `${responses.ticket} ${config.developer} - ${responses.description}`;
    const ticketDir = path.join(INIT_CWD, ticketName);

    if (fs.existsSync(ticketDir)) {
      const response = await prompts({
        type: 'confirm',
        name: 'continue',
        message: `${chalk.grey(ticketName)} already exists. Override contents?`,
      });

      if (!response.continue) process.exit();
    } else {
      fs.mkdirSync(ticketDir);
    }

    let count = 0;

    assetObjs.forEach(assetObj => {
      let html =
        `<!--\n` +
        `  Developer: ${config.developer}\n` +
        `  Ticket: ${responses.ticket}\n` +
        `  Description: ${responses.description}\n` +
        `  Asset: ${assetObj.id}\n` +
        `-->\n\n` +
        `<div></div>`;

      assetObj.files.forEach(ext => {
        let filePath = '',
          dirPath = '';

        if (ext === 'scss' || ext === 'css') {
          const relativePath = path.join(
            config.stylesDir,
            `${assetObj.id}.${ext}`
          );

          dirPath = path.resolve(ticketDir, config.stylesDir);
          filePath = path.resolve(ticketDir, relativePath);

          html += `\n\n<link rel="stylesheet" href="${relativePath}" ${config.attribute} />`;
        }

        if (ext === 'js') {
          const relativePath = path.join(config.jsDir, `${assetObj.id}.${ext}`);

          dirPath = path.resolve(ticketDir, config.jsDir);
          filePath = path.resolve(ticketDir, relativePath);

          html += `\n\n<script src="${relativePath}" ${config.attribute}></script>`;
        }

        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }

        fs.writeFileSync(filePath, '');
        count++;
      });

      fs.writeFileSync(path.resolve(ticketDir, `${assetObj.id}.html`), html);
      count++;
    });

    console.log(
      `${chalk.green(figures.tick)} ${count} files created at: ${chalk.grey(
        ticketDir
      )}`
    );
  } catch (error) {
    console.error(error);
  }
}
