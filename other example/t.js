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
							"name":"Hijo",
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
	,data = []		// Arreglo de objetos por referencia
	,id_count = 0	// Contador de ID's, 
	,r = 50 		// Radio de los circulos
	,l = 6*r 		// Longitud de separación
	,lt = 0 		// (left t: posición del elemento que está mas hacia la izquierda)				
	,rt = 0 		// (right t: posición del elemento que está mas hacia la derecha)				
	,width = 0		// width del elemento SVG, esta dado por la distancia entre los elementos mas alejados horizontalmente
	,height = 0 	// height del elemento SVG,  esta dado por la distancia entre los elementos mas alejados verticalmente
	,duration = 20 //Duración de la animación
	,ref = []

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
var _createStructure = function(structure, parent) {
	id_count++;
	structure.forEach(function(e, i) {
		if (!e.id) {
			ref.push({
				ref: e.ref, 
				parent: parent
			});
			return;
		}

		e.countChildren = { l: 0, s: 0, r: 0 };

		e.children.forEach(function(c) {
			switch(c.direction) {
				case 'l':
					e.countChildren.l++;
					break;
				case 's':
					e.countChildren.s++;
					break;
				case 'r':
					e.countChildren.r++;
					break;
			}
		});

		e.angle = function(direction, i) {
			switch(direction) {
				case 'l':
					return ((Math.PI/2)/(e.countChildren.l+1))*i + Math.PI/2;
					break;

				case 's':
					return (Math.PI/(e.countChildren.s+1))*i;		
					break;

				case 'r':
					return ((Math.PI/2)/(e.countChildren.r+1))*i;		
					break;
			}
		}

		if (!parent) {
			e.position = {x: 0, y: 0};
			parent = {
				position: e.position,
				type: ''
			}

		} else {
			var p = 1;
			for(var j = 0; j < parent.children.length; j++) {
				if (e == parent.children[j]) break;

				if (e.direction == parent.children[j].direction)
					p++;
			}
			var t = parent.angle(e.direction, p);
			e.position = {x: Math.round(parent.position.x + l*Math.cos(t)),
						  y: Math.round(parent.position.y + l*Math.sin(t))};
		}

		e.parent = parent;
		data.push(e);

		_createStructure(e.children, e);

		console.log(e.position.x, lt)
		if ( (e.position.y + 2*r) > height) height = e.position.y + 2*r;
		if ( (e.position.x - 2*r) < lt) lt = e.position.x - 2*r;
		if ( (e.position.x + 2*r) > rt) rt = e.position.x + 2*r;
	});
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

	// Normalizando posición
	data.forEach(function(d){
		d.position.x = d.position.x - lt;
		d.position.y = height - d.position.y - r
	});
	
	tree.selectAll('g')
		.data(data).enter()
		.append('g')
			.attr('id', function(e){ return 'n' + e.id; })
			.attr('class', function(d){ return d.type; })
			.attr('transform', function(d){ return 'translate(' + d.position.x + ', ' + d.position.y + ')'; });

	var groups = tree.selectAll('g');

	groups.append('circle')
			.attr('r', r)
			.attr('class', function(d) { return d.type + (d.key ? ' tt-key': '') });

	var texts = groups.append('text')
		  .attr('class', 'wrap')
		  .style('font-size', '12px')
		  .text(function(d){ return d.name; });

	// texts[0].forEach(function(d, i){
	// 	d3plus.textwrap()
	// 		  .container(d3.select(d))
	// 		  .draw();
	// });

	groups.append('circle')
		.attr('class', 'adds')
		.attr('r', 10)
		// .on('click', _clickAdd);
	groups.append('text')
		.attr('class', 'adds-text')
		.text('\uea0a')
		// .on('click', _clickAdd);
	groups.append('circle')
		.attr('class', 'edits')
		.attr('r', 10)
		// .on('click', _clickEdit);
	groups.append('text')
		.attr('class', 'edits-text')
		.text('\ue905')
		// .on('click', _clickEdit);
	groups.append('circle')
		.attr('class', 'removes')
		.attr('r', 10)
		// .on('click', _clickRemove);
	groups.append('text')
		.attr('class', 'removes-text')
		.text('\uea0b')
		// .on('click', _clickRemove);

	// Completando objetos por referencia
	ref.forEach(function(e) { 
		for(var i = 0; i < source.length; i++) {
			if (e.ref == source[i].id) {
				e.position = source[i].position;
				console.log(e)
				source.push(e);
				break;
			}
		}
	});
	source = source.slice(1);

	tree.selectAll('.link')
				  .data(source).enter()
			  .insert('path', ':first-child')
				  .attr('class', function(d) {return 'link ' + d.parent.type; })
				  .attr('d', function(d){
				  	if (d.id === 1) return;
				  	var a = {x: d.position.x, y: d.position.y}
				  	var b = {x: d.parent.position.x, y: d.parent.position.y}
					return diagonalV(a, b);
				  })
				  .style('opacity', 0)
				  .transition()
				  .duration(duration)
				  .style('opacity', 1);

	function repeat() {
		groups.select('circle.tt-key')
			.attr('r', 50)
			.transition()
			.duration(1000)
			.attr('r', 60)
			.transition()
			.duration(1000)
			.delay(1000)
			.attr('r', 50);

		setTimeout(repeat, 2000);
	}
	repeat();
}

var workspace = d3.select("body")
					.append("svg")
					.attr("width", 2000)
    				.attr("height", 2000)

var tree = workspace.append('g')
					.attr('id', 'tree');

_createStructure([structure]);
_printTree(data);