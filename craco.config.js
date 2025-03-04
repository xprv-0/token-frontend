const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const SentryPlugin = require("@sentry/webpack-plugin");
const meta = require("./package.json");

module.exports = function () {
  // determine if we are using sentry
  let useSentryPlugin = false;

  if (process.env.REACT_APP_SENTRY_DSN && process.env.SENTRY_AUTH_TOKEN) {
    useSentryPlugin = true;
  }

  const isTranslationBranch = ["1", "true"].includes(
    process.env.REACT_APP_IN_CONTEXT_TRANSLATION
  );
  const isMock = ["1", "true"].includes(process.env.REACT_APP_MOCKED);
  const useTranchesPath = isMock ? "__mocks__/use-tranches" : "use-tranches";
  const graphQlProviderPath = isMock
    ? "graphql-provider/__mocks__"
    : "graphql-provider";

  return {
    webpack: {
      configure: (webpackConfig) => {
        const definePlugin = webpackConfig.plugins.find(
          (webpackPlugin) => webpackPlugin instanceof webpack.DefinePlugin
        );
        definePlugin.definitions["process.env"] = {
          ...definePlugin.definitions["process.env"],
          BRANCH: JSON.stringify(process.env.BRANCH || ""),
          HEAD: JSON.stringify(process.env.HEAD || ""),
          COMMIT_REF: JSON.stringify(process.env.COMMIT_REF || ""),
        };
        const htmlWebpackPluginInstance = webpackConfig.plugins.find(
          (webpackPlugin) => webpackPlugin instanceof HtmlWebpackPlugin
        );
        htmlWebpackPluginInstance.options.translations = isTranslationBranch;
        return webpackConfig;
      },
      plugins: [
        useSentryPlugin
          ? new SentryPlugin({
              release: meta.version,
              include: "build/static/js",
              ignore: ["node_modules", "webpack.config.js"],
              urlPrefix: "~/static/js",
            })
          : null,
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: "static/css/[name].[contenthash:8].css",
          chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
          ignoreOrder: true,
        }),
        new webpack.NormalModuleReplacementPlugin(
          /(.*)GRAPHQL_PROVIDER(\.*)/,
          function (resource) {
            resource.request = resource.request.replace(
              /GRAPHQL_PROVIDER/,
              `${graphQlProviderPath}`
            );
          }
        ),
        new webpack.NormalModuleReplacementPlugin(
          /(.*)use-tranches(\.*)/,
          function (resource) {
            resource.request = resource.request.replace(
              /use-tranches/,
              `${useTranchesPath}`
            );
          }
        ),
      ].filter(Boolean),
    },
  };
};
