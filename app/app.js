$(document).ready( function() {
    app.initialized()
        .then(function(_client) {
          var client = _client;
          client.events.on('app.activated',
            function() {
                client.data.get('requester')
                    .then(function(data) {
                        $('#apptext').text("Ticket created by " + data.requester.name);
                    })
                    .catch(function(e) {
                        console.log('Exception - ', e);
                    });
                    console.log("going to call the list tasks api.");
                    var self = this,
                        headers = { Authorization: "bearer <%= access_token %>"},
                        reqData = { headers: headers, isOAuth: true },
                        url = "https://www.googleapis.com/tasks/v1/users/@me/lists?key=AIzaSyBtXBBgIIUHqeDz_dcui7p8Iroujhq5OAI";
                    console.log("going to call the list tasks api. One step ahead.");
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
