Stanza(function(stanza, params) {

    stanza.render({
        template: "stanza.html",
    });

    jpostdb.psm_align_compare.init(params, stanza, "#draw_area");
});
