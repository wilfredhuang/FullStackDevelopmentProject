// Detects a need to update the cart when quantity is changed

function update(id, qty) {
    document.getElementById("checkoutButton").value = "Update";
    $("#" + id).attr("value", qty)
    // $("#checkoutButton").attr("value", "100");
    // $("checkoutButton").attr(id, quantity);
}

function autofill() {
    document.getElementById('product_name').value = "ads";
    document.getElementById('product_image').value = "foobar";
}
// Determine if checkout Button needed to update or checkout.
// No more need, replacement function in route js

// function checkout() {
//     if (document.getElementById("checkoutButton").value == "Update") {
//         window.location.href= '/checkout/cart'
//     }

//     else {
//         window.location.href = '/checkout/checkout123';
//     }
// }