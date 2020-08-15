// Testing ground
// const EasyPost = require("@easypost/api");
// const apiKey = "EZTK29b55ab4ee7a437890e19551520f5dd0uaJjPiW9XsVqXYFNVI0kog";
// const api = new EasyPost(apiKey);

// const datepicker = document.getElementById('datepicker');

// function pickadate() {
//   datepicker.value = moment(new
//     Date(data.Released)).format('DD/MM/YYYY');
// }

// const request = require('request');
// request('http://www.google.com', function (error, response, body) {
//   console.error('error:', error); // Print the error if one occurred
//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   console.log('body:', body); // Print the HTML for the Google homepage.
// });

const printer = require("@thiagoelg/node-printer")
util = require('util');
console.log("installed printers:\n"+util.inspect(printer.getPrinters(), {colors:true, depth:10}));