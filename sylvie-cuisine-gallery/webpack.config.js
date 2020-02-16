const webpack = require('webpack');

module.exports = {
    target: "webworker",
    entry: "./index.js",
    mode: "production",
    plugins: [
        new webpack.DefinePlugin({
            API_KEY: JSON.stringify(process.env.API_KEY)
        })
    ],
}