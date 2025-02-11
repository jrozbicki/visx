/* eslint-disable no-undef */
const transpileModules = require('next-transpile-modules');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

// these deps are ESM-only so we must compile them even
// though we also use experimental.esmExternals
const withTM = transpileModules([
  'd3-array',
  'd3-color',
  'd3-format',
  'd3-interpolate',
  'd3-time',
  'd3-time-format',
  'internmap',
]);

const nextConfig = withTM({
  basePath: isProd ? '/visx' : '',
  assetPrefix: isProd ? '/visx/' : '',
  typescript: {
    // enable rendering when there are type errors
    ignoreDevErrors: true,
    ignoreBuildErrors: true,
  },
  experimental: {
    // note: this can be removed in future next versions
    esmExternals: 'loose',
  },
  webpack: (config) => {
    // add visx-*/src/* to be parsed by babel
    // note: the location of this rule depends/breaks based on our nextjs version
    // and/or next config itself (e.g., experimental flag)
    const babelConfig = config.module.rules[1];
    babelConfig.include.push(/visx-.*\/src/);

    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: 'react-docgen-typescript-loader',
          options: {
            // display types from outside a component's source even tho
            // we hide these with the propFilter below, if we don't do
            // this the component's own props become `any`
            tsconfigPath: path.resolve(__dirname, './tsconfig.json'),
            // filter props like React.HTMLProps/React.SVGProps
            propFilter(prop) {
              if (prop.parent) {
                return !prop.parent.fileName.includes('node_modules');
              }
              return true;
            },
          },
        },
      ],
    });

    return config;
  },
});

module.exports = nextConfig;
