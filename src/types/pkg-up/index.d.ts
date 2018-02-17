declare namespace PkgUp {
  interface PkgUp {
    (cwd?: string): Promise<string | null>
    sync: (cwd?: string) => string | null
  }
}

declare var pkgUp: PkgUp.PkgUp

export = pkgUp
