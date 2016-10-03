var token = 'b1683709bb35b5zx';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello world');
});

app.listen(5000, function () {
  console.log('Listening on port 5000');
});

// respond to facebook's verification
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === token) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

// respond to post calls from facebook


app.post('/webhook/', function (req, res) {
  var messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    var event = req.body.entry[0].messaging[i];
    var sender = event.sender.id;
    if (event.message && event.message.text) {
      var location = event.message.text;
      var witAIEndpoint = 'https://api.wit.ai/message?v=20141022&q=' + location;

      request({
        url: witAIEndpoint,
        json: true,
        headers: {
          'Authorization': 'Bearer SOXX73J6B76A3WDYI7DRJH2UPVJKMN6A'
        }
      }, function(error, response, body) {
        try {
          var firstOutcome = body.outcomes.pop();
          var entities = firstOutcome.entities;
          // var par = entities.location;
          // var from = par[0].value;
          // var to = par[1].value;
          // console.log(from);
          // console.log(to);
          if (entities.howzyou && entities.howzyou.pop().value) {
            
             var myTemplate = "Looking for flight";
              var type = 'text';
             try {
              sendTextMessage(sender,myTemplate, type);
            } catch(err) {
              console.error('error caught', err);
              sendTextMessage(sender, "There was an error1.",type);
            }
          }
          else if (entities.yes_no && entities.yes_no.pop().value) {
            
             var myTemplate = "From";
              var type = 'text';
             try {
              sendTextMessage(sender,myTemplate, type);
            } catch(err) {
              console.error('error caught', err);
              sendTextMessage(sender, "There was an error1.",type);
            }
          }
          // else {
          //   var location = entities.location.pop().value;
          //   var weatherEndpoint = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + location + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
          //   var type = 'text';
          //   request({
          //     url: weatherEndpoint,
          //     json: true
          //   }, function(error, response, body) {
          //     try {
          //       var condition = body.query.results.channel.item.condition;
          //       // sendTextMessage(sender, "Weather");
          //       sendTextMessage(sender, "Today is " + condition.temp + " and " + condition.text + " in " + location, type);
          //     } catch(err) {
          //       console.error('error caught2', err);
          //       sendTextMessage(sender, "There was an error.",type);
          //     }
          //   });
          // }          
        } catch(err) {
          console.error('error caught', err);
          sendTextMessage(sender, "There was an error2.");
        }
      });
    }
  }
  res.sendStatus(200);
});



function sendTextMessage(sender, text, type) {
  var access_token ='EAAWbRYxNjOEBAJrZARWQtd0jJl4ZCpPG67pXQ68E448bmRRZCy6hUTXqS4CsZBO3WANmqObtagBZAtDHbdTU1vmxYwM0nkc5Q0GuDqlbglwWMDSv4fr3IZALXGz1VG4kvu2xD1QOzKeiEKhxC6fzkpKBmnZBcpn4PAeZCO2jHzSNhQZDZD';
  if (type == 'attachment') {
    var messageData = {
      attachment:text
    }
  }
  else {
    var messageData = {
      text:text
    } 
  }

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:access_token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}
