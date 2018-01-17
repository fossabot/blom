import webpack = require('webpack')

declare namespace ProgressBarWebpackPlugin {
  interface PluginOptions {
    complete: string
    incomplete: string
    format: string
    clear: boolean
  }
}

declare class ProgressBarWebpackPlugin extends webpack.Plugin {
  constructor(options: ProgressBarWebpackPlugin.PluginOptions)
}

export = ProgressBarWebpackPlugin
