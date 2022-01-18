Stanza(function(stanza, params) {
    
    stanza.render({
	template: "stanza.html",

    });

    jpostdb.kegg_mapping_form.init(params, stanza, "#draw_area");
});

