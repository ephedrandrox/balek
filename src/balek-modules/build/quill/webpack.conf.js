var path = require('path');

module.exports = {
    entry: "./lib.js",
    output: {
        path: __dirname + "/dist",
        filename: "quill.js",

        library: 'Quill',
        libraryTarget: 'umd',
        auxiliaryComment: 'Quill Library For Balek Diaplode Module',

    },
    resolve: {
        alias: {
            'parchment': path.resolve(__dirname, 'node_modules/parchment/src/parchment.ts'),
            'quill$': path.resolve(__dirname, 'node_modules/quill/quill.js'),
        },
        extensions: ['.js', '.ts', '.svg']
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/env']
                }
            }],
        }, {
            test: /\.ts$/,
            use: [{
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        declaration: false,
                        target: 'es5',
                        module: 'commonjs'
                    },
                    transpileOnly: true
                }
            }]
        }, {
            test: /\.svg$/,
            use: [{
                loader: 'html-loader',
                options: {
                    minimize: true,
                    esModule: false
                }
            }]
        }]
    }
}