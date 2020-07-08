const moment = require('moment');


module.exports = {
    formatDate: function (date, targetFormat) {
        return moment(date).format(targetFormat);
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
    }
};