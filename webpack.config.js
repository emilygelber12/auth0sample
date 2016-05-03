var path = require('path');

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        index: './assets/js/index.js'
    },
    output: {
        path: path.join(__dirname, 'public', 'js'),
        filename: '[name].min.js'
    },
    module: {
        loaders: [
            {
                test: /.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'stage-0', 'react']
                }
            },
            { 
                test: /\.(png|jpg)$/, 
                loader: 'file-loader?name=images/[name].[ext]' 
            },

        ]
    }
};
