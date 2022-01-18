Stanza(function(stanza, params) {

    stanza.render({
        template: "stanza.html"
    });

   jpostdb.dataset_chromosome.init(params, stanza, "#draw_area");
});
