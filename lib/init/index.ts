import chalk from 'chalk';
import figures from 'figures';

import { generateConfig } from './config.js';
import { generateTicket } from './ticket.js';

function init() {
  switch (process.argv[2]) {
    case 'config':
      generateConfig();
      break;

    case 'ticket':
      generateTicket();
      break;

    default:
      console.error(
        chalk.white(
          `${chalk.red(
            figures.cross
          )} To run init, pass the type of init you want to run after the command. For example: ${chalk.cyan(
            `npm run init ${chalk.blue('config')}.`
          )}`
        )
      );
  }
}

init();
