Stanza(function(stanza, params) {

    stanza.render({
        template: "stanza.html"
    });

    jpostdb.go_count.init(params, stanza, "#draw_area");
});
