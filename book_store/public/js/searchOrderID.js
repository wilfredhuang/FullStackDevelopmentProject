function searchOrderFunction() {
    var input, filter, table, tr, td, i, txtValue;

    // Declare variables
    input = document.getElementById("searchOrderInput");
    filter = input.value.toUpperCase();
    //card = document.getElementById("card")
    //table = document.getElementById("orderTable");
    //tr = table.getElementsByTagName("tr");
    //eachCard = document.getElementById("eachCard");
    cardContainer = document.getElementById("myItems");
    cards = cardContainer.getElementsByClassName("card");
     // Loop through all table rows, and hide those who don't match the search query

     for (i = 0; i < cards.length; i++) {
        title = cards[i].querySelector(".card-body h5.card-title");
        if (title.innerText.toUpperCase().indexOf(filter) > -1) {
            cards[i].style.display = "";
        } else {
            cards[i].style.display = "";
        }
    }
     
    // for (i = 0; i < tr.length; i++) {
    //     td = tr[i].getElementsByTagName("td")[0];
    //     if (td) {
    //         txtValue = td.textContent || td.innerText;
    //         if (txtValue.toUpperCase().indexOf(filter) > -1) {
    //             tr[i].style.display = "";
    //         } else {
    //             tr[i].style.display = "none";
    //         }
    //     }
    // }
}