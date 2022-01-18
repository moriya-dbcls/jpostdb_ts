// jPOST-db Protein: go count

jpostdb.go_count = jpostdb.go_count || {
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
	var group = jpostdb.go_count;
	var param = group.param;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	
	var renderDiv = d3.select(stanza.select(renderDiv));
	renderDiv.append("div").attr("id", "go_category_select_div");
	group.mk_go_category_select(renderDiv);
	var view = renderDiv.append("div").attr("class", "view");
	var svg = view.append("svg")
	    .attr("id", "pie_chart_svg")
	    .attr("width", param.width)
	    .attr("height", param.height);
	var sel_div = view.append("div").attr("id", "go_count_select_div");
	var table = view.append("div")
	    .style("padding", "0px")
	    .attr("id", "protein_table");
	
        param.category = "biological_process";
        let slice_stanza = "";
        if (parseInt(stanza_params["slice_stanza"]) == 1) slice_stanza = "slice_stanza_";
	var url = jpostdb.api + slice_stanza + "proteins_go_count?" + param.apiArg.join("&") + "&category=" + param.category;
	jpostdb.fetchReq("get", url, null, renderDiv, param.width, group.pie_chart);
    },

    mk_go_category_select: function(renderDiv){
	var group = jpostdb.go_count;
	var param = group.param;
	var sel_div = renderDiv.select("#go_category_select_div");
	var select = sel_div.append("select").attr("class", "go_category_select").attr("id", "go_category");
	var data = [{category: "biological_process"}, {category: "molecular_function"}, {category: "cellular_component"}];
	select.selectAll(".category_list")
	    .data(data)
	    .enter()
	    .append("option")
	    .attr("class", "category_list")
	    .attr("value", function(d){ return d.category; })
	    .html(function(d){ return d.category; });
	select.on("change", function(){
	    param.category = this.value;
	    renderDiv.select("#pie_chart_svg").html("");
	    renderDiv.select("#go_count_select_div").html("");
	    renderDiv.select("#protein_table").html("");
	    let slice_stanza = "";
            if (parseInt(stanza_params["slice_stanza"]) == 1) slice_stanza = "slice_stanza_";
	    var url = jpostdb.api + slice_stanza + "proteins_go_count?" + param.apiArg.join("&") + "&category=" + param.category;
	    jpostdb.fetchReq("get", url, null, renderDiv, param.width, group.pie_chart);
	});
    },
    
    pie_chart: function(data, renderDiv){
	var group = jpostdb.go_count;
	var param = group.param;
	var svg = renderDiv.select("#pie_chart_svg");
	var sel_div = renderDiv.select("#go_count_select_div");
	var table = renderDiv.select("#protein_table");
	
        var showProteinList = function(id){
	    let slice_stanza = "";
            if (parseInt(stanza_params["slice_stanza"]) == 1) slice_stanza = "slice_stanza_";
	    var url = jpostdb.api + slice_stanza + "protein_with_go_term?" + param.apiArg.join("&") + "&category=" + param.category + "&term=" + id;
	    jpostdb.fetchReq("get", url, null, renderDiv, param.width, group.protein_with_go_term);
	}

	var changeSelect = function(id){
	    sel_div.select("#go_count").property("value", id);
	    showProteinList(id);
	}
	
	var h = param.size + param.margin + param.margin;
	svg.transition().duration(param.anime).attr("height", h);
	jpostdb.utils.pie_chart(data, svg, param.size, param.width, h, changeSelect);
	
	var select = sel_div.append("select").attr("class", "go_count_select").attr("id", "go_count");
	select.append("option").attr("id", "sel_list_def").html("-- Show protein list --");
	select.selectAll(".term_list")
	    .data(data)
	    .enter()
	    .append("option")
	    .attr("class", "term_list")
	    .attr("value", function(d){ return d.id; })
	    .html(function(d){ return d.label; });
	select.on("change", function(){
	    var id = this.value;
	    if(!id.match(/^--/)){
		showProteinList(id);
	    }
	});
    },

    protein_with_go_term: function(data, renderDiv){
	var group = jpostdb.go_count;
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
