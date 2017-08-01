var data = []
	,structure = { // Estructura jerarquica NO CIRCULAR
					"id":1,
					"name":"",
					"type":"precursor",
					"children":[
						{
							"ref": 4
						},
						{
							"id":2,
							"name":"Este hijo de la gran chingada",
							"type":"process",
							"direction":"r",
							"children":[
								{ 
									"id":3,
									"name":"Nieto",
									"type":"process",
									"direction":"s",
									"children":[
										{
											"id":4,
											"name":"Bisnieto",
											"type":"process",
											"direction":"s",
											"children":[
												{
													"ref": 5
												}
											]
										}
									]
								},
								{
									"id": 5,
									"name": "Nieta",
									"type":"process",
									"direction": "l",
									"children": [
									]
								}
							]
						}
					]
				}
	,id_count = 0	// Contador de ID's, 
	,r = 50 		// Radio de los circulos
	,l = 6*r 		// Longitud de separación
	,lt = 0 		// (left t: posición del elemento que está mas hacia la izquierda)				
	,rt = 0 		// (right t: posición del elemento que está mas hacia la derecha)				
	,width = 0		// width del elemento SVG, esta dado por la distancia entre los elementos mas alejados horizontalmente
	,height = 0 	// height del elemento SVG,  esta dado por la distancia entre los elementos mas alejados verticalmente

/**
 * Transforma la estructure del árbol del sistema y la completa 
 * con los datos de posición de cada nodo iterando entre los hijos de la
 * estructura
 * 
 * @param  JSON structure Cadena JSON con la estructura hija
 * @param  Object parent Objeto padre de la estructura
 *
 * @RECURSIVE
 */
var _createStructure = function(root) {

	id_count++;

	if (!root.parent) {
		root.x = 0;
		root.y = 0;

		// Arreglo de relaciones por refencia en el nodo raiz
		root.references = [];

	} else {
		root.references = root.parent.references
	}

	if (!root.children) return;

	root.countChildren = { l: 0, s: 0, r: 0 };

	// Filtrando hijos tipo "ref" y agretando height como index del hijo de acuerdo a la dirección
	root.children = root.children.filter(function(node){
		if (!node.data.id) {
			root.references.push({
				ref: node.data.ref,
				parent: root
			});

			return false;
		}

		switch(node.data.direction) {
			case 'l':
				root.countChildren.l++;
				node.data.height = root.countChildren.l;
				break;
			case 's':
				root.countChildren.s++;
				node.data.height = root.countChildren.s;
				break;
			case 'r':
				root.countChildren.r++;
				node.data.height = root.countChildren.r;
				break;
		}

		return true;
	});

	root.children.forEach(function(node, i) {
		var t = 0;
		switch(node.data.direction) {
			case 'l':
				t = ((Math.PI/2)/(root.countChildren.l+1))*node.data.height + Math.PI/2;
				break;

			case 's':
				t = (Math.PI/(root.countChildren.s+1))*node.data.height;		
				break;

			case 'r':
				t = ((Math.PI/2)/(root.countChildren.r+1))*node.data.height;
				break;
		}
		node.x = Math.round(root.x + l*Math.cos(t));
		node.y = Math.round(root.y + l*Math.sin(t));

		_createStructure(node);

		// Definidiendo elemento mas hacia la izquierda, derecha y alto del <g>
		if ( (node.y + 2*r) > height) height = node.y + 2*r;
		if ( (node.x - 2*r) < lt) lt = node.x - 2*r;
		if ( (node.x + 2*r) > rt) rt = node.x + 2*r;
	});

	return root;
}

// Creates a curved (diagonal) path from parent to the child nodes
function diagonalH(s, d) {
    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

    return path
}

function diagonalV(s, d) {
    path = `M ${s.x} ${s.y}
            C ${(s.x + d.x) / 2} ${s.y},
              ${(s.x + d.x) / 2} ${d.y},
              ${d.x} ${d.y}`;

    return path
}


/**
 * Crea los elementos visuales y los añade al espacio de trabajo
 * 
 * @param  Array data Arreglo de los objetos a ser impresos sobre el espacio de trabjo
 */
var _printTree = function(source) {
	// Limpinado componente <tree>
	tree.html('');

	var nodes = source.descendants();

	// Normalizando posición
	nodes.forEach(function(d){
		d.x = d.x - lt;
		d.y = height - d.y - r
	});
	
	var links = nodes.slice(1);

	tree.selectAll('g')
		.data(nodes).enter()
		.append('g')
			.attr('id', function(e){ return 'n' + e.data.id; })
			.attr('class', function(d){ return d.data.type; })
			.attr('transform', function(d){ return 'translate(' + d.x + ', ' + d.y + ')'; });

	var groups = tree.selectAll('g');

	groups.append('circle')
			.attr('id', function(d){ return d.data.id})
			.attr('r', r)
			.attr('fill', "#ccc")
			.attr('class', function(d) { return d.data.type + (d.data.key ? ' tt-key': '') });

	groups.append('clipPath')
		.attr('id', function(d){ return "clip-" + d.data.id })
			.append('use')
			.attr('xlink:href', function(d){ return '#' + d.data.id; });

	groups.append('text')
		  .attr('clip-path', function(d){ return 'url(#clip-' + d.data.id + ')'; })
		  .attr('class', 'wrap')
		  .style('font-size', '12px')
		  .selectAll('tspan')
		  	.data(function(d){
		  		var words = d.data.name.split(' ');
		  		var arr = [];

		  		for(var i = 0; i < words.length; i++) {
		  			var w = words[i];
		  			var j = i + 1;
		  			while(w.length < 10 && j < words.length) {
		  				w = w + ' ' + words[j];
		  				j++;
		  			}
		  			i = j - 1;
		  			arr.push(w);
		  		}
		  		return arr;
		  	})
		  	.enter().append('tspan')
		  		.attr('x', 0)
		  		.attr('y', function(d, i, nodes){ return 13 + (i - nodes.length / 2 - 0.5) * 10})
		  		.text(function(d){ return d; });

	// Completando objetos por referencia
	root.references.forEach(function(e) {
		links.forEach(function(l){
			if (l.data && l.data.id == e.ref) {
				links.push({
					x: l.x,
					y: l.y,
					parent: e.parent
				})
			}
		});
	});

	tree.selectAll('.link')
			  .data(links).enter()
			  .insert('path', ':first-child')
				  .attr('class', function(d) {return 'link ' + d.parent.type; })
				  .attr('d', function(d){
					  	var s = {x: d.x, y: d.y}
					  	var t = {x: d.parent.x, y: d.parent.y}
						return diagonalV(s, t);
				  });
}

var workspace = d3.select("body")
					.append("svg")
					.attr("text-anchor", "middle")
					.attr("width", 2000)
    				.attr("height", 2000)

var tree = workspace.append('g')
					.attr('id', 'tree');

var root = d3.hierarchy(structure);
root = _createStructure(root);
_printTree(root);