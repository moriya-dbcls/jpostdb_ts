// jPOST-db Protein brower

jpostdb.psm_align_compare = jpostdb.psm_align_compare || {
    
    param: {
	width: 0,
	height: 0,
	margin: 20,
	marginLeft: 20,
	marginTop: 20,
	marginRight: 20,
	freqHeight: 100,
	lineHeight: 16,
	freqLineY: 0,
	anime: 100,
	animeFreq: 200
    },

    init: function(stanza_params, stanza, renderDiv){
	var group = jpostdb.psm_align_compare;
	var param = group.param;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	
	var uniprot = stanza_params.uniprot;
	param[uniprot] = {};
        param[uniprot].top = 0;
	param[uniprot].scale = 1;
	param[uniprot].start = 1;	
	param[uniprot].slice_count = 1;
	param[uniprot].apiArg = param.apiArg;
	param[uniprot].apiArg1 = "uniprot=" + stanza_params.uniprot + "&dataset=" + stanza_params.dataset1;
	param[uniprot].apiArg2 = "uniprot=" + stanza_params.uniprot + "&dataset=" + stanza_params.dataset2;

	var renderDiv = d3.select(stanza.select(renderDiv));

	var view = renderDiv.append("div").attr("class", "view").attr("id", "protein_browser");
	var svg = view.append("svg")
	    .attr("id", "protein_browser_svg")
	    .attr("width", param.width)
	    .attr("height", param.height);
	view.append("input").attr("type", "hidden").attr("id", "stanza_uniprot_id").attr("value", uniprot);
	
	var url = jpostdb.api + "protein_browser_init?" + param[uniprot].apiArg.join("&");
	jpostdb.fetchReq("post", url, null, renderDiv, param.width,  group.make_select);
    },

    make_select: function(json, renderDiv){
	var group = jpostdb.psm_align_compare;
	var param = group.param;

	var uniprot = renderDiv.select("#stanza_uniprot_id").attr("value");
	param[uniprot].seqArea = param.width - param.marginLeft - param.marginRight;
	param[uniprot].seq = json.seq;
	param[uniprot].seqLen = json.seq.length;
	param[uniprot].maxScale = Math.round(param[uniprot].seqLen / param[uniprot].seqArea * 10 * 100) / 100;
	
	var view = renderDiv.select("#protein_browser");
	var svg = renderDiv.select("#protein_browser_svg");
	var labelFlag = 0;
	var labelSwitch= function(){
	    if(labelFlag){
		labelFlag = 0;
		ctrl.select("#show_label").attr("fill", "#eecccc");
		ctrl.select("#hide_label").attr("fill", "#c6c6c6");
		svg.selectAll(".protein_browser_label_set").attr("display", "block");
	    }else{
		labelFlag = 1;
		ctrl.select("#show_label").attr("fill", "#c6c6c6");
		ctrl.select("#hide_label").attr("fill", "#eecccc");
		svg.selectAll(".protein_browser_label_set").attr("display", "none");
	    }
	}

	// label ctrl
	var ctrl = view.append("svg")
	    .attr("id", "protein_browser_ctrl")
	    .attr("width", param.width)
	    .attr("height", 20);
	var box = ctrl.append("g").attr("transform", "translate(" + param.marginLeft + ",0)");
	box.append("text")
	    .attr("x", 0)
	    .attr("y", 12)
	    .attr("fill", "#888888")
	    .text("Label:");
	var b = box.append("g")
	    .attr("class", "button")
	    .style("cursor", "pointer")
	    .on("click", function(){if(labelFlag == 1){labelSwitch();}});
	b.append("rect")
	    .attr("y", 0)
	    .attr("x", 50)
	    .attr("width", 50)
	    .attr("height", 16)
	    .attr("rx", 5)
	    .attr("ry", 5)
	    .attr("id", "show_label")
	    .attr("fill", "#eecccc");
	b.append("text")
	    .attr("y", 12)
	    .attr("x", 75)
	    .attr("fill", "#ffffff")
	    .attr("text-anchor", "middle")
	    .text("show");
	var b = box.append("g")
	    .attr("class", "button")
	    .style("cursor", "pointer")
	    .on("click", function(){if(labelFlag == 0){labelSwitch();}});
	b.append("rect")
	    .attr("y", 0)
	    .attr("x", 110)
	    .attr("width", 50)
	    .attr("height", 16)
	    .attr("rx", 5)
	    .attr("ry", 5)
	    .attr("id", "hide_label")
	    .attr("fill", "#c6c6c6");
	b.append("text")
	    .attr("y", 12)
	    .attr("x", 135)
	    .attr("fill", "#ffffff")
	    .attr("text-anchor", "middle")
	    .text("hide");
/*

	var form = renderDiv.append("div").attr("id", "protein_browser_form")
	    .style("margin-left", "20px");
	
	var select = form.append("select")
	    .attr("id", "view_select")
	    .attr("class", "protein_browser_select")
	    .on("change", function(d){
		var id = this.value;
		if(!id.match(/^--/)){	    
		    form.select("#sel_list_" + id).attr("disabled", true);
		    form.select("#sel_list_def").attr("selected", null).attr("selected", true);
		    var unimod = "";
		    if(id.match(/^ptm_position_\d+$/)){ unimod = id.match(/^ptm_position_(\d+)$/)[1]; id = "ptm_position"; }
		    var apiName = "protein_" + id;
		    var func = group[id];
		    var url = jpostdb.api + apiName + "?" + param.apiArg.join("&");
		    if(unimod) url += "&unimod=" + unimod;
		 //   jpostdb.httpReq("get", url, null, func, svg, renderDiv, param.seqArea / 2, param.top);
		    jpostdb.fetchReq("get", url, null, renderDiv, param.seqArea, func);
		}
	    });
	select.append("option")
	    .attr("id", "sel_list_def")
	    .text("-- Add view --");
	select.append("option")
	    .attr("class", "sel_list")
	    .attr("id", "sel_list_psm_align")
	    .attr("value", "psm_align")
	    .attr("disabled", true)
	    .text("Peptide alignment");
	select.selectAll(".ptm_list")
	    .data(json.ptm_list)
	    .enter()
	    .append("option")
	    .attr("class", "ptm_list")
	    .attr("id", function(d){ return "sel_list_ptm_position_" + d.mod.value.match(/UNIMOD_(\d+)$/)[1]; })
	    .attr("value", function(d){ return "ptm_position_" + d.mod.value.match(/UNIMOD_(\d+)$/)[1]; })
	    .text(function(d){ return d.mod_label.value + " site"; });
	if(json.p_link){
	    select.append("option")
		.attr("class", "sel_list")
		.attr("id", "sel_list_ptm_linkage")
		.attr("value", "ptm_linkage")
		.text("P-site linkage");
	}
	if(json.up_info){
	    select.append("option")
		.attr("class", "sel_list")
		.attr("id", "sel_list_known_ptm")
		.attr("value", "known_ptm")
		.text("UniProt annotation");
	}
	
*/

	var xAxis = [];
	var xAxiSub = [];
	var aaPos = [];
	
	var setData = function(){	    
	    //x-axis
	    xAxis = [];
	    var i = 0;
	    var interval = 100;
	    while( i * interval < param[uniprot].seqLen){
		var obj = {};
		var x = (i * interval - param[uniprot].start + 1) * param[uniprot].seqArea / param[uniprot].seqLen * param[uniprot].scale;
		obj.l = i * interval;
		obj.d = "none";
		if(x >= 0 && x <= param[uniprot].seqArea){
		    obj.x = Math.round(x * 1000) / 1000 + param.marginLeft;
		    obj.d = "block";
		}else if(x < 0){
		    obj.x = param.marginLeft;
		}else if(x > param[uniprot].seqArea){
		    obj.x = param[uniprot].seqArea + param.marginLeft;
		}
		xAxis.push(obj);
		i++;
	    }
	    xAxisSub = [];
	    var i = 0;
	    var interval = 100;
	    while( i * interval < parseInt(param[uniprot].seqLen)){
		var obj = {};
		var x = (i * interval - param[uniprot].start + 1 + 50) * param[uniprot].seqArea / param[uniprot].seqLen * param[uniprot].scale;
		obj.l = i * interval + 50;
		obj.d = "none";
		if(x >= 0 && x <= param[uniprot].seqArea){
		    obj.x = Math.round(x * 1000) / 1000 + param.marginLeft;
		    if(param[uniprot].seqLen / param[uniprot].scale < 250) obj.d = "block";
		}else if(x < 0){
		    obj.x = param.marginLeft;
		}else if(x > param[uniprot].seqArea){
		    obj.x = param[uniprot].seqArea + param.marginLeft;
		}
		xAxis.push(obj);
		i++;
	    }
	    
	    // x-axis back
	    xAxisBack = [];
	    for(var i = -1; i < param[uniprot].seqArea / 200 + 1; i++){  // leter=10 * window=10 * (white+glay=2);
		xAxisBack[i+1] = {};
		var sx = ((i * 20) - (param[uniprot].start % 20) + 1) * param[uniprot].seqArea / param[uniprot].seqLen * param[uniprot].scale;
		var ex = ((i * 20) - (param[uniprot].start % 20) + 11) * param[uniprot].seqArea / param[uniprot].seqLen * param[uniprot].scale;
		if(sx >= 0 && sx <= param[uniprot].seqArea){
		    xAxisBack[i+1].sx = Math.round(sx * 1000) / 1000 + param.marginLeft;
		}else if(sx < 0){
		    xAxisBack[i+1].sx = param.marginLeft;
		}else if(sx > param[uniprot].seqArea){
		    xAxisBack[i+1].sx = param[uniprot].seqArea + param.marginLeft;
		}
		if(ex >= 0 && ex <= param[uniprot].seqArea){
		    xAxisBack[i+1].ex = Math.round(ex * 1000) / 1000 + param.marginLeft;
		}else if(ex < 0){
		    xAxisBack[i+1].ex = param.marginLeft;
		}else if(ex > param[uniprot].seqArea){
		    xAxisBack[i+1].ex = param[uniprot].seqArea + param.marginLeft;
		}
	    }

	    // seq & aa
	    if(param[uniprot].scale == param[uniprot].maxScale){ //console.log(param[uniprot].start + " " + (param[uniprot].start + param[uniprot].seqArea / 10));
		aaPos = param[uniprot].start * (-10) + 10 + param.marginLeft;
	    }
	};

	var plot = function(){
	    // x-axis
	    svg.select("g#axis").selectAll(".x_axis")
		.data(xAxis)
		.attr("d", function(d){ return "M " + d.x + " 0 V 10";})
		.attr("display", function(d){ return d.d; });
	    svg.select("g#axis").selectAll(".x_axis_text")
		.data(xAxis)
		.attr("x", function(d){ return  d.x - 5 ;})
		.attr("display", function(d){ return d.d; });
	    svg.select("g#axis").selectAll(".x_axis_s")
		.data(xAxisSub)
		.attr("d", function(d){ return "M " + d.x + 50 + " 0 V 10";})
		.attr("display", function(d){ return d.d; });
	    svg.select("g#axis").selectAll(".x_axis_text_s")
		.data(xAxisSub)
		.attr("x", function(d){ return  d.x + 50 - 5 ;})
		.attr("display", function(d){ return d.d; });
	    
	    // seq & aa & back
	    if(param[uniprot].scale == param[uniprot].maxScale){
		svg.selectAll("text.aaseq")
		    .attr("x", aaPos)
		    .attr("display", "block");
		svg.selectAll("rect.x_axis_back")
		    .data(xAxisBack)
		    .attr("x", function(d){ return d.sx;})
		    .attr("width", function(d){ return d.ex - d.sx;})
		    .attr("display", "block");
	    }else{
		svg.selectAll("text.aaseq")
		    .attr("display", "none");
		svg.selectAll("rect.x_axis_back")
		    .attr("display", "none");
	    }
	};
	
	var render = function(){   
	    // x-axis
	    param[uniprot].top += param.marginTop;
	    var g = svg.append("g")
		.attr("transform", "translate(0," + param[uniprot].top + ")")
		.attr("id", "axis");
	    g.selectAll(".x_axis_back")
		.data(xAxisBack)
		.enter()
		.append("rect")
		.attr("class", "x_axis_back")
		.attr("fill", "#eeeeee")
		.attr("y", 0)
		.attr("display", "none");
	    g.append("path")
		.attr("stroke", "#000000")
		.attr("fill", "none")
		.attr("stroke-width", "1px")
		.attr("d", "M " + param.marginLeft + " 10  H " + (param[uniprot].seqArea + param.marginLeft));
	    g.selectAll(".x_axis")
		.data(xAxis)
		.enter()
		.append("path")
		.attr("stroke", "#000000")
		.attr("fill", "none")
		.attr("stroke-width", "1px")
		.attr("class", "x_axis")
		.attr("d", function(d){ return "M " + d.x + " 0 V 10";});
	    g.selectAll(".x_axis_text")
		.data(xAxis)
		.enter()
		.append("text")
		.attr("class", "x_axis_text")
		.attr("text-anchor", "end")
		.attr("font-size", 12)
		.attr("x", function(d){ return  d.x - 5 ;})
		.attr("y", 0)
		.text(function(d){ return d.l;});
	    g.selectAll(".x_axis_s")
		.data(xAxisSub)
		.enter()
		.append("path")
		.attr("stroke", "#000000")
		.attr("fill", "none")
		.attr("stroke-width", "1px")
		.attr("class", "x_axis_s")
		.attr("d", function(d){ return "M " + d.x + " 0 V 10";})
		.attr("display", "none");
	    g.selectAll(".x_axis_text")
		.data(xAxisSub)
		.enter()
		.append("text")
		.attr("class", "x_axis_text_s")
		.attr("text-anchor", "end")
		.attr("font-size", 12)
		.attr("x", function(d){ return  d.x - 5 ;})
		.attr("y", 0)
		.attr("display", "none")
		.text(function(d){ return d.l;});
	    
	    // seq
	    param[uniprot].top += 20 + param.lineHeight / 2;
	    var g = svg.append("g")
		.attr("transform", "translate(0," + param[uniprot].top + ")")
		.attr("calss", "seq");
	    g.append("path")	
		.attr("stroke", "#6991c6")
		.attr("fill", "none")
		.attr("stroke-width", param.lineHeight + "px")
		.attr("d", "M " + param.marginLeft + " 0 H " + (param[uniprot].seqArea + param.marginLeft));
	    g.append("text")
		.attr("fill", "#ffffff")
		.attr("class", "aaseq protein_browser_mono")
		.attr("y", 5)
		.attr("display", "none")
		.attr("textLength", param[uniprot].seqLen * 10)
		.attr("lengthAdjust", "spacingAndGlyphs")
		.text(param[uniprot].seq);
	    
	    param[uniprot].top += param.lineHeight/2 + param.margin;
	    svg.attr("height", param[uniprot].top);
	};

	setData();
	render();
	plot();

	group.mouseEventCheck(svg, renderDiv);
	group.mouseEvent(svg, setData, plot, renderDiv);

	var url = jpostdb.api + "protein_psm_align?" + param[uniprot].apiArg2;
	jpostdb.fetchReq("get", url, null, renderDiv, param[uniprot].seqArea, group.chk_slice2_max);
    },

    x_axis_bg_height: function(renderDiv){
	var group = jpostdb.psm_align_compare;
	var param = group.param;
	var svg = renderDiv.select("#protein_browser_svg");
	var uniprot = renderDiv.select("#stanza_uniprot_id").attr("value");
	
	svg.selectAll("rect.x_axis_back")
	    .transition()
	    .duration(param.anime)
	    .attr("height", param[uniprot].top - param.marginTop - param.margin);
    },

    chk_slice2_max: function(json, renderDiv){
	var group = jpostdb.psm_align_compare;
	var param = group.param;
	var uniprot = renderDiv.select("#stanza_uniprot_id").attr("value");
	
	param[uniprot].psm_count_max = 0;
	for(var i = 0; i < json.length; i++){
	    if(json[i].count - 0 > param[uniprot].psm_count_max) param[uniprot].psm_count_max = json[i].count - 0;
	}
	var url = jpostdb.api + "protein_psm_align?" + param[uniprot].apiArg1;
	jpostdb.fetchReq("get", url, null, renderDiv, param[uniprot].seqArea, group.psm_align);
    },

    psm_align: function(psm, renderDiv){
	var group = jpostdb.psm_align_compare;
	var param = group.param;
	var svg = renderDiv.select("#protein_browser_svg");
	var uniprot = renderDiv.select("#stanza_uniprot_id").attr("value");

	var slice_count = param[uniprot].slice_count;

	if(slice_count == 1){
	    for(var i = 0; i < psm.length; i++){
		if(psm[i].count - 0 > param[uniprot].psm_count_max) param[uniprot].psm_count_max = psm[i].count - 0;
	    }
	}

	var maxPsmY = 0;
	for(var i = 0; i < psm.length; i++){
	    if(psm[i].y - 0 > maxPsmY) maxPsmY = psm[i].y - 0;
	}

	var toHex = function(num){
	    var hex = num.toString(16);
	    if(hex.length == 1) hex = "0" + hex;
	    return hex;
	}
	var count2color = function(count, max){      // red ~ gray
	    var tmp = ~~((count-1) / (max-1) * 255 / 2 + 128); // 128 ~ 255
	    if(tmp <= 128) tmp = 128;
	    if(tmp >= 255) tmp = 255;
	    var r_color = toHex(tmp);
	    var gb_color = toHex(255 - tmp);
	    return "#" + r_color + gb_color + gb_color;
	}

	var setData = function(){
	    // psms
	    for(var i = 0; i < psm.length; i++){
		var sx = (psm[i].begin - param[uniprot].start) * param[uniprot].seqArea / param[uniprot].seqLen * param[uniprot].scale;
		if(sx >= 0 && sx <= param[uniprot].seqArea) psm[i].sx = Math.round(sx * 1000) / 1000 + param.marginLeft;
		else if(sx < 0) psm[i].sx = param.marginLeft;
		else if(sx > param[uniprot].seqArea) psm[i].sx = param[uniprot].seqArea + param.marginLeft;
		
		var ex = (psm[i].end - param[uniprot].start + 1) * param[uniprot].seqArea / param[uniprot].seqLen * param[uniprot].scale;
		if(ex >= 0 && ex <= param[uniprot].seqArea) psm[i].ex = Math.round(ex * 1000) / 1000 + param.marginLeft;
		else if(ex < 0) psm[i].ex = param.marginLeft;
		else if(ex > param[uniprot].seqArea) psm[i].ex = param[uniprot].seqArea + param.marginLeft;
	    }
	}
	
	var plot = function(){	    
	    // psms
	    svg.select("g#psm_align_" + slice_count).selectAll(".seq")
		.attr("d", function(d){ return "M " + d.sx + " " + d.y + " H " + d.ex; });
	    svg.select("g#psm_align_" + slice_count).selectAll(".seq_txt")
		.attr("x", function(d){ return d.sx; });
	}
	

	var render = function(){
	    // psms
	    for(var i = 0; i < psm.length; i++){
		psm[i].y = psm[i].y * param.lineHeight - param.lineHeight/2;
	    }
	    var g = svg.append("g")
		.attr("class", "psms view_unit")
		.attr("transform", "translate(0," + param[uniprot].top + ")")
		.attr("id", "psm_align_" + slice_count);
	    var label = g.append("g").attr("class", "protein_browser_label_set");
	    label.append("text")
		.attr("y", 20)
		.attr("x", 20)
		.attr("fill", "#beccdd")
		.attr("class", "protein_browser_label")
		.text("slice " + slice_count);
	    
	    g.selectAll(".seq")
		.data(psm)
		.enter()
		.append("a")
	//	.attr("xlink:href", function(d){ return "javascript:jPost.openPeptide('" + d.pep_id + "')"; })
	    	.attr("xlink:href", function(d){ return "peptide?id=" + d.pep_id; })
		.attr("target", "_new")
		.append("path")
		.attr("class", "seq")
		.attr("stroke", function(d){ return count2color(d.count, param[uniprot].psm_count_max);})
		.attr("fill", "none")
		.attr("stroke-width", "10px")
		.attr("d", function(d){ return "M " + d.sx + " " + d.y + " H " + d.ex; })
		.on("mouseover", function(d){ svg.selectAll('.psm_' + d.label.match(/^([A-Z]+):/)[1]).attr("display", "block"); })
		.on("mouseout", function(d){ svg.selectAll('.psm_' + d.label.match(/^([A-Z]+):/)[1]).attr("display", "none"); })
	    g.selectAll(".seq_txt")
		.data(psm)
		.enter()
		.append("text")
		.attr("class",  function(d){ return "seq_txt protein_browser_mono psm_" + d.label.match(/^([A-Z]+):/)[1] ;} )
		.attr("id", function(d){ return d.label.replace(/[^\w\_]/g, "_") + "_" + slice_count; })
    		.attr("textLength",  function(d){ return d.label.length * 10;})
		.attr("lengthAdjust", "spacingAndGlyphs")
		.attr("x", function(d){ return d.sx; })
		.attr("y", -3)
		.attr("display", "none")
		.text(function(d){return d.label});

	    var h = (maxPsmY + 1) * param.lineHeight;
	    group.delUnit.mkButton(renderDiv, "psm_align", h);
	    param[uniprot].top += h;
	    svg.transition().duration(param.anime).attr("height", param[uniprot].top);
	    group.x_axis_bg_height(renderDiv);
	}
	
	setData();
	render();
	plot();
	
	group.mouseEvent(svg, setData, plot, renderDiv);

	if(param[uniprot].slice_count == 1){

	    // seq
	    param[uniprot].top += param.lineHeight / 2;
	    var g = svg.append("g")
		.attr("transform", "translate(0," + param[uniprot].top + ")")
		.attr("calss", "seq");
	    g.append("path")	
		.attr("stroke", "#6991c6")
		.attr("fill", "none")
		.attr("stroke-width", param.lineHeight + "px")
		.attr("d", "M " + param.marginLeft + " 0 H " + (param[uniprot].seqArea + param.marginLeft));
	    g.append("text")
		.attr("fill", "#ffffff")
		.attr("class", "aaseq protein_browser_mono")
		.attr("y", 5)
		.attr("display", "none")
		.attr("textLength", param[uniprot].seqLen * 10)
		.attr("lengthAdjust", "spacingAndGlyphs")
		.text(param[uniprot].seq);
	    
	    param[uniprot].top += param.lineHeight/2 + param.margin;
	    svg.attr("height", param[uniprot].top);
	   param[uniprot].slice_count++; 
	    var url = jpostdb.api + "protein_psm_align?" + param[uniprot].apiArg2;
	    jpostdb.fetchReq("get", url, null, renderDiv, param[uniprot].seqArea, group.psm_align);
	}

    },

    delUnit: {
	y: {},
	mkButton: function(renderDiv, gid, h){
	    var group = this;
	    var param = jpostdb.psm_align_compare.param;
	    var uniprot = renderDiv.select("#stanza_uniprot_id").attr("value");
	    var svg = renderDiv.select("#protein_browser_svg");
	    var unit = svg.select("#" + gid);
	    var g = unit.append("g")
		.attr("class", "del_button protein_browser_label_set")
		.style("cursor", "pointer")
	    	.on("click", function(){ group.remove(renderDiv, gid, h); });
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
	    this.y[gid] = param[uniprot].top;
	},

	remove: function(renderDiv, gid, h){
	    var param = jpostdb.psm_align_compare.param;
	    var uniprot = renderDiv.select("#stanza_uniprot_id").attr("value");
	    var svg = renderDiv.select("#protein_browser_svg");
	    var form = renderDiv.select("#protein_browser_form");
	    svg.select("#" + gid).remove();
	    var array = Object.keys(this.y);
	    for(var i = 0; i < array.length; i++){
		if(this.y[array[i]] >= this.y[gid] + h){
		    this.y[array[i]] -= h;
		    svg.select("#" + array[i]).transition().duration(param.anime).attr("transform", "translate(0," + this.y[array[i]] + ")");
		}
	    }
	    param[uniprot].top -= h;
	    svg.transition().duration(100).attr("height", param[uniprot].top);
	    svg.selectAll("rect.x_axis_back").transition().duration(100).attr("height", param[uniprot].top - param.marginTop - param.margin);
	    form.select("#sel_list_" + gid).attr("disabled", null); form.select("#sel_list_def").attr("selected", null).attr("selected", true);
	},
    },
	
    mouseEventCheck: function(mouseEveElement, renderDiv){
	var param = jpostdb.psm_align_compare.param;
	var uniprot = renderDiv.select("#stanza_uniprot_id").attr("value");

	param[uniprot].mouseOnElement = false;
	mouseEveElement.on("mouseover", function(){ param[uniprot].mouseOnElement = true;});
	mouseEveElement.on("mouseout", function(){ param[uniprot].mouseOnElement = false;});
    },
    
    mouseEvent: function(mouseEveElement, setData, plot, renderDiv){
	var param = jpostdb.psm_align_compare.param;
	var uniprot = renderDiv.select("#stanza_uniprot_id").attr("value");
	
	var setTimeoutId = null; // scroll stop timer
	var scrolling = false; // scroll flag
	
	var setParamStart = function(){
	    if(param[uniprot].start < 1) param[uniprot].start = 1;
	    if((param[uniprot].seqLen - param[uniprot].start - 1) * param[uniprot].scale < param[uniprot].seqLen) param[uniprot].start = param[uniprot].seqLen * (param[uniprot].scale - 1) / param[uniprot].scale + 1;
	};

/* conflict error: multi togostanza(JS) (with _header.html include d3.js) + webkit
	var mouseMoveEvent = function(e){
	    var mouse = d3.mouse(this);
	    param.mouseX = mouse[0];
	    param.mouseY = mouse[1];
	}; */
	
	// drag = [mouseDown + mouseMove + mouseUp] 	
	var mouseMoveEventDraw = function(e){
	    if(param[uniprot].mouseOnElement){
		var rect = e.target.getBoundingClientRect(); 
		param[uniprot].mouseX = e.clientX - rect.left;
		param[uniprot].mouseY = e.clientY - rect.top;
		if(param[uniprot].dragFlag){
		    param[uniprot].start = param[uniprot].dragStartX + (param[uniprot].dragMouseX - param[uniprot].mouseX) / param[uniprot].seqArea * param[uniprot].seqLen / param[uniprot].scale;
		    setParamStart();
		    setData();
		    plot();
		}
	    }else{
		param[uniprot].dragFlag = false;
	    }
	};

	var mouseDownEvent = function(){
	    if(param[uniprot].mouseOnElement){
		param[uniprot].dragFlag = true;
		param[uniprot].dragStartX = param[uniprot].start;
		param[uniprot].dragMouseX = param[uniprot].mouseX;
	    }
	}
	
	var mouseUpEvent = function(){
	    if(param[uniprot].dragFlag) param[uniprot].dragFlag = false;
	}


	var preventDefault = function(e) {
	    e = e || window.event;
	    if (e.preventDefault)
		e.preventDefault();
	    e.returnValue = false;  
	}
	
	// scroll
	var scrollEvent = function(e){
	    if(param[uniprot].mouseOnElement){
		window.onwheel = preventDefault;
		scrolling = true ;
		var target = e.target;
		var delta = e.deltaY ? -(e.deltaY) : e.wheelDelta ? e.wheelDelta : -(e.detail);
		var position = (param[uniprot].mouseX - param.marginLeft) * param[uniprot].seqLen / param[uniprot].seqArea / param[uniprot].scale;
		if(delta > 0 && param[uniprot].scale != param[uniprot].maxScale){
		    param[uniprot].scale *= 1.03;
		    if(param[uniprot].scale > param[uniprot].maxScale) param[uniprot].scale = param[uniprot].maxScale;
		}else if(delta < 0 && param[uniprot].scale != 1){
		    param[uniprot].scale /= 1.03;
		    if(param[uniprot].scale < 1) param[uniprot].scale = 1;
		}
		param[uniprot].scale = Math.round(param[uniprot].scale * 100) / 100;
		var newPosition = (param[uniprot].mouseX - param.marginLeft) * param[uniprot].seqLen / param[uniprot].seqArea / param[uniprot].scale;	
		param[uniprot].start += position - newPosition;
		param[uniprot].start = Math.round(param[uniprot].start * 100) / 100;
		setParamStart();
		setData();
		plot();

		// (同期して描画すると重いので、各表示それぞれのタイミングで個別に描画。
		// タイミングが違うので微妙にずれる。スクロール終了を検知したら全部の描画をし直して合わせる)
		if(setTimeoutId){ clearTimeout(setTimeoutId); }
		setTimeoutId = setTimeout( function() {
		    // re-plot if stoped scroll 
		    setParamStart();
		    setData();
		    plot();
		    scrolling = false;
		    setTimeoutId = null;
		}, 100 );
		
	    }else{
		if(!jpostdb.psm_align_compare.chk_onwheel_in_psm_comp()) window.onwheel = true;
	    }
	}

//	mouseEveElement.on("mousemove", mouseMoveEvent, false); // conflict error: multi togostanza(JS) (with _header.html include d3.js) + webkit
	mouseEveElement.on("mousedown", mouseDownEvent, false);	
	d3.select(window).on("mouseup", mouseUpEvent, false);
	var mousewheel = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
	document.addEventListener (mousewheel,  scrollEvent, false);
	document.addEventListener ("mousemove",  mouseMoveEventDraw, false);
    },

    chk_onwheel_in_psm_comp: function(){
        var mouseEvent = false;
        for (var key in jpostdb.psm_align_compare.param) {
            if(jpostdb.psm_align_compare.param[key].mouseOnElement){
                mouseEvent = true;
                break;
            }
        }
        return mouseEvent;
    },

    
};
