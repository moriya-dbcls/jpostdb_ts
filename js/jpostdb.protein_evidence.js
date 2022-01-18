// jPOST-db Protein evidence

jpostdb.protein_evidence = jpostdb.protein_evidence || {
    param: {
	width: 10,
	height: 10,
	top: 0,
	size: 240, // pie chart size
	margin: 20,
	anime: 100
    },

    svg_height: {},

    init: function(stanza_params, stanza, renderDiv){
	var group = jpostdb.protein_evidence;
	var param = group.param;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);

	var renderDiv = d3.select(stanza.select(renderDiv));
	var view = renderDiv.append("div").attr("class", "view");
	var svg = view.append("svg")
	    .attr("id", "pie_chart_svg")
	    .attr("width", param.width)
	    .attr("height", param.height);
	var sel_div = view.append("div").attr("id", "protein_evidence_select_div");
	var table = view.append("div")
	    .style("padding", "0px")
	    .attr("id", "protein_table");

	let slice_stanza = "";
        if (parseInt(stanza_params["slice_stanza"]) == 1) slice_stanza = "slice_stanza_";
	var url = jpostdb.api + slice_stanza + "proteins_evidence?" + param.apiArg.join("&");
//	jpostdb.httpReq("get", url, null, group.pie_chart, svg, renderDiv, param.width / 2, 0);
	jpostdb.fetchReq("get", url, null, renderDiv, param.width, group.pie_chart);
    },

    pie_chart: function(data, renderDiv){
	var group = jpostdb.protein_evidence;
	var param = group.param;
	var svg = renderDiv.select("#pie_chart_svg");
	var sel_div = renderDiv.select("#protein_evidence_select_div");
	var table = renderDiv.select("#protein_table");
	
        var showProteinList = function(id){
	    let slice_stanza = "";
            if (parseInt(stanza_params["slice_stanza"]) == 1) slice_stanza = "slice_stanza_";
	    var url = jpostdb.api + slice_stanza + "protein_with_evidence?" + param.apiArg.join("&") + "&evidence=" + id;
	 //   jpostdb.httpReq("get", url, null, group.protein_with_evidence, svg, renderDiv, param.width / 2, param.top);
	    jpostdb.fetchReq("get", url, null, renderDiv, param.width, group.protein_with_evidence);
	}

	var changeSelect = function(id){
	    sel_div.select("#evidence_level").property("value", id);
	    showProteinList(id);
	}
	
	var h = param.size + param.margin + param.margin;
	svg.transition().duration(param.anime).attr("height", h);
	jpostdb.utils.pie_chart(data, svg, param.size, param.width, h, changeSelect);
	
	var select = sel_div.append("select").attr("class", "protein_evidence_select").attr("id", "evidence_level");
	select.append("option").attr("id", "sel_list_def").html("-- Show protein list --");
	select.selectAll(".level_list")
	    .data(data)
	    .enter()
	    .append("option")
	    .attr("class", "level_list")
	    .attr("value", function(d){ return d.id; })
	    .html(function(d){ return d.label; });
	select.on("change", function(){
	    var id = this.value;
	    if(!id.match(/^--/)){
		showProteinList(id);
	    }
	});
    },

    protein_with_evidence: function(data, renderDiv){
	var group = jpostdb.protein_evidence;
	var param = group.param;
	var svg = renderDiv.select("#pie_chart_svg");
	var table = renderDiv.select("#protein_table");
	var id = "proteins_with_evidence";

	data.title = ""; // show select
	
	var h = param.size + param.margin + param.margin;
	svg.transition().duration(param.anime).attr("height", h);
	jpostdb.utils.table(data, table, id, 10, 0);	
    }
};
