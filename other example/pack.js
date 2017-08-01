var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var format = d3.format(",d");
var color = d3.scaleOrdinal(d3.schemeCategory20c);

var pack = d3.pack()
		     .size([width, height])
		     .padding(1.5);

d3.csv('data.csv', 
	function(d) {
		d.value = +d.value;
		if (d.value) return d;
	},
	function(error, classes){
		if (error) throw error;

		var root = d3.hierarchy({children: classes})
					.sum(function(d) { return d.value; })
					.each(function(d) {
						if (id = d.data.id) {
							var id, i = id.lastIndexOf(".");
							d.id = id;
							d.package = id.slice(0, i);
							d.class = id.slice(i + 1);
						}
					});

		var node = svg.selectAll(".node")
					// .data(pack(root).leaves())
					// .enter().append("g")
					// .attr("class", "node")
					// .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		console.log(pack(root))
		
	});