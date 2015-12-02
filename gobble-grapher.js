


var nodes = {};	// id → gobblenode
var links = [];	// elements: {source: id, target: id}

// Placeholders for d3-friendly data
var nodeNames = [];
var nodeRawNames= [];
var indexedLinks = [];

var path = require('path');

var cwd = process.cwd() + path.sep;

function getNodeName(node) {
	// Either the dir from the source node, or the id+name of the transform/merge
	var ndid = node.dir ? node.dir : node.id;
	ndid = ndid.replace(cwd, '');
	return ndid;
}

module.exports = function discover(node, notRoot) {

// console.log(ndid);
	var ndid = getNodeName(node);
	nodes[ndid] = node;	// Free bonus: root is node zero.

	nodes[ndid].group=1;	// Assume a source node for colouring

// 	console.dir(node);

	if ('inputs' in node) {
// 		node._nodetype = 'Merger';

		for(var i in node.inputs) {
			links.push({
				source: getNodeName(node.inputs[i]),
				target: node.id
			});

			discover(node.inputs[i], true);
		}

		nodes[ndid].group=2;	// Different colour
	}

	if ('transformer' in node) {
// 		node._nodetype = 'Transformer';
// console.log('Processing transformer node');

		links.push({
			source: getNodeName(node.input),
			target: node.id
		});

		discover(node.input, true);

		nodes[ndid].group=3;	// Different colour

	}





	if (notRoot === undefined) {
		// This is run last, after the rest of the tree has been processed.
		// Juggle the data so D3 likes it.

		for (var i in nodes) {
			nodeNames.push({name: i, group: nodes[i].group});
			nodeRawNames.push(i);
		}

		for (var i in links) {
			indexedLinks.push({
				source: nodeRawNames.indexOf(links[i].source),
				target: nodeRawNames.indexOf(links[i].target),
				value: 1
			});
		}
	}

	return node;
}





var http = require('http'),
    fs = require('fs'),
    handlebars = require('handlebars');

var template = handlebars.compile( fs.readFileSync(path.join(__dirname, 'gobble-grapher.hbs')).toString() );


http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});

	res.end( template({
		links: JSON.stringify(indexedLinks),
		nodes: JSON.stringify(nodeNames)
	}) );
}).listen(4568);

console.log('Gobble-grapher started, visit http://localhost:4568 to see the graph of your Gobble workflow');


