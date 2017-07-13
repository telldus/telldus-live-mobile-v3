let fs = require('fs');
let sm = require('source-map');
let prompt = require('prompt');

let sourceMap = './sourcemap.js';
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
		let frame = stackArr[i].split('@');
		let [line, col] = frame[1].split(':');
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
