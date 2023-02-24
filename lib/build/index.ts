import path from 'path';
import chalk from 'chalk';
import figures from 'figures';

import { build } from './build.js';
import { watch } from './watch.js';

function run(arg: string, dir: string) {
  switch (arg) {
    case '-b':
      build(dir);
      break;

    case '-w':
      watch(dir);
      break;

    default:
      console.error(
        chalk.white(
          `${chalk.red(figures.cross)} Invalid build argument ${chalk.blue(
            arg
          )}`
        )
      );
  }
}

if (process.argv[2] === '-b' || process.argv[2] === '-w') {
  const INIT_CWD: string = process.env.INIT_CWD || '';
  const dir = path.resolve(INIT_CWD, process.argv[3] || '.');
  const arg = process.argv[2];

  run(arg, dir);
}
