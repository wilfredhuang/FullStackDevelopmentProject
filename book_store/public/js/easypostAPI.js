const Easypost = require('@easypost/api');
const apiKey = "EZTK29b55ab4ee7a437890e19551520f5dd0uaJjPiW9XsVqXYFNVI0kog";
const api = new Easypost(apiKey);


function searchAddress(){
    var addressId
    addressId = document.getElementById("addressId")
    api.Address.retrieve(addressId).then(console.log);
}

// function checkDeliveryStatus(){
//     var shippingId;
//     shippingId = document.getElementById("deliveryId");
//     shippingId = "dwadadasdasdafaesef"
//     api.Shipment.retrieve(shippingId).then(console.log);
//     document.getElementById("demo").innerHTML = "Hello World";
//     console.log("===================================")
//     console.log(shippingId)
// }