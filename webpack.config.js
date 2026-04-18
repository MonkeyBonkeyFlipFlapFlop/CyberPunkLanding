import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";

export default {
  mode: isProduction ? "production" : "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
  test: /\.(woff|woff2|eot|ttf|otf)$/i,
  type: 'asset/resource',
  generator: {
    filename: 'fonts/[name][ext]' 
  }
},
      {
        test: /\.ejs$/i,
        use: [
          {
            loader: "ejs-loader",
            options: {
              esModule: false 
            }
          }
        ], 
      },
      
      {
        test: /\.scss$/i,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
      
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: { // Исправлено: убрана лишняя скобка {
          filename: (pathData) => {
            const cleanPath = pathData.module.resource.split('?')[0];
            const relativePath = path.relative(
              path.resolve(__dirname, "src/components/img"),
              cleanPath
            );

            const folderPath = path.dirname(relativePath).replace(/\\/g, "/");
            const isWebp = pathData.module.resource.includes('as=webp');
            const extension = isWebp ? '.webp' : '[ext]';
            const finalDir = folderPath === "." ? "" : folderPath + "/";

            return `img/${finalDir}[name]${extension}`;
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/components/index.ejs",
    }),
    ...(isProduction
      ? [new MiniCssExtractPlugin({ filename: "style.css" })]
      : []),
  ],
  optimization: {
    minimize: isProduction,
    minimizer: [
      "...", 
      new CssMinimizerPlugin(),
      ...(isProduction
        ? [
            new ImageMinimizerPlugin({
              minimizer: {
                implementation: ImageMinimizerPlugin.sharpMinify,
                options: {
                  encodeOptions: {
                    jpeg: { quality: 80 },
                    jpg: { quality: 80 },
                    png: { compressionLevel: 9 },
                    webp: { quality: 75 },
                  },
                },
              },
              generator: [
                {
                  preset: "webp",
                  implementation: ImageMinimizerPlugin.sharpGenerate,
                  options: {
                    encodeOptions: {
                      webp: { quality: 70 },
                    },
                  },
                },
              ],
            }),
          ]
        : []),
    ],
  },
  devServer: {
    static: "./dist",
    hot: true,
    port: 1946,
    open: true,
  },
};