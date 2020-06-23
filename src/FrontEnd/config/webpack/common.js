/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const BlueprintReplacementPlugin = require("./blueprintReplacementPlugin");
const path = require("path");
const setupEntryFiles = require("./setupEntryFiles");
const webpack = require("webpack");

exports.setupCommonConfig = (isDevBuild, env) => {
    let blueprint = env && env.BLUEPRINT && `blueprints/${env.BLUEPRINT}`;
    if (!blueprint) {
        if (isDevBuild) {
            const [,, blueprintName] = process.argv;
            if (blueprintName && blueprintName !== "content-library") {
                blueprint = `blueprints/${blueprintName}`;
            }
        } else {
            blueprint = process.env.BLUEPRINT;
        }
    }

    if (!blueprint) {
        blueprint = "content-library";
    }

    console.log(`Blueprint is ${blueprint}.`);

    setupEntryFiles(isDevBuild, blueprint);

    const tsLoader = {
        loader: "ts-loader",
        options: {
            happyPackMode: true,
            getCustomTransformers: path.resolve(__dirname, "./transformers.js"),
        },
    };

    const commonConfig = {
        resolve: {
            extensions: [".tsx", ".ts", ".jsx", ".js"],
            plugins: [
                new TsconfigPathsPlugin({ configFile: "tsconfig.base.json" }),
            ],
        },
        plugins: [
            new BlueprintReplacementPlugin(blueprint),
            new webpack.DefinePlugin({
                BUILD_DATE: new Date().getTime(),
                BLUEPRINT_NAME: JSON.stringify(blueprint.replace("blueprints/", "")),
            }),
        ],
        stats: {
            builtAt: false,
            colors: true,
            hash: false,
            modules: false,
            entrypoints: false,
            performance: false,
            warningsFilter: [
                /Critical dependency: the request of a dependency is an expression/,
            ],
        },
        performance: {
            hints: false,
        },
        module: {
            rules: [
                {
                    test: /\.tsx$/,
                    exclude: /node_modules/,
                    use: [tsLoader],
                },
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: [tsLoader],
                }, {
                    test: /\.css$/,
                    use: [
                        "style-loader",
                        "css-loader",
                    ],
                },
                {
                    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                    use: "url-loader?limit=10000&mimetype=application/font-woff",
                }, {
                    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                    use: "url-loader?limit=10000&mimetype=application/font-woff",
                }, {
                    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                    use: "url-loader?limit=10000&mimetype=application/octet-stream",
                }, {
                    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                    use: "file-loader",
                }, {
                    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                    use: "url-loader?limit=10000&mimetype=image/svg+xml",
                },
            ],
        },
    };

    return commonConfig;
};