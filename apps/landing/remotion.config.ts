import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setConcurrency(1);
Config.setChromiumOpenGlRenderer('angle');

// Webpack configuration for 3D assets
Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules ?? []),
        {
          test: /\.(glb|gltf)$/,
          type: 'asset/resource',
        },
        {
          test: /\.(hdr|exr)$/,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      ...currentConfiguration.resolve,
      extensions: [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.glb',
        '.gltf',
        ...(currentConfiguration.resolve?.extensions ?? []),
      ],
    },
  };
});