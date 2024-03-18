import prettier from 'prettier'

const createConfig = assetPaths => {
  if (!assetPaths) assetPaths = []

  return prettier.format(
    JSON.stringify({
      assets: assetPaths.map(path => {
        return {
          path: path,
          ignore: false
        }
      }),
      minify: false
    }),
    {
      parser: 'json'
    }
  )
}

export default createConfig
