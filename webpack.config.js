const path = require('path');

module.exports = {
	devtool: 'eval-source-map',
	mode: 'development',
	entry: './App/src/index.js',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'App/public'),
	},
	module: {
		rules: [
			// Process JavaScript files with Babel
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						// specify the preset to use for JSX
						presets: ["@babel/preset-react"]
					}
				}
			},

			// Process CSS files with css-loader and style-loader
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			}
		]
	}
};
