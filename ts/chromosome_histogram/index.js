Stanza(function(stanza, params) {

    stanza.render({
        template: "stanza.html"
    });
     
    jpostdb.chromosome_histogram.init(params, stanza, "#draw_area");
});
