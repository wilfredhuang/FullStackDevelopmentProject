// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
var stripe123 = Stripe('pk_test_Ef7sYvL8k3tWVTxjADPpT4T700HuZCROoX');
var elements = stripe123.elements();

function myFoo() {
  alert(document.getElementById('test123').value)
}

function confirmStripe(card) { 
  console.log(card)
  alert(card)
  alert(document.getElementById('submit').value)
  stripe123.confirmCardPayment(document.getElementById('submit').value, {
  payment_method: {
    card: card,
    billing_details: {
      name: 'Jenny Rosen'
    }
  }
})
.then(function(result) {
  // Handle result.error or result.paymentIntent
  console.log("FOOBAR " + result)
.catch(()=> {
  console.log("Confirm Card Payment went Wrong!")
})
});

}

