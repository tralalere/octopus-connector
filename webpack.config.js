var webpack = require("webpack");

module.exports = {
    entry: './index.ts',
    output: {
        filename: "./dist/octopus-connect.umd.js",
        libraryTarget: 'umd',
        library: "OctopusConnect"
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".js", ".ts"],
        alias: {

        }
    },
    module: {
        loaders: [
            { test: /\.ts?$/, loader: "ts-loader" }
        ]
    },
    externals: [/^\@angular\//, /^rxjs\//]
};
