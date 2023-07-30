const path = require('path');


module.exports = {
  target: 'node',	
  entry: {
	  SRW_Menus: './js/SRW Menus/main.js',
	  SRW_BattleScene: './js/Battle Scene/main.js',
	  SRW_Core: './js/SRW Core/main.js',
	  SRW_Editor: './js/Editor/main.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/..'
  },
  mode: 'development',
  /*node: {
	fs: 'empty'
},*/
   resolve: {
    extensions: [".ts", ".tsx", ".js", ".css"],
    fallback: {
      fs: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
	{
		 test: /\.(ttf|otf)(\?[a-z0-9=.]+)?$/, 
		loader: 'url-loader'
	  }
    ],
  },
  
};