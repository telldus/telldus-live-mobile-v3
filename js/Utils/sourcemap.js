let fs = require('fs');
let sm = require('source-map');
let prompt = require('prompt');

let sourceMap = './sourcemap.js'; // For now may use 'main.jsbundle.map'(from artifacts) for backtracing iOS.
let smap = JSON.parse(fs.readFileSync(sourceMap));

let sourceMapConsumer = new sm.SourceMapConsumer(smap);

function printStack(line, column) {
	let pos = sourceMapConsumer.originalPositionFor({
		line: line,
		column: column,
	});
	console.log(`${pos.source}:${pos.line} ${pos.name}`);
}

function parseStack(stack) {
	let stackArr = stack.split(' ');
	for (let i = 0; i < stackArr.length; ++i) {
		let frame = stackArr[i];
		if (frame.indexOf('@') >= 0) {
			frame = frame.split('@')[1];
		}
		// Frame might be in format line:col or file:line:col
		let [file, line, col] = frame.split(':');
		if (col === undefined) {
			col = parseInt(line, 10);
			line = parseInt(file, 10);
		}
		printStack(line, col);
	}
}

console.log('Input stacktrace in the format: t@725:64 o@723:1370 <unknown>@723:1891 <unknown>@37:757 callTimer@32:601');
prompt.start();
prompt.get(['stackString'], (err, result) => {
	if (err) {
		return onErr(err);
	}
	parseStack(result.stackString);
});

function onErr(err) {
	console.log(err);
	return 1;
}
