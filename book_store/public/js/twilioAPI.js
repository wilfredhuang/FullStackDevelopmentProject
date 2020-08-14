// Hasan's trial acc id and auth
// const accountSid = 'AC7994551ea296710e5de3b74d7a93056c';
// const authToken = 'f5ac6a9439b75395ce54e9783d0f8877';
const accountSid = 'AC583c7d4bc97864b67d16d8430ad9da88';
const authToken = 'e46e5a7f50ee56da9999d8feefe82ee9';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: 'This is the ship that made the Kessel Run in fourteen parsecs? Your tracking code is and check your delivery here!',
     from: '+14242066417',
     to: '+6587558054'
   })
  .then(message => console.log(message.sid));