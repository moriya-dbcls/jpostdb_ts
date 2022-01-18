Stanza(function(stanza, params) {

    let id = Math.floor( Math.random() * 10000000 );

    stanza.render({
        template: "stanza.html",
        parameters: {
            id: id
        }
    });

    jpostdb.stat_pie_chart.init(params, stanza, "#draw_area_" + id);
});
