const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "./src/scripts/jquery-3.1.1.slim.min.js", to: "jquery.js" },
      { from: "./src/styles/framework.css", to: "framework.css" },
      { from: "./src/index.css", to: "index.css" },
      { from: "./src/index.html", to: "index.html" }
    ])
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"]
      }
    ]
  },
  devServer: { contentBase: path.join(__dirname, "dist"), compress: true }
};
