const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, "resources", "login", "src", "index.js"),
    output: {
        publicPath: "/resources/login/dist/",
        filename: "bundle.js",
        path: path.resolve(__dirname, "resources", "login", "dist")
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
            },
            {
                test: /\.(jpeg|jpg|gif|png|svg)$/,
                use: 'file-loader'
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, "resources", "login", "dist")
    }
}