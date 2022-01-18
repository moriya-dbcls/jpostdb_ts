// jPOST-db Group comparison


jpostdb.slice_comparison = jpostdb.slice_comparison || {
    
    param: {
	seqLen: 0,
	width: 0,
	height: 0,
	margin: 20,
	marginLeft: 20,
	marginTop: 20,
	marginRight: 50,
	marginBottom: 50,
	freqHeight: 100,
	top: 0,
	tablePage: 0,
	lineHeight: 16,
	freqLineY: 0,
	mouseX: 0,
	mouseY: 0,
	dragMouseX: 0,
	dragStartX: 0,
	dragFlagX: false,
	dragFlagY: false,
	anime: 100,
	animeFreq: 200
    },

    init: function(stanza_params, stanza, renderDiv){
	var group = jpostdb.slice_comparison;
	var param = group.param;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	
	param.stanza = stanza;
	param.stanza_params = stanza_params;
	
	param.top = 0;
	param.yArea = 400;
	param.xAxisY = param.yArea + param.marginTop;
	param.graphHeight = param.width;
	param.yAxisX = Math.round(((param.width - param.marginLeft - param.marginRight) / 2 + param.marginLeft) * 10) / 10;
	param.xArea = param.yAxisX - param.marginLeft;
	if(param.xArea > 400) param.xArea = 400;

	var renderDiv = d3.select(stanza.select(renderDiv));
	var view = renderDiv.append("div").attr("class", "view");
	var stats = view.append("div").attr("id", "stats_table");
	var diffexp = view.append("div").style("padding", "0px").attr("id", "diffexp");
	var svg = diffexp.append("svg")
	    .attr("id", "volcano_svg")
	    .attr("width", param.width)
	    .attr("height", param.height);
	var table = diffexp.append("div")
	    .attr("id", "protein_table");
	var enrich = view.append("div").style("padding", "0px").attr("id", "enrich");

	enrich.append("div").attr("id", "enrich_top").style("padding", "0px");
	enrich.append("svg").attr("id", "enrich_svg").attr("width", param.width).attr("height", 0);
	enrich.append("div").attr("id", "enrich_table").style("padding", "0px " + param.margin + "px 0px " + param.margin + "px");

	var url = jpostdb.api + "slice_comp_stats?" + param.apiArg.join("&");
//	jpostdb.httpReq("get", url, null, group.stats_table, svg, renderDiv, param.yAxisX, param.top);
	jpostdb.fetchReq("get", url, null, renderDiv, param.width, group.stats_table);
	
    },

    stats_table: function(json, renderDiv){
	var group = jpostdb.slice_comparison;
	var param = group.param;
	var div = renderDiv.select("#stats_table");

	// make table
	div.append("h3").html("Statistics");
	var table = div.append("table").attr("class", "slice_stat")
	var tr = table.append("tr");
	tr.append("th").attr("rowspan", 2);
	tr.append("th").attr("colspan", 2).html(decodeURIComponent(json.slice1));
	tr.append("th").attr("rowspan", 2).html("share");
	tr.append("th").attr("colspan", 2).html(decodeURIComponent(json.slice2));
	tr = table.append("tr");
	tr.append("th").html("total");
	tr.append("th").html("unique");
	tr.append("th").html("total");
	tr.append("th").html("unique");
	tr = table.append("tr");
	tr.append("td").html("# datasets");
	var td = tr.append("td");
	if(!json.ds_share) td.html(json.ds1);
	td = tr.append("td");
	if(json.td_share) td.html(json.ds1_uniq);
	td = tr.append("td");
	if(json.td_share) td.style("color", "red").html(json.ds_share);
	td = tr.append("td");
	if(!json.td_share) td.html(json.ds2);
	td = tr.append("td");
	if(json.td_share) td.html(json.td_uniq);
	tr = table.append("tr");
	tr.append("td").html("# proteins");
	tr.append("td").html(json.prot1);
	tr.append("td").html(json.prot1_uniq);
	tr.append("td").html(json.prot_share);
	tr.append("td").html(json.prot2);
	tr.append("td").html(json.prot2_uniq);
	tr = table.append("tr");
	tr.append("td").html("# peptides");
	tr.append("td").html(json.pep1);
	tr.append("td").html(json.pep1_uniq);
	tr.append("td").html(json.pep_share);
	tr.append("td").html(json.pep2);
	tr.append("td").html(json.pep2_uniq);


	// make select meny
	div.append("h3").html("Differential Expression Analysis");
	var ul = div.append("ul").attr("class", "memo");
	ul.append("li").html("The quantification is based on spectral counting.");
	ul.append("li").html("Some methods need at least 2 datasets in either slice.");
	
	var select = div.append("select").attr("class", "slice_comparison_select").attr("id", "validation_method");
	select.append("option").attr("id", "sel_list_def").html("-- Select method --");
	var eb = select.append("option").attr("value", "eb").html("Empirical Bayes estimation");
	var wc = select.append("option").attr("value", "wc").html("Wilcoxon rank sum test");
	if((json.ds1 && (json.ds1 - 0 < 2 || json.ds2 - 0 < 2))
	   || (json.ds1_uniq && (json.ds1_uniq - 0 < 2 || json.ds2_uniq - 0 < 2))){
	    eb.attr("disabled", true);
	    wc.attr("disabled", true);
	} 
	select.append("option").attr("value", "fc").html("Fold change of average")
	select.on("change", function(){
	    var valid = this.value;
	    if(!valid.match(/^--/)){
		div.select("#sel_list_def").attr("selected", null).attr("selected", true);
		var volcano_svg = renderDiv.select("#volcano_svg");
		volcano_svg.transition().duration(param.anime).attr("height", 0);
		renderDiv.select("#enrich_svg").transition().duration(param.anime).attr("height", 0);
		if(volcano_svg.selectAll("#vplot")) volcano_svg.selectAll("#vplot").remove();
		if(renderDiv.select("#protein_table_div")) renderDiv.select("#protein_table_div").remove();
		if(renderDiv.select("#fc_protein_list_div")) renderDiv.select("#fc_protein_list_div").remove();
		if(renderDiv.select("#enrich_head")) renderDiv.select("#enrich_head").remove();
		if(renderDiv.selectAll(".forcegraph")) renderDiv.selectAll(".forcegraph").remove();
		if(renderDiv.select("#enrich_list")) renderDiv.select("#enrich_list").remove();
		var arg = [];
		for(var i = 0; i< param.apiArg.length; i++){
		    if(param.apiArg[i].match(/^dataset/)) arg.push(param.apiArg[i]);
		}
		var method = "sc";
		var url = jpostdb.subApi + "quant_test?" + arg.join("&") + "&method=" + method + "&valid=" + valid; // validation API using R script
		//	jpostdb.httpReq("get", url, null, group.volcano_plot, svg, renderDiv, param.yAxisX, param.top);
		jpostdb.fetchReq("get", url, null, renderDiv, param.width, group.volcano_plot);
	    }
	});
	
    },

    volcano_plot: function(json, renderDiv){
	var group = jpostdb.slice_comparison;
	var param = group.param;
	var svg = renderDiv.select("#volcano_svg");	
	var table = renderDiv.select("#protein_table");
	var enrich = renderDiv.select("#enrich");
	var proteinList = [];
	var excludeList = [];
	var selectFlag = 0; //0: both, 1: up, 2: down

	var table_div = table.append("div")
	    .attr("id", "protein_table_div");
	var stack = [];
	var keyword;
	table_div.append("input")
	    .attr("size", "20")
	    .attr("type", "text")
	    .attr("placeholder", "search protein")
	    .attr("id", "search_text")
	    .style("float", "right")
	    .style("text-align", "right")
	    .style("padding-right", "10px")
	    .on("change", function(){
		keyword = this.value.toLowerCase();
		stack.push(1);
		setTimeout(function() {
		    stack.pop();
		    if(stack.length == 0) {
			textSearch(keyword);
			stack = [];
		    }
		}, 150);
	    });
	table_div.append("table")
	    	.attr("id", "plist");
	param.popupStanzaDiv = table.append("div").attr("id", "psm_align_compare");

	param.logfc = 1;
	param.fc = 2 ** param.logfc;
	param.pvalue = 0.05;
	param.proteinCount = 0;

	var tableData = {
	    head: ["", "Protein name", "Accession", "ID", "Fold change", "log(fc)", "p-value", "PSMs"],
	    arg: ["_bgcolor", "name", "uniprot", "id", "foldchange", "logfc", "p_value", "psm"],
	    align: [0,0,0,0,1,1,1,0],
	    width: [20,"","","","","","",""],
	    data: proteinList
	};
	
	var onlyFoldChange = 0;
	if(json[0].p_value == "-") onlyFoldChange = 1;
	
	var setInitData = function(){	
	    param.maxFc = 0;
	    param.maxP = 0;
	    for(var i = 0; i < json.length; i++){
		var tmp = json[i].logfc - 0;
		if(tmp < 0) tmp *= -1;
		json[i].logfcAb = tmp;
		if(param.maxFc < tmp) param.maxFc = tmp;
		if(onlyFoldChange == 0){
		    json[i].logp = Math.log(json[i].p_value - 0) / Math.log(10) * (-1);
		    if(param.maxP < json[i].logp) param.maxP = json[i].logp;
		}
	//	json[i]._alink_name = "javascript:jPost.openProtein('" + json[i].uniprot + "')";
		json[i]._alink_name = "/protein?id=" + json[i].uniprot;
		json[i]._alink_uniprot = "http://www.uniprot.org/uniprot/" + json[i].uniprot;
		json[i]._target_name = "_new";
		json[i]._target_uniprot = "_new";
	//	json[i]._alink_psm = "javascript:jpostdb.slice_comparison.popupStanza('" + json[i].uniprot + "')";
		json[i]._innerhtml_psm = "<input type=\"button\" value=\"open\" id=\"psm_button_" + json[i].uniprot + "\" onclick=\"javascript:jpostdb.slice_comparison.popupStanza('" + json[i].uniprot + "')\">";
	    }

	    if(onlyFoldChange){
		// histogram like dot plotting
		var range = Math.ceil(param.maxFc) * 5;
		var counting = [];
		for(var j = 0; j < range * 2; j++){ counting[j] = 0; }
		for(var i = 0; i < json.length; i++){
		    var logfc = json[i].logfc - 0;
		    for(var j = 0; j < range * 2; j++){
			if(logfc < (j + 1 - range) / 5){
			    counting[j]++;
			    json[i].logp = counting[j];
			    if(param.maxP < json[i].logp) param.maxP = json[i].logp;
			    break;
			}
		    }
		}
	    }
	};

	var selectionSwitch = function(){
	    var rect = svg.select("#swich_button_rect");
	    var text = svg.select("#swich_button_text");
	    if(selectFlag == 0){
		rect.attr("fill", "#ef8197");
		text.text("up");
		selectFlag = 1;
	    }else if(selectFlag == 1){
		rect.attr("fill", "#81adef");
		text.text("down");
		selectFlag = 2;
	    }else{
		rect.attr("fill", "#c6c6c6");
		text.text("both");
		selectFlag = 0;
	    }
	    setData();
	    plot(1);
	};
	
	var setData = function(){
	    param.proteinCount = 0;
	    proteinList = [];
	    excludeList = [];
	    // set initial p-value
	    if(onlyFoldChange){
		param.pvalue = 1;
	    }else{
		while(param.pvalue < Math.E**(param.maxP * Math.log(10) * (-1)) && param.pvalue < 0.9){
		    if(param.pvalue < 0.1) param.pvalue += 0.01;
		    else param.pvalue += 0.1;
		    param.pvalue = Math.round(param.pvalue * 100) / 100;
		}
	    }
	    for(var i = 0; i < json.length; i++){
		if((json[i].p_value - 0 <= param.pvalue || onlyFoldChange) && json[i].logfc - 0 >= param.logfc){ // up
		    if(selectFlag != 2){
			json[i].color = "#ef8197";
			param.proteinCount++;
			proteinList.push(json[i]);
		    }else{
			json[i].color = "#a2687e";
			excludeList.push(json[i]);
		    }
		}else if((json[i].p_value - 0 <= param.pvalue || onlyFoldChange) && json[i].logfc - 0 <= param.logfc * (-1)){ // down
		    if(selectFlag != 1){
			json[i].color = "#81adef";
			param.proteinCount++;
			proteinList.push(json[i]);
		    }else{
			json[i].color = "#6880a3";
			excludeList.push(json[i]);
		    }
		}else{
		    excludeList.push(json[i]);
		    if((json[i].p_value - 0 > param.pvalue || onlyFoldChange) && json[i].logfc - 0 >= param.logfc) json[i].color = "#a2687e";  // up high-p-val
		    else if((json[i].p_value - 0 > param.pvalue || onlyFoldChange) && json[i].logfc - 0 <= param.logfc * (-1)) json[i].color = "#6880a3"; // down high-p-val
		    else if((json[i].p_value - 0 <= param.pvalue || onlyFoldChange) && json[i].logfc - 0 > param.logfc * (-1)) json[i].color = "#a87fc4";
		    else if((json[i].p_value - 0 <= param.pvalue || onlyFoldChange) && json[i].logfc - 0 < param.logfc) json[i].color = "#a87fc4";
		    else json[i].color = "#888888";
		}
	    }
	    proteinList = proteinList.sort(function(a,b){
		if(a.logfcAb - 0 > b.logfcAb - 0) return -1;
		if(a.logfcAb - 0 < b.logfcAb - 0) return 1;
		return 0;
	    });
	    excludeList = excludeList.sort(function(a,b){
		if(a.logfcAb - 0 > b.logfcAb - 0) return -1;
		if(a.logfcAb - 0 < b.logfcAb - 0) return 1;
		return 0;
	    });
	};

	var textSearch = function(keyword){
	    var newList = [];
	    var table = renderDiv.select("#fc_protein_list");

	    for(var i = 0; i < proteinList.length; i++){
		if((proteinList[i].name && proteinList[i].name.toLowerCase().match(keyword))
		   || (proteinList[i].id && proteinList[i].id.toLowerCase().match(keyword))
		    || proteinList[i].uniprot.toLowerCase().match(keyword)){
		    newList.push(proteinList[i]);
		}
	    }
	    if(keyword){
		for(var i = 0; i < excludeList.length; i++){
		    if((excludeList[i].name && excludeList[i].name.toLowerCase().match(keyword))
		       || (excludeList[i].id && excludeList[i].id.toLowerCase().match(keyword))
			|| excludeList[i].uniprot.toLowerCase().match(keyword)){
			newList.push(excludeList[i]);
		    }
		}
	    }
	    tableData.data = newList;
	    jpostdb.utils.table(tableData, table_div, "fc_protein_list", 15, 0);
	};
	    
	var plot = function(f){
	    if(f){
		svg.selectAll(".plot")
		    .attr("fill", function(d){ return d.color;});

		// plot table
		tableData.data = proteinList;
		jpostdb.utils.table(tableData, table_div, "fc_protein_list", 15, 0);
		
		var arg = [];
		for(var i = 0; i < proteinList.length;i++){ arg.push(proteinList[i].uniprot + ":" + proteinList[i].logfc); }
		param.args = arg.join("_");
		
		svg.select("#protein")
		.text("# Proteins: " + param.proteinCount);
	    }
	    svg.select("#fc_pa")
		.attr("transform", "translate(" + (param.logfc / param.maxFc * param.xArea) + ", 0)");
	    svg.select("#fc_na")
		.attr("transform", "translate(" + (-1 * param.logfc / param.maxFc * param.xArea) + ", 0)");
	    svg.select("#fc")
		.text("Fold change >= " + param.fc);
	    if(onlyFoldChange == 0){
		svg.select("#p_a")
	    	    .attr("transform", function(d){ return "translate(0," + (Math.log(param.pvalue) / Math.log(10) / param.maxP * param.yArea) + ")";} );
		var tmp_p = param.pvalue.toExponential();
		if(param.pvalue == 1) tmp_p = 1;
		svg.select("#pval")
		    .text("p-value <= " + tmp_p);
	    }
	    renderDiv.select("#search_text")[0][0].value = "";
	};
	
	var render = function(){
	    param.top += param.marginTop;
	    var g = svg.append("g")
		.attr("transform", "translate(0," + param.top + ")")
		.attr("id", "vplot");
	    g.append("path")
		.attr("stroke", "#000000")
		.attr("fill", "none")
		.attr("stroke-width", "2px")
		.attr("d", "M " + param.yAxisX + " " + param.xAxisY + " V 0");
	    g.append("path")
		.attr("stroke", "#000000")
		.attr("fill", "none")
		.attr("stroke-width", "2px")
		.attr("d", "M " + (param.yAxisX - param.xArea) + " " + param.xAxisY + " H " + (param.yAxisX + param.xArea));  
	    g.selectAll(".plot")
		.data(json)
		.enter()
		.append("circle")
		.attr("class", "plot")
		.attr("r", 3)
		.attr("cx", function(d){ return param.yAxisX + d.logfc /param.maxFc * param.xArea;})
	    	.attr("cy", function(d){ return param.xAxisY - d.logp / param.maxP * param.yArea;});
	    var num = 1;
	    var multi = 10;
	    if(Math.log(1e-10) / Math.log(10) * (-1) < param.maxP) multi = 100;
	    y_scale = 1 / multi;
	    while(Math.log(y_scale) / Math.log(10) * (-1) < param.maxP){
		var sc = g.append("g");
		sc.append("path")
		    .attr("class", "y_scale")
		    .attr("stroke", "#000000")
		    .attr("fill", "none")
		    .attr("stroke-width", "1px")
		    .attr("d", "M -5 0 H 5");
		sc.append("text")
		    .text(y_scale.toExponential())
		    .attr("text-anchor", "start")
		    .attr("x", 10)
		    .attr("class", "y_scale");
		sc.attr("transform", "translate(" + param.yAxisX + ", " + (param.xAxisY + (Math.log(y_scale) / Math.log(10) / param.maxP * param.yArea)) + ")");
		num *= multi;
		y_scale = 1 / num;
	    }
	    var x_scales = [2, 5, 10, 20, 50, 100, 200, 500];
	    for(var i = 0; i < x_scales.length; i++){
		if(Math.log(x_scales[i]) / Math.log(2) > param.maxFc) break;
		var sc = g.append("g");
		sc.append("path")
		    .attr("class", "x_scale")
		    .attr("stroke", "#000000")
		    .attr("fill", "none")
		    .attr("stroke-width", "1px")
		    .attr("d", "M 0 0 V 5");
		sc.append("text")
		    .text(x_scales[i])
		    .attr("text-anchor", "middle")
		    .attr("y", 18)
		    .attr("class", "x_scale");
		sc.attr("transform", "translate(" + (param.yAxisX + Math.log(x_scales[i]) / Math.log(2) / param.maxFc * param.xArea) +  ", " + param.xAxisY + ")");
	    }
	    var fc_pa = g.append("g")
		.attr("id", "fc_pa");
	    fc_pa.append("path")
		.attr("stroke", "#888888")
		.attr("fill", "none")
		.attr("stroke-width", "1.5px")
		.attr("d", "M " + param.yAxisX + " " + param.xAxisY + " V 0");
	    var fc_pa_knob = fc_pa.append("g")
	    	.on("mouseover", function(){ param.arrX = true; })
	    	.on("mouseout", function(){  if(!param.dragFlagX) param.arrX = false; });
	    fc_pa_knob.append("rect")
		.attr("stroke", "none")
		.attr("fill", "#ffffff")
		.attr("stroke", "#aaaaaa")
		.attr("stroke-width", "1px")
		.attr("x", param.yAxisX - 50)
		.attr("y", param.xAxisY + 20)
		.attr("rx", 5)
		.attr("ry", 5)
		.attr("width", 100)
		.attr("height", 16);
	    fc_pa_knob.append("polygon")
		.attr("stroke", "none")
		.attr("fill", "#aaaaaa")
		.attr("points", param.yAxisX + " " + (param.xAxisY + 22) + " " + (param.yAxisX - 10) + " " + (param.xAxisY + 32) + " " + (param.yAxisX + 10) + " " + (param.xAxisY + 32));
	    var fc_na = g.append("g")
		.attr("id", "fc_na");
	    fc_na.append("path")
		.attr("stroke", "#888888")
		.attr("fill", "none")
		.attr("stroke-width", "1.5px")
		.attr("d", "M " + param.yAxisX + " " + param.xAxisY + " V 0");
	    var p_a = g.append("g")
		.attr("id", "p_a");
	    p_a.append("path")
		.attr("stroke", "#888888")
		.attr("fill", "none")
		.attr("stroke-width", "1.5px")
		.attr("d", "M " + (param.yAxisX - param.xArea) + " " + param.xAxisY + " H " + (param.yAxisX + param.xArea));
	    var p_a_knob = p_a.append("g")
	    	.on("mouseover", function(){ param.arrY = true; })
	    	.on("mouseout", function(){ if(!param.dragFlagY) param.arrY = false; });
	    p_a_knob.append("rect")
		.attr("stroke", "none")
		.attr("fill", "#ffffff")
	    	.attr("stroke", "#aaaaaa")
		.attr("stroke-width", "1px")
		.attr("x", param.yAxisX + param.xArea + 3)
		.attr("y", param.xAxisY - 50)
	    	.attr("rx", 5)
		.attr("ry", 5)
		.attr("width", 16)
		.attr("height", 100);
	    p_a_knob.append("polygon")
		.attr("stroke", "none")
		.attr("fill", "#aaaaaa")
		.attr("points",  (param.yAxisX + param.xArea + 5) + " " + param.xAxisY + " " + (param.yAxisX + param.xArea + 15) + " " + (param.xAxisY + 10) + " " + (param.yAxisX + param.xArea + 15) + " " + (param.xAxisY - 10));
	    // text
	    var legend = svg.append("g");
	    legend.append("text")
		.attr("x", 50)
		.attr("y", 50)
		.attr("id", "fc");
	    legend.append("text")
		.attr("x", 50)
		.attr("y", 80)
		.attr("id", "pval");
	    legend.append("text")
		.attr("x", 50)
		.attr("y", 110)
		.attr("id", "protein");	  
	    //control button
	    var b = legend.append("g")
		.attr("class", "button")
	     	.style("cursor", "pointer")
	    	.on("click", function(){selectionSwitch();})
	    b.append("rect")
		.attr("x", 50)
	    	.attr("y", 127)
		.attr("width", 50)
		.attr("height", 16)
		.attr("rx", 5)
		.attr("ry", 5)
		.attr("id", "swich_button_rect")
		.attr("fill", "#c6c6c6");
	    b.append("text")
		.attr("y", 140)
		.attr("x", 75)
	    	.attr("id", "swich_button_text")
		.attr("fill", "#ffffff")
		.attr("text-anchor", "middle")
		.style("cursor", "pointer")
		.text("both");

	    // remove p-value bar
	    if(onlyFoldChange){
		svg.select("#p_a").remove();
		svg.select("#pval").text("p-value: not estimate");
		svg.selectAll(".y_scale").remove();
	    }
	    
	    var url = jpostdb.subApi + "enrich"; // Fisher's exact test API by R
	    var enrich_top = enrich.select("#enrich_top");
	    var enrich_svg = enrich.select("#enrich_svg");
	    var enrich_table = enrich.select("#enrich_table");
	    var enrich_head = enrich_top.append("div").attr("id", "enrich_head");
	    enrich_head.append("h3").html("Enrichment Analysis");
	    var ul = enrich_head.append("ul").attr("class", "memo");
	    ul.append("li").html("Protein set enrichment analysis for selected proteins in the upper plot and table.");
	    var select = enrich_head.append("select").attr("class", "slice_comparison_select")
		.style("margin-left", param.margin + "px")
		.on("change", function(){
		    if(!this.value.match(/^--/)){
			enrich_svg.transition().duration(param.anime).attr("height", 0);
			var g = enrich_svg.selectAll(".forcegraph");
			g.remove();
			var list = enrich_table.select("#enrich_list");
			list.remove();
		//	jpostdb.httpReq("post", url, "data=" + param.args + "&e=1&target=" + this.value, group.enrichMap, enrich_svg, renderDiv, param.width / 2, 0);
			jpostdb.fetchReq("post", url, "data=" + param.args + "&e=1&target=" + this.value, renderDiv, param.width, group.enrichMap);
		    }
		});
	    select.append("option")
		.attr("id", "annotation_def")
		.text("-- Select target --");
	    select.append("option")
		.attr("value", "ko")
		.text("KEGG Pathway");
	    select.append("option")
		.attr("value", "go_bp")
		.text("GO: biological process");
	    select.append("option")
		.attr("value", "go_mf")
		.text("GO: molecular function");
	    select.append("option")
		.attr("value", "go_cc")
		.text("GO: cellular component");
	    
	    //  var h = 400 + param.margin + param.margin;
	    //  param.top += h;
	    var h = 400 + param.margin + param.margin + param.top + param.marginBottom;
	    svg.transition().duration(param.anime).attr("height", h);
	}
	
	setInitData();
	setData();
	render();
	plot(1);

	group.mouseEvent(renderDiv, setData, plot);
    },

    popupStanza: function(uniprot, renderDiv){
	var group = jpostdb.slice_comparison;
	var param = group.param;
	
	var exist = renderDiv.select("#psm_comp_" + uniprot);
	var button = renderDiv.select("#psm_button_" + uniprot);
//	var trs = renderDiv.select("#psm_comp");
//	if(trs) trs.remove();
	if(exist[0][0]){
	    var tr = renderDiv.select("#psm_comp_tr_" + uniprot);
	    if(tr) tr.remove();
	    button.attr("value", "open");
	    exit;
	}
	button.attr("value", "close");
	
	// d3 //////////// can't open 1-6 rows
/*	var table = renderDiv.select("#fc_protein_list");
	var count = 1;
	table.selectAll("tr").each(function(d){
	    count++;
	    d3.select(this).selectAll("td").each(function(d){
		var a = d3.select(this).select("a");
		if(a[0][0]){
		    var text = a.html();
		    if(text == uniprot){
			console.log(count);
			table.insert("tr", ":nth-child(" + count + ")")
			    .attr("id", "psm_comp")
			    .append("td")
			    .attr("colspan", 8)
			    .attr("id", "psm_comp_" + uniprot)
			    .style("border-top", "1px solid #999")
			    .style("border-bottom", "1px solid #999");
		    }
		}
	    })
	});
*/
	// native ////////////
	var table = param.stanza.select("#fc_protein_list");
	var cols = table.getElementsByTagName("tr");
	var tr;
	for(var i = 1; i < cols.length;i++){
	    var rows = cols[i].getElementsByTagName("td");
	    if(rows[2]){
		var a = rows[2].getElementsByTagName("a")[0];
		var text = a.innerHTML;
		if(text == uniprot){
		    tr = cols[i];
		    break;
		}
	    }
	}
	var newTr = document.createElement("tr");
	newTr.id = "psm_comp_tr_" + uniprot;
	var newTd = document.createElement("td");
	newTd.style.borderTop = "1px solid #999";
	newTd.style.borderBottom = "1px solid #999";
	newTd.colSpan = 8;
	var newDiv = document.createElement("div");
	newDiv.id = "psm_comp_" + uniprot;
	newTd.appendChild(newDiv);
	newTr.appendChild(newTd);
	table.insertBefore(newTr, tr.nextSibling);
	//////////////
	
	var params = {
	    uniprot: uniprot,
	    dataset1: param.stanza_params.dataset1,
	    dataset2: param.stanza_params.dataset2
	};
	jpostdb.psm_align_compare.init(params, param.stanza, "#psm_comp_" + uniprot);

    },

    enrichMap: function(data, renderDiv){
	var group = jpostdb.slice_comparison;
	var param = group.param;
	var enrich = renderDiv.select("#enrich");

	var svg = enrich.select("#enrich_svg").attr("width", param.width).attr("height", param.graphHeight);

	// set node size & color
	var max = 0;
	var min = 1;
	for(var i = 0; i < data.nodes.length; i++){
	    if(data.nodes[i].pvalue <= 0.05){
		if(max < data.nodes[i].count - 0) max = data.nodes[i].count - 0;
		if(min > data.nodes[i].pvalue - 0 && data.nodes[i].pvalue - 0 != 0) min = data.nodes[i].pvalue - 0;
	    }
	}
	for(var i = 0; i < data.nodes.length; i++){
	    var r = 1 + Math.round(Math.pow(data.nodes[i].count/max, 0.5) * 29);
	    if(r > 30) r = 30;
	    data.nodes[i].r = r;
	    var color = "#ffffff";
	    if(data.nodes[i].pvalue - 0 == 2) color = "lightblue"; 
	    for(var j = 0; j < jpostdb.utils.param.color1.length; j++){
		var tmp = data.nodes[i].pvalue - 0;
		if(tmp == 0) tmp = min;
		if(Math.log(tmp) <= (Math.log(min) - Math.log(5e-2)) / jpostdb.utils.param.color1.length * j + Math.log(5e-2)){
		    color = jpostdb.utils.param.color1[j];
		}else{ break; }
	    }
	    data.nodes[i].color = color;
	}
	// force-directed graph
	jpostdb.utils.forcegraph(data, svg, param.width, param.graphHeight);

	// set table data
	var kegg = 0;
	if(data.nodes[0].key.match(/^KEGG:/)) kegg = 1;
	var arg = ["_bgcolor", "term_label", "count", "pvalue"];
	var head = ["", "term", "# proteins", "p-value"];
	var align = [ 0, 0, 1, 1];

	var width = [20, , ,];
	if(kegg){ arg.push("keggmap"); head.push("mapping"); width.push("");}
	var list = [];
	for(var i = 0; i < data.nodes.length; i++){
	    if(data.nodes[i].pvalue - 0 <= 0.1){
		var obj = {
		    term_label: data.nodes[i].term_label,
		    key: data.nodes[i].key,
		    count: data.nodes[i].count,
		    pvalue: data.nodes[i].pvalue,
		    kos: data.nodes[i].kos,
		    color: data.nodes[i].color
		}
		if(kegg && data.nodes[i].kos.match(/^#ko value/)){
		    var key = data.nodes[i].key.replace(/^KEGG:/, "");
		    obj._innerhtml_keggmap = "<form method='post' action='http://www.kegg.jp/kegg-bin/mcolor_pathway' target='jpost_kegg'><input type='hidden' name='map' value='map" + key + "'><input type='hidden' name='mode' value='number'><input type='hidden' name='numericalType' value='nzp'><input type='hidden' name='negativeColor' value='#81adef'><input type='hidden' name='zeroColor' value='#e8e8e8'><input type='hidden' name='positiveColor' value='#ef8197'><input type='hidden' name='reference' value='white'><input type='hidden' name='unclassified' value='" + data.nodes[i].kos + "'><input type='submit' value='mapping'>";
		}
		list.push(obj);
	    }
	}
	list = list.sort(function(a,b){
	    if(a.pvalue - 0 < b.pvalue - 0) return -1;
	    if(a.pvalue - 0 > b.pvalue - 0) return 1;
	    return 0;
	});
	
	var tableData = {data: list, head: head, arg: arg, align: align, width: width};
	var renderDivEx = enrich.select("#enrich_table");
	jpostdb.utils.table(tableData, renderDivEx, "enrich_list", 15, 0);

    },
    
    mouseEvent: function(renderDiv, setData, plot){
	var param = jpostdb.slice_comparison.param;

	
	// drag = [mouseDown + mouseMove + mouseUp] 
	var mouseMoveEvent = function(){
	    var mouse = d3.mouse(this);
	 //   console.log(mouse[0] + " " + mouse[1]);
	    param.mouseX = mouse[0];
	    param.mouseY = mouse[1];
	};
	
	var mouseMoveEventDraw = function(){
	    // if(param.mouseX > param.marginLeft && param.mouseX < param.width + 100 && param.mouseY > 0 && param.mouseY < param.top){
	    if(param.dragFlagX){
		param.fc = 2 ** ((param.mouseX - param.yAxisX) / param.xArea * param.maxFc);
		if(param.fc > 2 ** param.maxFc) param.fc = 2 ** param.maxFc;
		if(param.fc < 1) param.fc = 1;
		else if(param.fc < 5) param.fc = Math.round(param.fc * 10) / 10;
		else if(param.fc < 10) param.fc = Math.round(param.fc * 2) / 2;
		else if(param.fc < 50) param.fc = Math.round(param.fc);
		else param.fc = Math.round(param.fc / 10) * 10;
		param.logfc = Math.log(param.fc) / Math.log(2);
		//   setData();
		plot(0);
	    }
	    if(param.dragFlagY){
		var log = (param.mouseY - param.xAxisY - param.marginTop) / param.yArea * param.maxP;
		param.pvalue = 10 ** log;
		if(param.pvalue < 10 ** (param.maxP * (-1))) log = param.maxP * (-1);
		if(param.pvalue > 1) param.pvalue = 1;
		else{
		    var flag = 1;
		    var range = 10;
		    while(flag){
			if(10 / range > param.pvalue && param.pvalue >= 1 / range ){
			    param.pvalue = Math.ceil(10 ** log * range) / range;
			    flag = 0;
			}
			range *= 10;
		    }
		}
		//  setData();
		plot(0);
	    }
	    //   }else{
	    //	param.dragFlagX = false;
	    //	param.dragFlagY = false;
	    //   }
	};

	var mouseDownEvent = function(){
	    param.dragFlagX = false;
	    param.dragFlagY = false;
	    if(param.arrX) param.dragFlagX = true;
	    if(param.arrY) param.dragFlagY = true;
	}
	
	var mouseUpEvent = function(){
	    if(param.dragFlagX){ param.dragFlagX = false; setData(); plot(1); }
	    if(param.dragFlagY){ param.dragFlagY = false; setData(); plot(1); }
	}


	var preventDefault = function(e) {
	    e = e || window.event;
	    if (e.preventDefault)
		e.preventDefault();
	    e.returnValue = false;  
	}
	
	renderDiv.select("#volcano_svg").on("mousemove", mouseMoveEvent, false);
	renderDiv.on("mousedown", mouseDownEvent, false);
	d3.select(window).on("mouseup", mouseUpEvent, false);
	document.addEventListener ("mousemove",  mouseMoveEventDraw, false);
    }
};
