Stanza(function(stanza, params) {
  let formBody = [];
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
  if(params["slice_stanza"] == "1") api += "slice_stanza_";
  let name = "table_items_slice";
  
  let q = fetch(api + name, options).then(res => res.json());
  
  q.then(function(data){
    stanza.render({
      template: "stanza.html",
      parameters: {
	result: data
      }
    });
  });
});

