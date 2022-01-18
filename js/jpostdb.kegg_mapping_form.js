// jPOST-db make database pie-chart

jpostdb.kegg_mapping_form = jpostdb.kegg_mapping_form || {
    param: {
	width: 10,
	height: 10,
    },

    init: function(stanza_params, stanza, renderDiv){
	var group = jpostdb.kegg_mapping_form;
	var param = group.param;
	var type = stanza_params.type;
	delete stanza_params.type;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	
	var renderDiv = d3.select(stanza.select(renderDiv));

        let slice_stanza = "";
        if (parseInt(stanza_params["slice_stanza"]) == 1) slice_stanza = "slice_stanza_";
	var url = jpostdb.api + slice_stanza + "dataset_kegg_gene?" + param.apiArg.join("&");
//	jpostdb.httpReq("get", url, null, group.pie_chart, svg, renderDiv, param.outSize / 2, param.outSize / 2);
	jpostdb.fetchReq("get", url, null,  renderDiv, param.width, group.make_form);
    },

    make_form: function(json, renderDiv){
	var group = jpostdb.kegg_mapping_form;
	var param = group.param;

	renderDiv.append("p").attr("class", "protein_info")
	    .html(json.prt_count + " KEGG genes");
	var form = renderDiv.append("form").attr("id", "stanza_kegg_mapping_form_gid")
	    .attr("action", "https://www.kegg.jp/kegg-bin/color_pathway_object")
	    .attr("target", "jpost_kegg").attr("method", "post").attr("enctype", "multipart/form-data");
	form.append("input").attr("type", "hidden").attr("name", "nocolor").attr("value", "1");
	var sel = form.append("select").attr("id", "kegg_map_select").attr("class", "kegg_map_select");
	sel.append("option").html("-- Select target --");
	sel.append("option").attr("value", "all").html("Map to All Pathway (slow)");
	var list_a = json.kegg_maps.children;
	for(var i = 0; i < list_a.length; i++){
	    sel.append("option").attr("class", "kegg_map_a").html("- " + list_a[i].name).attr("disabled", true);
	    var list_b = list_a[i].children;
	    for(var j = 0; j < list_b.length; j++){
		sel.append("option").attr("class", "kegg_map_b").html("-- " + list_b[j].name).attr("disabled", true);
		var list_c = list_b[j].children;
		for(var k = 0; k < list_c.length; k++){
		    sel.append("option").attr("class", "kegg_map_c").html( list_c[k].name).attr("value", list_c[k].name.match(/(^\d{5})/)[1]);
		}
	    }
	}
	
	var query = "";
	for(var i = 0; i < json.list.length; i++){
	    query += json.list[i].kegg + " " + json.list[i].color + "\n";
	}
	sel.on("change", function(){
	    var map_id = this.value;
	    if(!map_id.match(/^--/)){
		if(form.select("#org")) form.select("#org").remove();
		if(form.select("#reference")) form.select("#reference").remove();
		if(form.select("#unclassified")) form.select("#unclassified").remove();
		if(form.select("#multi_query")) form.select("#multi_query").remove();
		if(form.select("#map")) form.select("#map").remove();
		if(map_id == "all"){
		    var text = "";
		    for(var i = 0; i < json.list.length; i++){
			text += json.list[i].ko + " " + json.list[i].color + "\n";
		    }
		    form.append("input").attr("type", "hidden").attr("name", "org")
			.attr("id", "org").attr("value", json.org);
		    form.append("input").attr("type", "hidden").attr("name", "reference")
			.attr("id", "reference").attr("value", "white");
		    form.append("input").attr("type", "hidden").attr("name", "unclassified")
			.attr("id", "unclassified").attr("value", query);
		    form.attr("action", "https://www.kegg.jp/kegg-bin/color_pathway_object");
		}else{
		    form.append("input").attr("type", "hidden").attr("name", "map")
		        .attr("id", "map").attr("value", json.org + map_id);
		    form.append("input").attr("type", "hidden").attr("name", "reference")
			.attr("id", "reference").attr("value", "white");
		    form.append("input").attr("type", "hidden").attr("name", "multi_query")
		        .attr("id", "multi_query").attr("value", query);
		    form.attr("action", "https://www.kegg.jp/kegg-bin/show_pathway");
		}
		// form[0][0].submit(); // d3-DOM to native-DOM, can't open cross domain popup by "onchange" 
	    }
	});
	form.append("input").attr("type", "submit").attr("class", "stanza_submit").attr("value", "Mapping");  // "onclick" needs for cross domain popup

    }
};
