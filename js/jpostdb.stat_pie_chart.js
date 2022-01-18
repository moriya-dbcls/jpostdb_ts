// jPOST-db make database pie-chart

jpostdb.stat_pie_chart = jpostdb.stat_pie_chart || {
    param: {
	width: 10,
	height: 10,
	top: 0,
	outSize: 200,
	inSize: 130,
	margin: 20,
	anime: 100
    },

    init: function(stanza_params, stanza, renderDiv){
	var group = jpostdb.stat_pie_chart;
	var param = group.param;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	
	var renderDiv = d3.select(stanza.select(renderDiv));
	var view = renderDiv.append("div").attr("class", "view");
	var svg = view.append("svg")
	    .attr("id", "pie_chart_svg")
	    .attr("width", param.outSize)
	    .attr("height", param.outSize - 50);  // for loading animation icon
	
	var url = jpostdb.api + "stat_chart_filtering?" + param.apiArg.join("&");
	jpostdb.fetchReq("get", url, null,  renderDiv, param.outSize, group.pie_chart);
    },

    pie_chart: function(json, renderDiv){
	var group = jpostdb.stat_pie_chart;
	var param = group.param;
	var svg = renderDiv.select("#pie_chart_svg");
	svg.attr("height", param.outSize);
	
	var callBack = function(onclick_list){
	    for(var i = 0; i < onclick_list.length; i++){
		var type = onclick_list[i].type;
		var id = onclick_list[i].id;
		var label = onclick_list[i].label;
		jpost.addFilter( type, id, label);
	/*	$.each($("#" + type).children(), function(){
		    if( !id || $(this).attr('value') == id ) $(this).remove();
		});
		if(id){
		    var $newOption = $("<option></option>").val(id).text(label);1
		    $("#" + type).append($newOption);
		    $("#" + type).val(id).trigger('change');1
		} */
	    }
	 //   jPost.updateTables( '' );
	}
	
	svg.transition().duration(param.anime).attr("height", param.outSize);
	jpostdb.utils.pie_chart2(json.data, svg, json.type, json.unit, param.outSize, param.inSize, 1, callBack);

    }
};
