const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, "resources", "dashboard_basic", "src", "index.js"),
    output: {
        publicPath: "/resources/dashboard_basic/dist/",
        filename: "bundle.js",
        path: path.resolve(__dirname, "resources", "dashboard_basic", "dist")
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
                test: /\.(jpeg|jpg|gif|png|svg|ttf|eot)$/,
                use: 'file-loader'
            },
            {
                test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: 'url-loader?limit=10000',
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, "resources", "dashboard_basic", "dist")
    }
}