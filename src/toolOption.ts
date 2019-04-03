import { FIX } from './fix'
import { getEnumKeys } from './misc'

export interface ParsedArgs {
  fix: FIX
  files: string[]
  toolOptions: ToolOptions
}

// export interface Options {
//   fix: FIX
//   inputFiles: string[]
// }

export interface ToolOptions {
  /**
   * Make sure there are no interactions (useful for CI - automated scripts)
   */
  noInteractive?: boolean
  /**
   * Path to a `tsconfig.json` project configuration file, in which case that project will be the target one.
   *
   * By default, the tool will work with `tsconfig.json` in the current folder.
   */
  tsConfigPath?: string
  /**
   * If true, the tool won't write changes to the files. This is useful to simulate if the fix won't fail, how many changes there would be, etc.
   */
  dontWrite?: boolean
  /**
   * Prints debug information to stdout.
   */
  debug?: boolean
  /**
   * Prints usage information and exit.
   */
  help?: boolean
}

export enum ToolOptionName {
  debug = 'debug',
  help = 'help',
  noInteractive = 'noInteractive',
  tsConfigPath = 'tsConfigPath',
  dontWrite = 'dontWrite'
}

export enum ToolOptionType {
  boolean = 'boolean',
  string = 'string'
}

export const toolOptionTypes = {
  [ToolOptionName.debug]: ToolOptionType.boolean,
  [ToolOptionName.help]: ToolOptionType.boolean,
  [ToolOptionName.noInteractive]: ToolOptionType.boolean,
  [ToolOptionName.tsConfigPath]: ToolOptionType.string,
  [ToolOptionName.dontWrite]: ToolOptionType.boolean
}

export const toolOptionNames = getEnumKeys(ToolOptionName)
