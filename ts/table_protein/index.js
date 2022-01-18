Stanza(function(stanza, params) {

    var formBody = [];
    for (var key in params) {
        if(params[key]) formBody.push(key + "=" + encodeURIComponent(params[key]));
    }

    var options = {
        method: "POST",
        mode:  "cors",
        body: formBody.join("&"),
        headers: {
            "Accept": "application/json",
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

  let env = "tools";
  if(location.host.match("db-dev")) env = "db-dev";
  let api = document.location.protocol + "//" + env + ".jpostdb.org/rest/api/";
    var name = "table_items_protein";

    var q = fetch(api + name, options).then(res => res.json());

    q.then(function(data){
        stanza.render({
            template: "stanza.html",
            parameters: {
                result: data
            }
        });
    });
});
