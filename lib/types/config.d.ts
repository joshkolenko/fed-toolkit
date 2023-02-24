export interface ConfigObj {
  [key: string]: any;
  /** Developer initials - Example: JMK */
  developer: string;
  /** Attribute used for inlining html tags. Defaults to `inline` */
  attribute: string;
  /** Output directory for inlined html files. Defaults to `dist` */
  outputDir: string;
  /** Option to clean contents of `outputDir` on build. Defaults to `true` */
  cleanOutputDir?: boolean;
  /** Directory for css & scss files. Defaults to `styles` */
  stylesDir: string;
  /** Directory for js files. Defaults to `js` */
  jsDir: string;
  /** Array of paths to be ignored by watcher. */
  ignoredPaths?: string[];
  /** Option to copy ticket path to clipboard after scaffolding a new ticket */
  copyTicketPath?: boolean;
  /** Extra directories to create when scaffolding a new ticket */
  extraDirs?: string[];
}
