// Testing ground
const EasyPost = require("@easypost/api");
const apiKey = "EZTK29b55ab4ee7a437890e19551520f5dd0uaJjPiW9XsVqXYFNVI0kog";
const api = new EasyPost(apiKey);

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

// console.log('platform:', process.platform);
//console.log('try to print file: ' + filename);
//console.log("installed printers:\n"+util.inspect(printer.getPrinters(), {colors:true, depth:10}));
//console.log(printer.getPrinter("HP1B1B2A (HP ENVY 7640 series)"))
// console.log(printer.getPrinterDriverOptions("HP1B1B2A (HP ENVY 7640 series)"))
//console.log(printer.getSupportedPrintFormats())
//console.log('default printer name: ' + (printer.getDefaultPrinterName() || 'is not defined on your computer'));

// printer.printDirect({data:"https://easypost-files.s3-us-west-2.amazonaws.com/files/postage_label/20200722/8c6fc542dea042a6bd1a66fefa53c84b.png" // or simple String: "some text"
// 	, printer:"HP1B1B2A (HP ENVY 7640 series)" // printer name, if missing then will print to default printer
// 	, type: 'RAW' // type: RAW, TEXT, PDF, JPEG, .. depends on platform
// 	, success:function(jobID){
// 		console.log("sent to printer with ID: "+jobID);
// 	}
// 	, error:function(err){console.log(err);}
// });
//  console.log(printer.getJob("HP1B1B2A (HP ENVY 7640 series)", 4))
// console.log(printer.getPrinter("HP1B1B2A (HP ENVY 7640 series)"))

// api.Shipment.retrieve('shp_54a873a46bf44a52971851b0919b5230').then(shipment => {
//     shipment.convertLabelFormat('PDF').then(console.log);
//   });
// api.Shipment.retrieve('shp_2065671e75a448dd9aa505ff3eb58ee1').then(console.log);

// var PrintNodeClient = require("PrintNode-NodeJS");
// var client = new PrintNodeClient({ api_key: "DGjrFiPUgRwFrGqlSEJjGntiRj-DHjoqOxXeRX7RV-o", default_printer_id: 69642287 });
//client.whoAmI().then(console.log);
//client.fetchComputers().then(console.log)
//client.fetchPrinters().then(console.log)
//client.fetchPrinters(69642287).then(console.log);
// client.fetchPrintJob().then(console.log);
// Create a print job

// var options = {
//     title: "Printing example 1",
//     source: "PrintNode-NodeJS", // defaults to this
//     content: "https://easypost-files.s3-us-west-2.amazonaws.com/files/postage_label/20200815/bbf6eec2a93a475bbcd841777d0dc837.pdf",
//     contentType: "pdf_uri"
//   };
//   client.createPrintJob(options).then(console.log); // returns printjob id only

//const printer = require("@thiagoelg/node-printer"),
// //,    filename = process.argv[2] || __filename;
// util = require('util');
// imagemagick, // will be loaded later with proper error.
//     fs = require('fs'),
//     filename = process.argv[2],
//     printername = process.argv[2];

// if(process.platform !== 'win32') {
//     throw 'This application can be run only on win32 as a demo of print PDF image'
// }

// if(!filename) {
//     throw 'PDF file name is missing. Please use the following params: <filename> [printername]'
// }

// try {
//     imagemagick = require('imagemagick-native');
// } catch(e) {
//     throw 'please install imagemagick-native: `npm install imagemagick-native`'
// }

// var data = fs.readFileSync(filename);

// console.log('data: ' + data.toString().substr(0, 20));

// //console.log(imagemagick.identify({srcData: data}));

// // First convert PDF into
// imagemagick.convert({
//     srcData: data,
//     srcFormat: 'PDF',
//     format: 'EMF',
// }, function(err, buffer) {
//     if (err) {
//         throw 'something went wrong on converting to EMF: ' + err;
//     }

//     // Now we have EMF file, send it to printer as EMF format
//     printer.printDirect({
//         data: buffer,
//         type: 'EMF',
//         success: function(id) {
//             console.log('printed with id ' + id);
//         },
//         error: function(err) {
//             console.error('error on printing: ' + err);
//         }
//     })
// })

const request = require("request");
//https://api.printnode.com/whoami/?DGjrFiPUgRwFrGqlSEJjGntiRj-DHjoqOxXeRX7RV-o:


//computer id:317176
//printer id:69642287
const options = {
  url: 'https://api.printnode.com/printjobs',
  //url: 'https://api.printnode.com/computers/317176/printers/69642287',
  json:true,
  headers: {
    'Authorization': 'Basic REdqckZpUFVnUndGckdxbFNFSmpHbnRpUmotREhqb3FPeFhlUlg3UlYtbw==',
  },
  method:'POST',
  // printerId:'69642287',
  // title:'first title',
  // contentType:'pdf_uri',
  // content:'https://easypost-files.s3-us-west-2.amazonaws.com/files/postage_label/20200815/bbf6eec2a93a475bbcd841777d0dc837.pdf',
  // source:'Comes from EasyPost API'
  body:{
    'printerId': '69642287',
    'title':'first title',
    'contentType':'pdf_uri',
    'content':'https://easypost-files.s3-us-west-2.amazonaws.com/files/postage_label/20200815/bbf6eec2a93a475bbcd841777d0dc837.pdf',
    'source':'Comes from EasyPost API'
  }
};
//base 64 format
//REdqckZpUFVnUndGckdxbFNFSmpHbnRpUmotREhqb3FPeFhlUlg3UlYtbw==

//request.setRequestHeader('Authorization', 'DGjrFiPUgRwFrGqlSEJjGntiRj-DHjoqOxXeRX7RV-o')
request(options, (err, response, body) => {
  console.error('error:', err); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //console.log('body:', JSON.parse(body));
  //let result = JSON.parse(body)
  //console.log(result)
  // console.log("====")
   console.log(body)// Print the HTML for the Google homepage.
})
// const fetch = require("node-fetch")
// request("https://api.printnode.com/whoami", {
//   headers: {
//     Authorization: "DGjrFiPUgRwFrGqlSEJjGntiRj-DHjoqOxXeRX7RV-o"
//   }
// }).then(console.log)


// function authenticate(authData) {
//   console.log(authData);
// }

// function error(err) {
//   console.error(err);
// }

// var ws = new PrintNode.WebSocket(
//   { apiKey: "insert apikey here" },
//   authenticate,
//   error
// );
// ws.subscribe("authenticate", function (authData) {
//   console.log(authData);
// });

// var printer = require("@thiagoelg/node-printer"),
//   imagemagick, // will be loaded later with proper error.
//   fs = require("fs"),
//   filename = "https://easypost-files.s3-us-west-2.amazonaws.com/files/postage_label/20200815/bbf6eec2a93a475bbcd841777d0dc837.pdf",
//   printername = process.argv[2];

// if (process.platform !== "win32") {
//   throw "This application can be run only on win32 as a demo of print PDF image";
// }

// if (!filename) {
//   throw "PDF file name is missing. Please use the following params: <filename> [printername]";
// }

// try {
//   imagemagick = require("imagemagick-native");
// } catch (e) {
//   throw "please install imagemagick-native: `npm install imagemagick-native`";
// }

// var data = fs.readFileSync(filename);

// console.log("data: " + data.toString().substr(0, 20));

// //console.log(imagemagick.identify({srcData: data}));

// // First convert PDF into
// imagemagick.convert(
//   {
//     srcData: data,
//     srcFormat: "PDF",
//     format: "EMF",
//   },
//   function (err, buffer) {
//     if (err) {
//       throw "something went wrong on converting to EMF: " + err;
//     }

//     // Now we have EMF file, send it to printer as EMF format
//     printer.printDirect({
//       data: buffer,
//       type: "EMF",
//       success: function (id) {
//         console.log("printed with id " + id);
//       },
//       error: function (err) {
//         console.error("error on printing: " + err);
//       },
//     });
//   }
// );

// console.log(printer.setJob())
