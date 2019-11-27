$(document).ready( function() {
    app.initialized()
        .then(function(_client) {
          var client = _client;
          client.events.on('app.activated',
            function() {
                var self = this,
                        headers = { Authorization: "Bearer <%= access_token %>",
                                    Accept : "*/*", "Cache-Control" : "no-cache"},
                        reqData = { headers: headers, isOAuth: true },
                        url = "https://www.googleapis.com/tasks/v1/users/@me/lists?key=AIzaSyBtXBBgIIUHqeDz_dcui7p8Iroujhq5OAI";
                    client.request.get(url, reqData).then(
                        function(data) {
                           console.log("tasks lists: ", data);
                           // var response = JSON.parse(data.response)["value"];
                           // handleSuccess(response);
                        },
                        function(error) {
                          console.log("error:", error);
                          console.log("error status:", error.status);
                          //handleError(error);
                        }
                    );
            });
        });
});
