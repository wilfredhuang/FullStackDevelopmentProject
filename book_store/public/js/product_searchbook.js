function getBook() {
    const title = document.getElementById('product_name').value;
    const author = document.getElementById('author');
    const publisher = document.getElementById('publisher');
    const genre = document.getElementById('genre');
    const price = document.getElementById('price');
    const weight = document.getElementById('weight');
    const details = document.getElementById('details');
    const rating = document.getElementById('rating');
    const product_image = document.getElementById('product_image');

    fetch('https://www.googleapis.com/books/v1/volumes?q=' + title + '&maxResults=1&AIzaSyA6Q9oqGie8vr5XgkvlTkhFvufujR2UPOk')
        .then((res) => {
            return res.json();
        })
        .then(book => {
            /*
            console.log(JSON.stringify(book['items'][0], null, 2));
            console.log(JSON.stringify(book['items'][0]['volumeInfo']['title'], null, 2));
            console.log(JSON.stringify(book['items'][0]['volumeInfo']['authors'][0], null, 2));
            console.log(JSON.stringify(book['items'][0]['volumeInfo']['publisher'], null, 2));
            console.log(JSON.stringify(book['items'][0]['volumeInfo']['categories'][0], null, 2));
            console.log(JSON.stringify(book['items'][0]['volumeInfo']['description'], null, 2));
            console.log(JSON.stringify(book['items'][0]['volumeInfo']['pageCount'], null, 2));
            console.log(JSON.stringify(book['items'][0]['saleInfo']['saleability'], null, 2));
            console.log(JSON.stringify(book['items'][0]['volumeInfo']['imageLinks']['thumbnail'], null, 2));
            */
            
            //document.getElementById('product_name').value =JSON.stringify(book['items'][0]['volumeInfo']['title'], null, 2);
            document.getElementById('product_name').value = JSON.stringify(book['items'][0]['volumeInfo']['title'], null, 2).slice(1,JSON.stringify(book['items'][0]['volumeInfo']['title'], null, 2).length-1);
            //author.value = JSON.stringify(book['items'][0]['volumeInfo']['authors'][0], null, 2);
            author.value = JSON.stringify(book['items'][0]['volumeInfo']['authors'][0], null, 2).slice(1,JSON.stringify(book['items'][0]['volumeInfo']['authors'][0], null, 2).length-1);
            //publisher.value = JSON.stringify(book['items'][0]['volumeInfo']['publisher'], null, 2);
            publisher.value = JSON.stringify(book['items'][0]['volumeInfo']['publisher'], null, 2).slice(1,JSON.stringify(book['items'][0]['volumeInfo']['publisher'], null, 2).length-1);
            //genre.value = JSON.stringify(book['items'][0]['volumeInfo']['categories'][0], null, 2);
            genre.value = JSON.stringify(book['items'][0]['volumeInfo']['categories'][0], null, 2).slice(1,JSON.stringify(book['items'][0]['volumeInfo']['categories'][0], null, 2).length-1);
            //weight.value = JSON.stringify(book['items'][0]['volumeInfo']['pageCount'], null, 2);
            weight.value = JSON.parse(book['items'][0]['volumeInfo']['pageCount'])*4.5;
            rating.value = JSON.stringify(book['items'][0]['volumeInfo']['averageRating'], null, 2);
            //details.value = JSON.stringify(book['items'][0]['volumeInfo']['description'], null, 2);
            details.value = JSON.stringify(book['items'][0]['volumeInfo']['description'], null, 2).slice(1,JSON.stringify(book['items'][0]['volumeInfo']['description'], null, 2).length-1);
            if (JSON.stringify(book['items'][0]['saleInfo']['saleability'], null, 2)=='"FOR_SALE"') {
                price.value = JSON.stringify(book['items'][0]['saleInfo']['listPrice']['amount'], null, 2);
            }
            product_image.value = JSON.stringify(book['items'][0]['volumeInfo']['imageLinks']['thumbnail'], null, 2).slice(1,JSON.stringify(book['items'][0]['volumeInfo']['imageLinks']['thumbnail'], null, 2).length-1);
        });
}

//AIzaSyA6Q9oqGie8vr5XgkvlTkhFvufujR2UPOk

function search() {
  // Declare variables
  var input, filter, ul, li, a, i;
  input = document.getElementById("mySearch");
  filter = input.value.toUpperCase();
  ul = document.getElementById("myMenu");
  li = ul.getElementsByTagName("li");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function search_admin() {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}