import webpack = require('webpack')

declare namespace ForkTsCheckerWebpackPlugin {
  interface PluginOptions {
    tsconfig: string
    tslint?: string | true
    watch?: string | string[]
    async?: boolean
    ignoreDiagnostics?: number[]
    ignoreLints?: string[]
    colors?: boolean
    logger?: any
    formatter?:
      | 'default'
      | 'codeframe'
      | ((message: string, useColors: boolean) => string)
    formatterOptions?: any
    silent?: boolean
    checkSyntacticErrors?: boolean
    memoryLimit?: number
    workers?: number
    vue?: boolean
  }
}

declare class ForkTsCheckerWebpackPlugin extends webpack.Plugin {
  public static ONE_CPU: number
  public static ALL_CPUS: number
  public static ONE_CPU_FREE: number
  public static TWO_CPUS_FREE: number

  constructor(options: ForkTsCheckerWebpackPlugin.PluginOptions)
}

export = ForkTsCheckerWebpackPlugin
