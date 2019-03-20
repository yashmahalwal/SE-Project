const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, "src", "index.js"),
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    resolve: {
        modules: [path.resolve(__dirname, '../../', 'node_modules'), 'node_modules']
    },
    resolveLoader: {
        modules: [path.resolve(__dirname, '../../', 'node_modules'), 'node_modules']
    },
    module: {
        rules: [{
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }, {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.jsx$/,
                use: 'babel-loader'
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist')
    }
}