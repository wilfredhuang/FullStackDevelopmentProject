const accountSid = 'AC7994551ea296710e5de3b74d7a93056c';
const authToken = 'f5ac6a9439b75395ce54e9783d0f8877';
const client = require('twilio')(accountSid, authToken);

// client.messages
//   .create({
//      body: 'This is the ship that made the Kessel Run in fourteen parsecs? Your tracking code is and check your delivery here!',
//      from: '+12059461964',
//      to: '+6590251744'
//    })
//   .then(message => console.log(message.sid));
toNumberWeb = "+6590251744"
  client.messages
    .create({
      body: "this is not delivery",
      from: "+12059461964",
      to: toNumberWeb,
    })
    .then((message) => console.log(message.sid));