const moment = require('moment');

module.exports = {
    formatDate: function (date, targetFormat) {
        if (date == null){
            return 'Unavailable';
        }
        else{
            return moment(date).format(targetFormat);
        }
    },

    //radioCheck
    radioCheck: function (value, radioValue){
        if (value != radioValue) {
            return "";
        }
        return 'checked';
    },

    //replaceCommas note : value == string
    replaceCommas: function(value){
        if (value == ''){ // empty string
            return 'None'
        }
        else{
            return value.replace(/,/g,' | ')}
    },

    adminCheck: function(value){
        if (value != null && value.name == 'admin'){
            console.log("Admin Account Detected")
            return true
        }

        else if (value != null) {
            console.log("User Account Detected")
            return false
        }
        else{
            console.log("Not logged in")
            return false
        }
    },

    convertUpper: function(value){
        return value.name.toUpperCase()
    },

    emptyCart: function(userCart){
        for(var ID in userCart) {
            console.log(ID)
            if(userCart.hasOwnProperty(ID))
                return false;
        }
        return true;
    },
    capitaliseFirstLetter: function(string){
        return string.charAt(0).toUpperCase() + string.slice(1);

    },

    cartQty: function (userCart) {
        let totalqty = 0;
        for (z in userCart) {
            let qty = userCart[z].Quantity 
            totalqty = parseInt(totalqty) + parseInt(qty)
        }
        return totalqty;
    },

    isSg:function (country_var) {
        console.log(`The user country is ${country_var}`)
        if (country_var == "Singapore")  {
            return true;
        }

        else {
            return false;
        }
    },

    checkPromo: function(public_coupon_session_obj){
        if (public_coupon_session_obj == null) {
            return false;
        } 

        else {
            return true;
        }
    }


};
