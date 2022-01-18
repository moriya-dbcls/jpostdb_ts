// jPOST-db Proteoform browser

jpostdb.proteoform_browser = jpostdb.proteoform_browser || {
    
    param: {
	seqLen: 0,
	width: 0,
	height: 0,
	margin: 20,
	marginLeft: 20,
	marginTop: 20,
	marginRight: 20,
	freqHeight: 100,
	top_r: {},
	scale: 1,
	start: 1,
	lineHeight: 16,
	freqLineY: 0,
	mouseX: 0,
	mouseY: 0,
	dragMouseX: 0,
	dragStartX: 0,
	dragFlag: false,
	anime: 100,
	animeFreq: 200
    },

    init: function(stanza_params, stanza, renderDiv){
	var renderId = Math.random().toString(36).slice(-8);
	var group = jpostdb.proteoform_browser;
	var param = group.param;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	param.top_r[renderId] = 20;
	param.data = {};
	
	var renderDiv = d3.select(stanza.select(renderDiv));
	var view = renderDiv.append("div").attr("class", "view").attr("id", "proteoform_browser");
        var form = view.append("div").attr("id", "proteoform_browser_form").style("margin-left", "20px");
	var svg = view.append("svg")
	    .attr("id", "proteoform_browser_svg")
	    .attr("width", param.width)
	    .attr("height", param.height);

	var url = jpostdb.api + "chk_shared_peptide?" + param.apiArg.join("&");
	jpostdb.fetchReq("get", url, null, renderDiv, param.width, group.make_select, renderId);
    },

    make_select: function(json, renderDiv, renderId){
	var group = jpostdb.proteoform_browser;
	var param = group.param;

	var view = renderDiv.select("#proteoform_browser");

	if(!json.protein && !json.isoform){
	    view.append("p").attr("class", "message").text("No shared peptides.");
	    exit;
	}

        var form = view.select("#proteoform_browser_form");
	var select = form.append("select")
            .attr("id", "view_select")
            .attr("class", "proteoform_browser_select")
            .on("change", function(d){
                var id = this.value;
		var svg = view.select("#proteoform_browser_svg").remove();
		view.append("svg")
		    .attr("id", "proteoform_browser_svg")
		    .attr("width", param.width)
		    .attr("height", param.height);
		param.top_r[renderId] = 20;
                if(id == "isoforms"){
		    if(param.data.isoforms) group.plot_peptide(param.data.isoforms, renderDiv);
		    else{
			var url = jpostdb.api + "get_isoform_data?" + param.apiArg.join("&");
			jpostdb.fetchReq("get", url, null, renderDiv, param.seqArea, group.plot_peptide, renderId);
		    }
                }else if(id == "proteins"){
		    if(param.data.proteins) group.plot_peptide(param.data.proteins, renderDiv);
		    else{
			var url = jpostdb.subApi + "proteoform?" + param.apiArg.join("&");
			jpostdb.fetchReq("get", url, null, renderDiv, param.seqArea, group.plot_peptide, renderId);
		    }
                }
                
            });

	var iso = select.append("option")
            .attr("class", "sel_list")
            .attr("id", "sel_list_isoform")
            .attr("value", "isoforms")
            .text("shared in isoforms");
	var prt = select.append("option")
            .attr("class", "sel_list")
            .attr("id", "sel_list_protein_all")
            .attr("value", "proteins")
            .text("shared in proteins");
	if(!json.isoform){
	    iso.attr("disabled", true);
	    prt.attr("selected", "selected");
	}
	if(!json.protein){
	    prt.attr("disabled", true);
	    iso.attr("selected", "selected");
	}

	var url = jpostdb.subApi + "proteoform?" + param.apiArg.join("&"); // calculate sequence similarity (e-value) API by GHOSTZ
	if(json.isoform) url =  jpostdb.api + "get_isoform_data?" + param.apiArg.join("&");
	jpostdb.fetchReq("get", url, null, renderDiv, param.width, group.plot_peptide, renderId);
    },

    x_axis_bg_height: function(renderDiv, renderId){
        var group = jpostdb.proteoform_browser;
        var param = group.param;
        var svg = renderDiv.select("#proteoform_browser_svg");
        svg.selectAll("rect.x_axis_back")
            .transition()
            .duration(param.anime)
            .attr("height", param.top_r[renderId] - param.marginTop - param.margin);
    },

    plot_peptide: function(json, renderDiv, renderId){
	var group = jpostdb.proteoform_browser;
	var param = group.param;
	param.top_r[renderId] = 20;
	var svg = renderDiv.select("#proteoform_browser_svg");
	var show_proteins = false;
	if(json.data.seq[0].iso) show_proteins = true;

	if(show_proteins){
	    if(!param.data.proteins) param.data.proteins = json;
	}else{
	    if(!param.data.isoforms) param.data.isoforms = json;
	}

	if(!json.list){
	    svg.attr("height", 0).attr("display", "none");
	    renderDiv.select("#proteoform_browser").append("p").attr("class", "message").text("No shared peptides.");
	    return 0;
	}

	var data = group.set_position(json, "");
	
	param.seqArea = param.width - param.marginLeft - param.marginRight;
	param.seqLen = data.base;
	param.maxScale = Math.round(param.seqLen / param.seqArea * 10 * 100) / 100;
	sumY = data.sum_y;

	var setPos = function(begin, end){
	    var sx = (begin - param.start) * param.seqArea / param.seqLen * param.scale;	
	    if(sx >= 0 && sx <= param.seqArea) sx = Math.round(sx * 1000) / 1000 + param.marginLeft;
	    else if(sx < 0) sx = param.marginLeft;
	    else if(sx > param.seqArea) sx = param.seqArea + param.marginLeft;
	    
	    var ex = (end - param.start + 1) * param.seqArea / param.seqLen * param.scale;
	    if(ex >= 0 && ex <= param.seqArea) ex = Math.round(ex * 1000) / 1000 + param.marginLeft;
	    else if(ex < 0) ex = param.marginLeft;
	    else if(ex > param.seqArea) ex = param.seqArea + param.marginLeft;

	    return [sx, ex];
	};

	var setData = function(){
	    var h = 0;
	    for(var i = 0; i < data.protein.length; i++){
		var obj = data.protein[i];
		var tmp = setPos(obj.begin, obj.end);
		data.protein[i].sx = tmp[0];
		data.protein[i].ex = tmp[1];

		for(var j = 0; j < data.protein[i].exon.length; j++){
		    var obj2 = obj.exon[j];
		    var tmp = setPos(obj2.begin, obj2.end);
		    data.protein[i].exon[j].sx = tmp[0];
		    data.protein[i].exon[j].ex = tmp[1];

		    if(param.exonFlag){
			data.protein[i].exon[j].num_display = "block";
			if(tmp[1] < param.marginLeft) data.protein[i].exon[j].num_display = "none";
			else if(tmp[0] > param.seqArea) data.protein[i].exon[j].num_display = "none";
		    }else{
			data.protein[i].exon[j].num_display = "none";
		    }
		}
		for(var j = 0; j < data.protein[i].peptide.length; j++){
		    var obj2 = obj.peptide[j];
		    var tmp = setPos(obj2.begin, obj2.end);
		    data.protein[i].peptide[j].sx = tmp[0];
		    data.protein[i].peptide[j].ex = tmp[1];

		    data.protein[i].peptide[j].num_display = "block";
		    if(tmp[0] < param.marginLeft + 4) data.protein[i].peptide[j].num_display = "none";
		    else if(tmp[0] > param.seqArea - 10) data.protein[i].peptide[j].num_display = "none";
		}

		if(param.trypsinFlag){
		    for(var j = 0; j < data.protein[i].trypsin.length; j++){
			var tmp = setPos(data.protein[i].trypsin[j].position, data.protein[i].trypsin[j].position);
			data.protein[i].trypsin[j].sx = tmp[0];
			data.protein[i].trypsin[j].ex = tmp[1];
		    }
		}
		
		if(param.scale == param.maxScale) data.protein[i].sx_seq = (param.start - data.protein[i].begin) * (-10) + param.marginLeft;
		data.protein[i].top = param.top_r[renderId] + h;
		h += data.protein[i].max_y * 20;	
	    }
	    param.guide_bar_width = param.scale / param.maxScale * 10;
	    if(param.guide_bar_width < 2) param.guide_bar_width = 2;
	}
	
	var plot = function(){
	    var prt = svg.selectAll("g.protein_group");
	    prt.selectAll(".protein")
		.attr("d", function(d){ return "M " + d.sx + " " + 0 + " H " + d.ex; });
	    var exon = prt.selectAll(".exon")
	    	.attr("display", function(d){ return d.num_display; })
		.attr("d", function(d){ return "M " + d.sx + " 0 H " + d.ex; });
	    var pep = prt.selectAll("g.peptide_group");
	    pep.selectAll(".peptide")
		.attr("d", function(d){ return "M " + d.sx + " " + d.y * 20 + " H " + d.ex; });
	    pep.selectAll(".psm_num")
		.attr("display", function(d){ return d.num_display; })
		.attr("x", function(d){ return d.sx + 4; });

	    if(param.scale == param.maxScale){
		prt.selectAll("text.protein_seq")
		    .attr("x", function(d){ return d.sx_seq; }).attr("display", "block");
		prt.selectAll("text.name").attr("display", "none");
	    }else{
		prt.selectAll("text.protein_seq").attr("display", "none");
		if(param.nameFlag) prt.selectAll("text.name").attr("display", "block");
	    }

	    if(param.trypsinFlag){
		var trp = prt.selectAll("path.trypsin").data(function(d){ return d.trypsin; });
		trp.attr("d", function(d){ return "M " + d.sx + " 0 H " + d.ex; });
	    }
	}
	
	var render = function(){
	  /*  var g = svg.append("g")
		.attr("class", "protein_list")
		.attr("transform", "translate(0," + param.top_r[renderId] + ")")
		.attr("id", "protein");	   */ 
	    var prt = svg.selectAll(".protein_group")
		.data(data.protein)
		.enter()
		.append("g")
		.attr("transform", function(d){ return "translate(0," + d.top + ")"; })
		.attr("class", "protein_group")
		.attr("id", function(d){ return "protein_" + d.up_id; });
	    prt.append("path")
		.attr("class", "protein")
		.attr("stroke", "#c6c6c6")
		.attr("fill", "none")
		.attr("stroke-width", "16px")
		.attr("d", function(d){ return "M " + d.sx + " 0 H " + d.ex; });
	    var exon = prt.selectAll(".exon")
		.data(function(d){ return d.exon; })
		.enter()
		.append("path")
		.attr("class", "exon")
		.attr("stroke", "#aaaaaa")
		.attr("fill", "none")
		.attr("stroke-width", "16px")
		.attr("display", "none")
		.attr("d", function(d){ return "M " + d.sx + " 0 H " + d.ex; });
	    var trp = prt.selectAll(".trypsin")
		.data(function(d){ return d.trypsin; })
		.enter()
		.append("path")
		.attr("class", "trypsin")
		.attr("stroke", function(d){ return d.color; })
		.attr("fill", "none")
		.attr("stroke-width", "16px")
		.attr("display", "none")
		.attr("d", "M 0 0 H 0");
	    prt.append("text")
		.attr("class", "name")
		.attr("id", function(d){ return "protein_name_" + d.up_id; })
		.attr("x", 30)
		.attr("y", function(d){ return 5; })
		.attr("fill", "#265093")
	    	.attr("font-size", 16)
		.attr("cursor", "pointer");
	    if(show_proteins){
		prt.selectAll(".name")
		    .text(function(d){ return d.up_id + " : " + d.name; })
		    .on("mouseover", function(d){ prt.select("#protein_name_" + d.up_id).attr("text-decoration", "underline"); })
	    	    .on("mouseout", function(d){ prt.select("#protein_name_" + d.up_id).attr("text-decoration", "none"); })
		    .on("click", function(d){
			jPost.openProtein(d.up_id);
		    });
	    }else{
		prt.selectAll(".name")
		    .text(function(d){ return d.up_id });
	    }
	    prt.append("text")
		.attr("fill", "#ffffff")
		.attr("class", "protein_seq proteoform_browser_mono")
		.attr("y", function(d){ return 5; })
		.attr("display", "none")
		.attr("textLength", function(d){ return d.len * 10; })
		.attr("lengthAdjust", "spacingAndGlyphs")
		.text(function(d){ return d.seq; });
	    var pep = prt.selectAll(".peptide_group")
		.data(function(d){ return d.peptide; })
		.enter()
		.append("g")
		.attr("class", "peptide_group")
	    	.on("mouseover", function(d){
		    var width;
		    svg.selectAll(".pop_up").attr("display", "block"); 
		    svg.select('#pop_up_seq').text(d.seq).each(function(d) {
			var bbox = this.getBBox();
			width = bbox.width + 20;
		    })
		    var x = param.mouseX;
		    if(x > param.seqArea - width - 20 ) x = param.mouseX - width - 10;
		    var form_h = renderDiv.select("#proteoform_browser_form").node().getBoundingClientRect().height;
		    svg.select('#pop_up').attr("transform", "translate(" + x + "," + (param.mouseY - form_h) + ")");
		    svg.select('#pop_up_rect').attr("height", 50);
		    svg.select('#pop_up_num').text(d.count + " spectra");
		    svg.select('#pop_up_uniq').text("");
		    if(d.uniq){
			svg.select('#pop_up_rect').attr("height", 70);
			svg.select('#pop_up_uniq').text("unique in isoforms");
		    }
		    svg.select("#pop_up_rect").attr("width", width);
		 //   svg.selectAll(".pop_up").attr("display", "block"); 
		})
	    	.on("mouseout", function(d){ 
		    svg.selectAll('#pop_up').attr("display", "none"); 
		})
		.on("click", function(d){
		    var pgs = svg[0][0].getElementsByClassName("protein_group");
		    var parent = this.parentNode;
		    var click = 0;
		    for(click = 0; click < pgs.length; click++){
			if(pgs[click] == parent)  break;
		    }
		    var newData = group.set_position(json, d.seq);
		    param.start -= data.protein[click].begin - newData.protein[click].begin;
		    if(param.start < 1) param.start = 1;
		    param.seqLen = newData.base;
		    param.maxScale = Math.round(param.seqLen / param.seqArea * 10 * 100) / 100;
		    for(var i = 0; i < data.protein.length; i++){
			data.protein[i].begin = newData.protein[i].begin;
			data.protein[i].end = newData.protein[i].end;
			for(var j = 0; j < data.protein[i].peptide.length; j++){
			    data.protein[i].peptide[j].begin = newData.protein[i].peptide[j].begin;
			    data.protein[i].peptide[j].end = newData.protein[i].peptide[j].end;
			}
			for(var j = 0; j < data.protein[i].exon.length; j++){
			    data.protein[i].exon[j].begin = newData.protein[i].exon[j].begin;
			    data.protein[i].exon[j].end = newData.protein[i].exon[j].end;
			}
			for(var j = 0; j < data.protein[i].trypsin.length; j++){
			    data.protein[i].trypsin[j].position = newData.protein[i].trypsin[j].position;
			}
		    }
		   // data = newData;
		    setData();
		    move_protein();
		});
	    pep.append("path")
		.attr("class", function(d){ return "peptide " + d.class; })
		.attr("stroke", function(d){ return jpostdb.def_color2[(d.color - 1) % jpostdb.def_color2.length];})
		.attr("fill", "none")
		.attr("stroke-width", "16px")
		.attr("d", function(d){ return "M " + d.sx + " " + d.y * 20 + " H " + d.ex; });
	    pep.append("text")
		.attr("class", "psm_num")
		.attr("x", function(d){ return d.sx + 4; })
		.attr("y", function(d){return d.y * 20 + 5;})
		.text(function(d){return d.count});
	    
	    var h = (sumY + 1) * 20 + param.margin;
	 //   group.delUnit.mkButton("psm_align", h);
	    param.top_r[renderId] += h;
	    svg.transition().duration(param.anime).attr("height", param.top_r[renderId]);
	 //   console.log(document.body.parentNode.parentNode.parentNode);
	    group.x_axis_bg_height(renderDiv, renderId);
	}

	var move_protein = function(){
	    var anime = 300;
	    var prt = svg.selectAll("g.protein_group");
	    prt.selectAll(".protein")
	    	.transition().duration(anime)
		.attr("d", function(d){ return "M " + d.sx + " 0 H " + d.ex; });
	    prt.selectAll(".exon")
	  	.transition().duration(anime)
		.attr("d", function(d){ return "M " + d.sx + " 0 H " + d.ex; });
	    var pep = prt.selectAll("g.peptide_group");
	    pep.selectAll(".peptide")
	    	.transition().duration(anime)
		.attr("d", function(d){ return "M " + d.sx + " " + d.y * 20 + " H " + d.ex; });
	    pep.selectAll(".psm_num")
	  	.transition().duration(anime)
		.attr("x", function(d){ return d.sx + 4; });
	    var id = setTimeout(plot, anime);
	}
	
	param.exonFlag = 0;
	setData();
	render();
	plot();

	for(var i = 1; i < data.protein.length; i++){
	    group.delUnit.mkButton(renderDiv, "protein_" + data.protein[i].up_id, data, renderId);
	}
	
	// mouse bar
	param.guide_bar_width = 2;
	svg.append("path")
	    .attr("id", "guide")
	    .attr("class", "guide")
	    .attr("stroke", "#9999dd")
	    .attr("stroke-width", param.guide_bar_width + "px")
	    .attr("stroke-opacity", "0.3")
	    .attr("fill", "none")
	    .attr("display", "none")
	    .attr("d", "M 0 0 V " + (sumY + 1) * 20);
	// mouse bar function
	var guideBarMove = function(f){
	    if(f){
		if(guideFlag){
		    svg.select("path#guide")
			.attr("stroke-width", param.guide_bar_width + "px")
	    		.attr("transform", "translate(" + param.mouseX + ",0)")
			.attr("display", "block");
		}
	    }else{
		svg.select("path#guide")
		    .attr("display", "none");
	    }
	};

	// create button
	var appendButton = function(g, num, label, color, call){
	    var x = param.marginLeft;
	    var y = (sumY + 1) * 20;
	    var b = g.append("g")
		.attr("class", "button")
		.style("cursor", "pointer")
		.attr("transform", "translate(0," + y + ")")
		.on("click", function(){call();});
	    b.append("rect")
		.attr("y", 0)
		.attr("x", 60 * num + x)
		.attr("width", 50)
		.attr("height", 16)
		.attr("rx", 5)
		.attr("ry", 5)
		.attr("id", label + "_button")
		.attr("fill", color);
	    b.append("text")
		.attr("y", 12)
		.attr("x", 60 * num + x + 25)
		.attr("fill", "#ffffff")
		.attr("text-anchor", "middle")
		.style("cursor", "pointer")
		.text(label);
	};
	var button_group = svg.append("g")
	    .attr("id", "button_group");

		
	// name button
	param.nameFlag = 1;
	var nameSwitch = function(){
	    if(param.nameFlag){
		param.nameFlag = 0;
		svg.select("rect#name_button").attr("fill", "#c6c6c6");
		svg.selectAll("text.name").attr("display", "none");
	    }else{
		param.nameFlag = 1;
		svg.select("rect#name_button").attr("fill", "#eecccc");
		if(param.scale != param.maxScale) svg.selectAll("text.name").attr("display", "block");
	    }
	};
	appendButton(button_group, 0, "name", "#eecccc", nameSwitch)
	
	var iso_flag = 1;
	if(json.data.seq[0].iso) iso_flag = 0;

	// color button
	var colorFlag = 2;
	var colorSwitch = function(){
	    if(colorFlag == 2 || (colorFlag == 1 && iso_flag == 0)){  // for data error (isoform search)
	 //   if(colorFlag == 1){
		colorFlag = 0;
		svg.select("rect#color_button").attr("fill", "#c6c6c6");
		var prt = svg.selectAll(".protein_group")
		    .data(data.protein);
		var pep = prt.selectAll(".peptide_group")
		    .data(function(d){return d.peptide; });
		pep.selectAll("path.peptide")
		    .attr("stroke", function(d){ return jpostdb.def_color2[(d.color - 1) % jpostdb.def_color2.length];});
		svg.selectAll("path.un_query_pep")
		    .attr("stroke", "#c6c6c6");
	    }else if(colorFlag == 1 && iso_flag){   // for data error (isoform search)
		colorFlag = 2;
		svg.select("rect#color_button").attr("fill", "#eecccc");
		var prt = svg.selectAll(".protein_group")
		    .data(data.protein);
		var pep = prt.selectAll(".peptide_group")
		    .data(function(d){return d.peptide; });
		pep.selectAll("path.peptide")
		    .attr("stroke", function(d){ return d.color2;});
	    }else{
		colorFlag = 1;
		if(json.iso_flag == 0) colorFlag = 2;
		svg.select("rect#color_button").attr("fill", "#eecccc");
		var prt = svg.selectAll(".protein_group")
		    .data(data.protein);
		var pep = prt.selectAll(".peptide_group")
		    .data(function(d){return d.peptide; });
		pep.selectAll("path.peptide")
		    .attr("stroke", function(d){ return jpostdb.def_color2[(d.color - 1) % jpostdb.def_color2.length];});
		if(param.trypsinFlag) pep.selectAll("path.un_tryptic").attr("stroke", "#c6c6c6");
	    }
	};
	appendButton(button_group, 1, "color", "#eecccc", colorSwitch)
	colorSwitch();
	
	// trypsin button
	param.trypsinFlag = 0;
	var trypsinSwitch = function(){
	    if(param.trypsinFlag){
		param.trypsinFlag = 0;
		svg.select("rect#trypsin_button").attr("fill", "#c6c6c6");
		svg.selectAll("path.trypsin").attr("display", "none");
		var prt = svg.selectAll(".protein_group")
		    .data(data.protein);
		var pep = prt.selectAll(".peptide_group")
		    .data(function(d){return d.peptide; });
		pep.selectAll("path.un_tryptic")
		    .attr("stroke", function(d){ return jpostdb.def_color2[(d.color - 1) % jpostdb.def_color2.length];});
		if(!colorFlag) svg.selectAll("path.un_query_pep").attr("stroke", "#dddddd");
	    }else{
		param.trypsinFlag = 1;
		setData();
		plot();
		svg.select("rect#trypsin_button").attr("fill", "#eecccc");
		svg.selectAll("path.trypsin").attr("display", "block");
		svg.selectAll("path.un_tryptic").attr("stroke", "#bbbbbb");
	    }
	};
	appendButton(button_group, 2, "trypsin", "#c6c6c6", trypsinSwitch);

	// exon bar button
	param.exonFlag = 0;
	var exonSwitch = function(){
	    if(param.exonFlag){
		param.exonFlag = 0;
		svg.select("rect#exon_button").attr("fill", "#c6c6c6");
		svg.selectAll("path.exon").attr("display", "none");
	    }else{
		param.exonFlag = 1;
		svg.select("rect#exon_button").attr("fill", "#eecccc");
		svg.selectAll("path.exon").attr("display", "block");
	    }
	};
	appendButton(button_group, 3, "exon", "#c6c6c6", exonSwitch);
	
	// guide bar button
	var guideFlag = 0;
	var guideSwitch = function(){
	    if(guideFlag){
		guideFlag = 0;
		svg.select("rect#guide_button").attr("fill", "#c6c6c6");
		svg.selectAll("path.guide").attr("display", "none");
	    }else{
		guideFlag = 1;
		svg.select("rect#guide_button").attr("fill", "#eecccc");
		svg.selectAll("path.guide").attr("display", "block");
		if(editFlag) editSwitch();
	    }
	};
	appendButton(button_group, 4, "guide", "#c6c6c6", guideSwitch);

	// guide bar button
	var editFlag = 0;
	var editSwitch = function(){
	    if(editFlag){
		editFlag = 0;
		svg.select("rect#edit_button").attr("fill", "#c6c6c6");
		svg.selectAll("g.del_button").attr("display", "none");
	    }else{
		editFlag = 1;
		svg.select("rect#edit_button").attr("fill", "#eecccc");
		svg.selectAll("g.del_button").attr("display", "block");
		if(guideFlag) guideSwitch();
	    }
	};
	appendButton(button_group, 5, "edit", "#c6c6c6", editSwitch);

	var g = svg.append("g")
	    .attr("id", "pop_up")
	    .attr("class", "pop_up");
	g.append("rect")
	    .attr("id", "pop_up_rect")
	    .attr("class", "pop_up")
	    .attr("display", "none")
	    .attr("rx", 8)
	    .attr("ry", 8)
	    .attr("height", 50)
	    .attr("fill", "#eeeeee");
	 g.append("text")
	    .attr("display", "none")
	    .attr("x", 10)
	    .attr("y", 20)
	    .attr("id", "pop_up_seq")
	    .attr("class", "pop_up");
	 g.append("text")
	    .attr("display", "none")
	    .attr("x", 10)
	    .attr("y", 40)
	    .attr("id", "pop_up_num")
	    .attr("class", "pop_up");
	 g.append("text")
	    .attr("display", "none")
	    .attr("x", 10)
	    .attr("y", 60)
	    .attr("id", "pop_up_uniq")
	    .attr("class", "pop_up");
		    
	group.mouseEventCheck(svg);
	group.mouseEvent(svg, setData, plot, guideBarMove);

    },

    set_position: function(json, peptide, renderId){
	var query = json.data.uniprot;
	var pep = json.data.pep;
	var pre_seq = json.data.seq;
	var seq = [];
	var psm = json.data.psm_num;
	var iso = json.data.iso;
	var prtNum = {};

	var iso_flag = 1;
	if(pre_seq[0].iso) iso_flag = 0;

	// check GhostX E-value
	var thresh = 1;
	var up_list = {};
	up_list[query] = -1;  // top of list
	for(var i = 0; i < json.list.length; i++){
	   if(json.list[i].eval - 0 <= thresh) up_list[json.list[i].up] = json.list[i].eval - 0;
	}

	// count proteins <= thresh in each peptide
	var prt_num = {};
	var seq_prt = json.data.seq_prt;
	for( var i = 0; i < seq_prt.length; i++){
	    if(up_list[seq_prt[i].up_id.value] !== undefined) {
		if(!prt_num[seq_prt[i].seq.value]) prt_num[seq_prt[i].seq.value] = 1;
		else prt_num[seq_prt[i].seq.value]++;
	    }
	}
	var pep_list = Object.keys(prt_num).sort(function(a,b){
            if( prt_num[a] < prt_num[b] ) return 1;
            if( prt_num[a] > prt_num[b] ) return -1;
	    if( a.length < b.length ) return 1;
	    if ( a.length > b.length ) return -1;
            return 0;
	});

	// check isoform
	for(var i = 0; i < pre_seq.length; i++){
	    if(iso_flag == 0){ // shared in proteins
		var array = pre_seq[i].iso.value.match(/([\w]+)\-(\d+)$/);
		if(up_list[array[1]] !== undefined){ 
		    pre_seq[i].up_id = array[1];
		    pre_seq[i].eval = up_list[array[1]];
		    seq.push(pre_seq[i]); 
		}
	    }else{ // shared in isoforms
		pre_seq[i].up_id = pre_seq[i].up.value;
		pre_seq[i].eval = up_list[pre_seq[i].up.value];
		seq.push(pre_seq[i]); 
	    }
	}

	var seq2num = {};
	for(var i = 0; i < psm.length; i++){
	    seq2num[psm[i].seq.value] = psm[i].psm_num.value;
	}

	// calc shift from query-seq in each protein
	var b_max = 0;
	var e_max = 0;
	var chk = {};
	var q_len;
	
	if(peptide){
	    pep_list.unshift(peptide);
	    // change query
	    var new_query;
	    for(var j = 0; j < pep.length; j++){
		if(pep[j].seq.value == peptide){
		    if(pep[j].up.value == query){
			new_query = 1;
			break;
		    }else if(!new_query || new_query > pep[j].up.value){
			new_query = pep[j].up.value;
		    }
		}    
	    }
	    if(new_query != 1) query = new_query;  
	}
	
	for(var i = 0; i < seq.length; i++){
	    seq[i].len = seq[i].seq.value.length;
	    if(seq[i].up.value == query){ q_len = seq[i].len; }
	}
	
	for(var i = 0; i < pep_list.length; i++){
	    var f_pep = pep_list[i];
	    if(i > 0 && f_pep == peptide) continue;
	    // get pep positoin of base protein
	    var q_begin = 0;
	    for(var j = 0; j < pep.length; j++){
		if(pep[j].up.value != query) continue;
		else if(pep[j].seq.value == f_pep){
		    q_begin = pep[j].begin.value - 0;
		    break;
		}    
	    }
	    for(var j = 0; j < seq.length; j++){
		if(chk[seq[j].up.value]) continue;
		if(seq[j].up.value == query){
		    seq[j].shift = 0;
		    chk[query] = 1;
		    continue;
		}
		for(var k = 0; k < pep.length; k++){
		    if(pep[k].up.value != seq[j].up.value) continue;
		    else if(pep[k].seq.value == f_pep){
			var begin = pep[k].begin.value - 0;
			if(b_max < begin - q_begin) b_max = begin - q_begin;
			if(e_max < (seq[j].len - begin) - (q_len - q_begin)) e_max = (seq[j].len - begin) - (q_len - q_begin);
			seq[j].shift = q_begin - begin;
			chk[seq[j].up.value] = 1;
			break;
		    }    
		}
	    }
	    if(Object.keys(chk).length == seq.length) break;
	}
	
	seq = seq.sort(function(a,b){
            if( a.eval < b.eval ) return -1;
            if( a.eval > b.eval ) return 1;
            return 0;
	});

	// trypsin cleavage point
	var  getRKpoint = function(seq, shift){
	    var frag = seq.split(/[RK]/);
	    var point = 0;
	    var r = [];
	    for(var i = 0; i < frag.length - 1; i++){
		point += frag[i].length + 1;
		var color = "#88cc88";
		if(seq.substr(point-1,2).match(/^[KR]P$/)) color = "#88aacc";
		r.push({position: point + shift, color: color});
	    }
	    return r;
	};

	// exon position
	var getExonPos = function(up, seq, exon){
	    var exon_len = [];
	    for(var j = 0; j < exon.length; j++){
		if(exon[j].uniprot == up){
		    for(var k = 0; k < exon[j].isoform.length; k++){
			if(exon[j].isoform[k].sequence == seq){
			    var f = 0;
			    if(exon[j].isoform[k].location.match(/complement/)) f = 1;
			    var loc = exon[j].isoform[k].location.match(/([\d\.\,]+)/)[1].split(/,/);
			    for(var l = 0; l < loc.length; l++){
				var tmp = loc[l].split(/\.\./);
				if(f){ exon_len.unshift(tmp[1] - tmp[0] + 1); }
				else{ exon_len.push(tmp[1] - tmp[0] + 1); }
			    }
			    break;
			}
		    }
		    break;
		}
	    }
	    var b = 1 * 3;
	    var exon_pos = [];
	    for(var j = 0; j < exon_len.length; j++){
		var b2 = b + exon_len[j] - (1 * 3);
		if(j == exon_len.length - 1) b2 -= 1 * 3;  // stop codon
		if(j % 2 == 1){
		    var obj = {
			begin: (b / 3) + shift,
			end: (b2 / 3) + shift,
			exon: j
		    }
		    exon_pos.push(obj);
		}
		b = b2 + (1 * 3);
	    }
	//    console.log(exon_len);
	    return exon_pos;
	};
				  
	var base_length = b_max + e_max + q_len;
	var r1 = [];
	var color_num = 1;
	var pep_color = {};
	var y_axis = 0;
	var sum_y = 0;
	var query_pep_color = 0;
	for(var i = 0; i < seq.length; i++){
	    var shift = b_max + seq[i].shift;
	    var trypsin = getRKpoint(seq[i].seq.value, shift);
	    var exon = getExonPos(seq[i].up.value, seq[i].seq.value, json.exon);
	    var name = "";
	    if(seq[i].name) name = seq[i].name.value;
	    var obj = {
		begin: shift + 1,
		end: shift + seq[i].len,
		type: "protein",
		y: y_axis,
		name: name,
		up_id: seq[i].up_id,
		up: seq[i].up.value,       
		len: seq[i].len,
		seq: seq[i].seq.value,
		trypsin: trypsin,
		exon: exon
	    }
	    var yend = [];        
	    var max_y = 0;
	    var r2 = [];
	    for(var j = 0; j < pep.length; j++){
		if(pep[j].up.value != seq[i].up.value) continue;
		var f = 0;
		for(var k = 1; k < yend.length; k++){
		    if(yend[k] < pep[j].begin.value - 1){
			y_axis = k;
			f = 1;
			break;
		    }    
		}
		if(f == 0){ max_y++; y_axis = max_y; }
		yend[y_axis] = pep[j].end.value;
		var color = color_num;
		if(pep_color[pep[j].seq.value]){ color = pep_color[pep[j].seq.value];}
		else{ color = color_num; pep_color[pep[j].seq.value] = color; color_num++;}
		var obj_pep = {
		    begin: shift + (pep[j].begin.value - 0), 
		    end: shift + (pep[j].end.value - 0), 
		    type: "peptide",
		    y: y_axis, 
		    count: seq2num[pep[j].seq.value],
		    seq: pep[j].seq.value,
		    up: pep[j].up.value,
		    color: color
		}
		if(iso_flag){
		    for(var k = 0; k < json.data.pep_color.length; k++){
			if(pep[j].seq.value == json.data.pep_color[k].seq){
			    obj_pep.color2 = json.data.pep_color[k].color;
			    if(json.data.pep_color[k].count == 1) obj_pep.uniq = 1;
			    break;
			}
		    }
		}
		obj_pep.class = "query_pep";
		if(i > 0 && color >= query_pep_color) obj_pep.class = "un_query_pep";
		if(pep[j].begin.value > 1 && !seq[i].seq.value.substr(pep[j].begin.value - 2, 1).match(/[RK]/)) obj_pep.class += " un_tryptic";
		r2.push(obj_pep);
		y_axis = max_y + 1;
	    }
	    if(i == 0) query_pep_color = color_num;
	    obj.peptide = r2;
	    obj.max_y = max_y + 1;
	    sum_y += max_y + 1;
	    r1.push(obj);
	}

	return {base: base_length, sum_y: sum_y, protein: r1, iso_flag: iso_flag}
    },

    delUnit: {
	mkButton: function(renderDiv, gid, data, renderId){
	    var group = this;
	    var param = jpostdb.proteoform_browser.param;
	    var svg = renderDiv.select("#proteoform_browser_svg");
	    var unit = svg.select("#" + gid);
	    var g = unit.append("g")
		.attr("class", "del_button proteoform_browser_label_set")
		.style("cursor", "pointer")
		.attr("display", "none")
	    	.on("click", function(){ group.remove(renderDiv, gid, data, renderId); });
	    g.append("rect")
		.attr("x", param.width - param.marginRight - 20)
		.attr("y", 5)
		.attr("width", 15)
		.attr("height", 15)
		.attr("rx", 3)
		.attr("ry", 3)
		.attr("fill", "#ffffff")
		.attr("stroke-width", "2px")
		.attr("stroke", "#c6c6c6");
	    g.append("path")
		.attr("stroke-width", "3px")
		.attr("stroke", "#c6c6c6")
		.attr("d", "M " + (param.width - param.marginRight - 18) + " 7 L " + (param.width - param.marginRight - 7) + " 18");
	    g.append("path")
		.attr("stroke-width", "3px")
		.attr("stroke", "#c6c6c6")
		.attr("d", "M " + (param.width - param.marginRight - 7) + " 7 L " + (param.width - param.marginRight - 18) + " 18");
	},

	rmF: {},
	remove: function(renderDiv, gid, data, renderId){
	    var param = jpostdb.proteoform_browser.param;
	    var svg = renderDiv.select("#proteoform_browser_svg");
	    svg.select("#" + gid).attr("diaplay", "none");
	    var gap = 0;
	    var g = svg.select("#protein_" + data.protein[0].up_id);
	    var h1 = d3.transform(g.attr("transform")).translate[1];
	    for(var i = 1; i < data.protein.length; i++){
		if(this.rmF[data.protein[i].up_id]) continue;
		var g = svg.select("#protein_" + data.protein[i].up_id);
		var h2 = d3.transform(g.attr("transform")).translate[1];
		if(gid == "protein_" + data.protein[i].up_id){
		    gap = h2 - h1;
		    this.rmF[data.protein[i].up_id] = 1
		}
		else if(gap){
		    g.transition().duration(param.anime).attr("transform", "translate(0," + (h2 - gap) + ")");
		}
		h1 = h2;
	    }
	    var h2 = d3.transform(svg.select("#button_group").attr("transform")).translate[1];
	    svg.select("#button_group").transition().duration(param.anime).attr("transform", "translate(0," + (h2 - gap) + ")");
	    
	    // param.svg.select("#" + gid).remove();
	    svg.select("#" + gid).attr("display", "none");
	    param.top_r[renderId] -= gap;
	    svg.transition().duration(100).attr("height", param.top_r[renderId]);
	},
    },

    mouseEventCheck: function(mouseEveElement){
	var param = jpostdb.proteoform_browser.param;
	param.mouseOnElement = false;
	mouseEveElement.on("mouseover", function(){ param.mouseOnElement = true;});
	mouseEveElement.on("mouseout", function(){ param.mouseOnElement = false;});
    },
    
    mouseEvent: function(mouseEveElement, setData, plot, guideBarMove){
	var param = jpostdb.proteoform_browser.param;
	var setTimeoutId = null; // scroll stop timer
	var scrolling = false; // scroll flag
	
	var setParamStart = function(){
	    if(param.start < 1) param.start = 1;
	    if((param.seqLen - param.start - 1) * param.scale < param.seqLen) param.start = param.seqLen * (param.scale - 1) / param.scale + 1;
	};
	
/* conflict error: multi togostanza(JS) (with _header.html include d3.js) + webkit
	var mouseMoveEvent = function(e){
	    var mouse = d3.mouse(this);
	    param.mouseX = mouse[0];
	    param.mouseY = mouse[1];
	}; */

	// drag = [mouseDown + mouseMove + mouseUp] 
	var mouseMoveEventDraw = function(e){
	    if(param.mouseOnElement){
		var rect = e.target.getBoundingClientRect();
		param.mouseX = e.clientX - rect.left;
		param.mouseY = e.clientY - rect.top;
		if(param.dragFlag){
		    param.start = param.dragStartX + (param.dragMouseX - param.mouseX) / param.seqArea * param.seqLen / param.scale;
		    setParamStart();
		    setData();
		    plot();
		}
		guideBarMove(true);
	    }else{
		param.dragFlag = false;
		guideBarMove(false);
	    }
	};

	var mouseDownEvent = function(){
	    if(param.mouseOnElement){
		param.dragFlag = true;
		param.dragStartX = param.start;
		param.dragMouseX = param.mouseX;
	    }
	}
	
	var mouseUpEvent = function(){
	    jpostdb.false_all_drag_flag();
	   // if(param.dragFlag){ param.dragFlag = false; console.log("b");}
	}

/*
	var preventDefault = function(e) {
	    e = e || window.event;
	    if (e.preventDefault)
		e.preventDefault();
	    e.returnValue = false;  
	}
*/	
	// scroll
	var scrollEvent = function(e){
	    if(param.mouseOnElement){
//		window.onwheel = preventDefault;
		e. preventDefault();
		scrolling = true ;
		var target = e.target;
		var delta = e.deltaY ? -(e.deltaY) : e.wheelDelta ? e.wheelDelta : -(e.detail);
		var position = (param.mouseX - param.marginLeft) * param.seqLen / param.seqArea / param.scale;
		if(delta > 0 && param.scale != param.maxScale){
		    param.scale *= 1.03;
		    if(param.scale > param.maxScale) param.scale = param.maxScale;
		}else if(delta < 0 && param.scale != 1){
		    param.scale /= 1.03;
		    if(param.scale < 1) param.scale = 1;
		}
		param.scale = Math.round(param.scale * 100) / 100;
		var newPosition = (param.mouseX - param.marginLeft) * param.seqLen / param.seqArea / param.scale;	
		param.start += position - newPosition;
		param.start = Math.round(param.start * 100) / 100;
		setParamStart();
		setData();
		plot();
		guideBarMove(true);

		// (同期して描画すると重いので、各表示それぞれのタイミングで個別に描画。
		// タイミングが違うので微妙にずれる。スクロール終了を検知したら全部の描画をし直して合わせる)
		if(setTimeoutId){ clearTimeout(setTimeoutId); }
		setTimeoutId = setTimeout( function() {
		    // re-plot if stoped scroll 
		    setParamStart();
		    setData();
		    plot();
		    guideBarMove(true);
		    scrolling = false;
		    setTimeoutId = null;
		}, 100 );
		
	    }else{
		if(!jpostdb.chk_onwheel()) window.onwheel = true;
	    }
	}

//	mouseEveElement.on("mousemove", mouseMoveEvent, false); // conflict error: multi togostanza(JS) (with _header.html include d3.js) + webkit
	mouseEveElement.on("mousedown", mouseDownEvent, false);
	d3.select(window).on("mouseup", mouseUpEvent, false);
	var mousewheel = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
	document.addEventListener(mousewheel,  scrollEvent, {passive: false});
	document.addEventListener("mousemove",  mouseMoveEventDraw, false);
    },

};
