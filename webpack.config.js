// const path = require("path");
// const webpack = require("webpack");

// module.exports = {
//   entry: { popup: "./src/popup/index.tsx", dialog: "./src/dialog/index.tsx" },
//   module: {
//     rules: [
//       {
//         test: /\.ts(x)?$/,
//         loader: "ts-loader",
//         exclude: /node_modules/,
//       },
//       {
//         test: /\.(js|jsx)$/,
//         exclude: /(node_modules|bower_components)/,
//         loader: "babel-loader",
//         options: { presets: ["@babel/env"] },
//       },
//       {
//         test: /\.css$/,
//         use: ["style-loader", "css-loader"],
//       },
//     ],
//   },
//   resolve: {
//     extensions: [".js", ".jsx", ".ts", ".tsx"],
//     alias: {
//       "react-dom": "@hot-loader/react-dom",
//     },
//   },
//   output: {
//     path: path.resolve(__dirname, "dist/"),
//     publicPath: "/dist/",
//     filename: "[name]Bundle.js",
//   },
//   devServer: {
//     contentBase: path.join(__dirname, "public/"),
//     port: 3000,
//     publicPath: "http://localhost:3000/dist/",
//     hotOnly: true,
//   },
//   plugins: [new webpack.HotModuleReplacementPlugin()],
// };

const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const config = {
  mode: "development",
  entry: { popup: "./src/popup/index.tsx", dialog: "./src/dialog/index.tsx" },
  output: { path: path.join(__dirname, "dist"), filename: "[name]Bundle.js" },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: /\.module\.css$/,
      },
      {
        test: /\.ts(x)?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
        include: /\.module\.css$/,
      },
      {
        test: /\.svg$/,
        use: "file-loader",
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: "url-loader",
            options: {
              mimetype: "image/png",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"],
    alias: {
      "react-dom": "@hot-loader/react-dom",
    },
  },
  devServer: {
    contentBase: "./dist",
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "public", to: "." }],
    }),
  ],
};

module.exports = config;
