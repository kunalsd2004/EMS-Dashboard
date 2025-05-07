/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side polyfills for node modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "path": require.resolve("path-browserify"),
        "util": require.resolve("util/"),
        "buffer": require.resolve("buffer/"),
        "querystring": require.resolve("querystring-es3"),
        "url": require.resolve("url/"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "assert": require.resolve("assert/"),
        "process": false,
        "os": false,
      };

      // Add buffer polyfill
      config.plugins.push(
        new config.webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      );
    }
    return config;
  },
  // Add any other Next.js config options here
};

module.exports = nextConfig; 