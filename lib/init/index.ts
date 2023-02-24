import chalk from 'chalk';
import figures from 'figures';
import prompts from 'prompts';

import { generateConfig } from './config.js';
import { generateTicket } from './ticket.js';

function run(arg: string) {
  switch (arg) {
    case 'config':
      generateConfig();
      break;

    case 'ticket':
      generateTicket();
      break;

    default:
      console.error(
        chalk.white(
          `${chalk.red(figures.cross)} Invalid init argument ${chalk.blue(arg)}`
        )
      );
  }
}

(async () => {
  if (process.argv[2]) {
    run(process.argv[2]);
  } else {
    const { arg }: { arg: string } = await prompts(
      {
        name: 'arg',
        type: 'select',
        message: `Run which ${chalk.blue('init')} command?`,
        choices: ['config', 'ticket'].map(c => ({ title: c, value: c })),
      },
      {
        onCancel: () => process.exit(),
      }
    );

    run(arg);
  }
})();
