import webpack = require('webpack')

declare namespace HardSourceWebpackPlugin {
  interface PluginOptions {
    cacheDirectory?: string
    recordsPath?: string
    configHash?: (webpackConfig: {}) => string
    environmentHash?: false | string | {
      root: string;
      directories: string[];
      files: string[];
    }
  }
}

declare class HardSourceWebpackPlugin extends webpack.Plugin {
  constructor(options: HardSourceWebpackPlugin.PluginOptions)
}

export = HardSourceWebpackPlugin
