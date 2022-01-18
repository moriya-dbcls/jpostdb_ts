Stanza(function(stanza, params) {

    stanza.render({
        template: "stanza.html"
    });

    jpostdb.protein_browser.init(params, stanza, "#draw_area");
});
