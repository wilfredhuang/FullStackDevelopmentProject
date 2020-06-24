const EasyPost = require("@easypost/api");

const apiKey = "EZTK29b55ab4ee7a437890e19551520f5dd0uaJjPiW9XsVqXYFNVI0kog";

const api = new EasyPost(apiKey);

// set addresses
/*
const toAddress = new api.Address({
  name: "Dr. Steve Brule",
  street1: "179 N Harbor Dr",
  city: "Redondo Beach",
  state: "CA",
  zip: "90277",
  country: "US",
  phone: "310-808-5243",
});*/

//Test retrive information


//const webhook = new api.Webhook({ url: 'http://example.com' });

//webhook.save().then(console.log);

api.Address.retrieve('adr_a829cf7045d140eb95c917b01f1b2ae8').then(address => {
  console.log(address.id);
}).catch(console.log);
//api.Address.retrieve('adr_a829cf7045d140eb95c917b01f1b2ae8').then(console.log);

//api.Tracker.retrieve('trk_afeda88a6f934290b7dcb4bf1e2445b9').then(console.log);

/*
toAddress.save().then((addr) => {
  // verifiableAddress is updated, and also passed into
  // the promise resolve.
  console.log(addr.street1);
  // 417 Montgomery Street

  console.log(addr.verifications);/*
  /*
  { delivery:
   { success: true,
     errors: [],
       } }
     */
//});
/*
const fromAddress = new api.Address({
  name: "EasyPost",
  street1: "118 2nd Street",
  street2: "4th Floor",
  city: "San Francisco",
  state: "CA",
  zip: "94105",
  phone: "415-123-4567",
});

fromAddress.save().then(console.log);
*/
/* es5 with promises: 
fromAddress.save().then((addr) => {
  console.log(addr.id);
}); */

/* es2017 with async/await: */
/*await fromAddress.save();
console.log(fromAddress.id);
*/
/*
const parcel = new api.Parcel({
  length: 9,
  width: 6,
  height: 2,
  weight: 10,
});

parcel.save().then(console.log);
const shipment = new api.Shipment({
  to_address: toAddress,
  from_address: fromAddress,
  parcel: parcel,
});

shipment.save().then(console.log);

// If you already have a saved shipment, or a shipment initialized
// with an id:

shipment.buy(shipment.lowestRate(["USPS"], ["First"])).then(console.log);

// or

shipment.buy("{RATE_ID}").then(console.log);

// If you do not have a saved shipment yet, you must save it first:
shipment
  .save()
  .then((s) =>
    s.buy(shipment.lowestRate(["USPS"], ["First"])).then(console.log)
  );
*/