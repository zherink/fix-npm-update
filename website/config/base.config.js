/*********************************************************************************************************************
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.                                                *
 *                                                                                                                    *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/                                                                               *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const _ = require('lodash');

module.exports={
    entry:{
        main:["babel-polyfill","./entry.js"],
        check:["./js/browser-check.js"],
        client:["babel-polyfill","./js/client.js"],
        test:["babel-polyfill","./js/test.js"],
        vendor:["aws-sdk"]
    },
    output:{
        path:path.join(__dirname,'../build'),
        filename:"[name].js",
        chunkFilename: '[name].js', 
    },
    plugins:_.compact([
        new VueLoaderPlugin(),
        new CopyWebpackPlugin({ patterns: [{from:'./assets',to:"assets"}] }),
        new CopyWebpackPlugin({ patterns: [{from:'./styles',to:"styles"}] }),
        new CopyWebpackPlugin({ patterns: [{
            from:'../node_modules/aws-lex-web-ui/dist/wav-worker.min.js',
            to:"wav-worker.js"
        }]}),
        new HtmlWebpackPlugin({
            template:'./html/admin.pug',
            filename:'index.html',
            chunks:["main","check", "vendor"]
        }),
        new HtmlWebpackPlugin({
            template:'./html/test.ejs',
            filename:'test.html',
            chunks:["main","test","check"]
        }),
        new HtmlWebpackPlugin({
            template:'./html/client.pug',
            filename:'client.html',
            chunks:["client", "vendor"]
        }),
        new HtmlWebpackPlugin({
            filename:"health.html",
            templateContent:"ok\n",
            inject:false
        })
    ]),
    resolve: {
        modules: [path.resolve(__dirname, '../../'), 'node_modules'],
        extensions: [ '.js', '.vue', '.pug', '.styl', '.scss', '.css' ],
        alias: {
            vue$:'vue/dist/vue.js',
            handlebars: 'handlebars/dist/handlebars.min.js',
            querystring: 'querystring-browser'
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude:/node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['env']
                }
            },
            {
                test: /\.(md|txt)$/,
                loader: 'raw-loader'
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        'scss': 'vue-style-loader!css-loader!sass-loader',
                        'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
                        js:{
                            loader:'babel-loader',
                            options:{
                                presets: ['env']
                            }
                        }
                    }
                }
            },
            {
                test: /\.(png|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.(woff|woff2)$/,
                loader: 'file-loader?limit=100000',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/'
                }
            },
            {
                test: /\.pug$/,
                oneOf: [
                    {
                        resourceQuery: /^\?vue/,
                        use: ['pug-plain-loader'],
                    },
                    {
                        use: ['raw-loader', 'pug-plain-loader']
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            },
            {
                test: /\.styl$/,
                use: ['style-loader','css-loader','stylus-loader']
            },

            {
                test: /\.scss$/,
                use:[
                    {loader: "vue-style-loader"},
                    {loader: "css-loader" },
                    {loader: "sass-loader" }
                ]
            }
        ]
    }
}
