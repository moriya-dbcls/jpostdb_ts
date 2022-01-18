// jPOST-db utils

jpostdb.img_download = jpostdb.img_download || {

    downloadImg: function(svg, format, filename, shadowDomMain){
	let url, img, canvas, context;
	let pngZoom = 2;  // png resolution rate

	let style = "";
	if(shadowDomMain) style = shadowDomMain.getElementsByTagName("style")[0].outerHTML.replace(/[\r\n]/g, "");
	let tmp = svg.node().outerHTML.match(/^([^\>]+\>)(.+)$/);
	let string = tmp[1] + style + tmp[2];
	let w = parseInt(svg.style("width"));
	let h = parseInt(svg.style("height"));
	svg.attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg");
	
	// downloading function
	let aLinkClickDL = function(){
	    if(format == "png"){
		context.drawImage(img, 0, 0, w, h, 0, 0, w * pngZoom, h * pngZoom);
		url = canvas.node().toDataURL("image/png");
	    }
	    
	    let a = d3.select("body").append("a");	
	    a.attr("class", "downloadLink")
		.attr("download", filename)
		.attr("href", url)
		.text("test")
		    .style("display", "none");
		
	    a.node().click();
		
	    setTimeout(function() {
		window.URL.revokeObjectURL(url);
		if(format == "png") canvas.remove();
		a.remove();
	    }, 10)  
	};
	
	if(format == "svg"){  // SVG
	    filename += ".svg";
	    let blobObject = new Blob([string], { "type" : "data:image/svg+xml;base64" })
    	    url = window.URL.createObjectURL(blobObject)
	    aLinkClickDL();
	}else if(format == "png"){  // PNG
	    filename += ".png";
	    img = new Image();
	    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(string);
	    img.addEventListener('load', aLinkClickDL, false);
	    
	    canvas = d3.select("body").append("canvas")
		.attr("width", w * pngZoom)
		.attr("height", h * pngZoom)
		.style("display", "none");
	    context = canvas.node().getContext("2d");
	}
    },

    appendDlButton: function(buttonDiv, svg, filename, shadowDomMain){
	let dlButtonDiv = buttonDiv.append("div")
	    .attr("id", "dl_button")
	    .style("text-align", "right");

	dlButtonDiv.append("input")
	    .attr("class", "downloadButton")
	    .attr("type", "button")
	    .attr("value", "svg")
	    .on("click", function(){ jpostdb.img_download.downloadImg(svg, "svg", filename, shadowDomMain); });
	
	dlButtonDiv.append("input")
	    .attr("class", "downloadButton")
	    .attr("type", "button")
	    .attr("value", "png")
	    .on("click", function(){ jpostdb.img_download.downloadImg(svg, "png", filename, shadowDomMain); });

    }
}
