import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
export default [
	{
		input: 'src/index.js',
		output: {
			name: 'lexo',
			file: 'dist/index.js',
			format: 'umd'
		},
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			})
		]
	}
];