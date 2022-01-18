Stanza(function(stanza, params) {

    stanza.render({
        template: "stanza.html"
    });

    jpostdb.proteoform_browser.init(params, stanza, "#draw_area");
});
