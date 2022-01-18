Stanza(function(stanza, params) {

    stanza.render({
        template: "stanza.html"
    });

    jpostdb.database_pie_chart.init(params, stanza, "#draw_area");
});
