Stanza(function(stanza, params) {

    stanza.render({
        template: "stanza.html"
    });
    
    jpostdb.protein_evidence.init(params, stanza, "#draw_area");
});
