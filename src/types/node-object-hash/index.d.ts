declare namespace NodeObjectHash {
  type NodeObjectHash = (
    options?: {
      coerce?: boolean
      sort?: boolean
      alg?: string
      enc?: string
    }
  ) => {
    sort: (obj: any) => string
    hash: (
      obj: any,
      options?: {
        alg?: string
        enc?: string
      }
    ) => string
  }
}

declare var nodeObjectHash: NodeObjectHash.NodeObjectHash

export = nodeObjectHash
