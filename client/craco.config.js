const path = require('path');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix for bundle name conflicts
      webpackConfig.output = {
        ...webpackConfig.output,
        filename: 'static/js/[name].[contenthash:8].js',
        chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
      };
      
      // Simplify source maps for faster builds
      if (process.env.NODE_ENV === 'development') {
        webpackConfig.devtool = 'eval';
        
        // Disable type checking during development for faster builds
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
        );
        
        // Reduce the number of chunks with a better configuration
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          maxInitialRequests: 10,
          minSize: 20000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Get the package name
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                // Return a unique name for the package
                return `vendor.${packageName.replace('@', '')}`;
              },
              priority: -10,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        };
        
        // Disable some development plugins
        webpackConfig.infrastructureLogging = {
          level: 'error', // Only log errors
        };
      }
      
      return webpackConfig;
    },
    // Add aliases for common imports
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
  // Disable ESLint for faster development
  eslint: {
    enable: false,
  },
  // Use babel-loader with cache
  babel: {
    loaderOptions: {
      cacheDirectory: true,
      cacheCompression: false,
    },
  },
  // Configure dev server
  devServer: {
    hot: true,
    client: {
      overlay: false,
      logging: 'error',
    },
    static: {
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/public/**'],
      },
    },
  },
}; 