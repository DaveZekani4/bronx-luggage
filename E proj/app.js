//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");


// cart 
let cart = [];
//buttons
let buttonsDOM =[];

// getting the products
class Products{
  async getProducts(){
      try{
          let result = await fetch("../Bronx.json");
          let data = await result.json();
          let products = data.for_women;
           products = products.map(item => {
            const { id, name, description, price, color, brand, category, image_url } = item;
            return { id, name, description, price, color, brand, category, image_url };
          });
          return products;
        } catch (error) {
          console.log(error);
        }
          

          fetch('../Bronx.json')
          .then(
            function(response) {
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                  response.status);
                return;
              }
        
              // Examine the text in the response
              response.json().then(function(data) {
                console.log(data);
              });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });



      }
      
   }

//display product
class UI{
   displayProducts(products){
   let result ="";
   if (!products.length) {
    productsDOM.innerHTML = "<p>No products</p>";
    return
  }
   products.forEach(product => {
     result += `
     <article class="product">
               <div class="img-container">
                   <img src=${product.image_url} alt="product" class="product-img">
                   <button class="bag-btn" data-id=${product.id}>
                       <i class="fas fa-shopping-cart"></i>
                       add to cart
                   </button>
               </div> 
               <h3>${product.name}</h3>
               <p>${product.description}</p>
               <h4>$${product.price}</h4>

      </article>  
     ` ; 
   }); 
 productsDOM.innerHTML = result;
   }
   getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "In cart";
        button.disabled = true;
      }

      button.addEventListener('click', (event) => {
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        event.target.innerText = "In cart";
        event.target.disabled = true;
        //add product to the cart
        cart = [...cart, cartItem];
        //save cart in local storage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        //display cart item
        this.addCardItem(cartItem);
        //show the cart
        this.showCart();

      });

    });

  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    })
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    //console.log(cartTotal,cartItems);
  }
  addCardItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = ` <img src=${item.image_url} alt="product"> 
                      <div>
                          <h4>${item.name}</h4>
                          <h5>$${item.price}</h5>
                          <span class="remove-item" data-id=${item.id}>remove</span>
                      </div>
                      <div>
                          <i class="fas fa-chevron-up" data-id=${item.id}></i>
                          <p class="item-amount">${item.amount}</p>
                          <i class="fas fa-chevron-down" data-id=${item.id}></i>
                      </div> `;
    cartContent.appendChild(div);

  }
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populateCart(cart) {
    cart.forEach(item => this.addCardItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }
  cartLogic() {
    //clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    //cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    console.log(cartContent.children);
    while (cartContent.children.lenght > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class= "fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}
//local storage 
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
  }
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
  }
}

class Filter {
  // constructor(products) {
  //   this.products = products
  // }

  filterByMaximumPrice(products, price) {
    return products.filter(item => +item.price <= price)
  }

  filterByColor(products, color) {
    return products.filter(item => item.color === color)
  }

  filterByCategory(products, category) {
    return products.filter(item => item.category === category)
  }

  filterById(products, id) {
    return products.filter(item => item.id === id)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const filter = new Filter()
  const products = new Products();
  const categories = document.querySelectorAll("[data-category]")
  
  //setup app
  ui.setupApp();
  //get all products
  let allProducts = null
  products.getProducts().then(products => {
    allProducts = products
    ui.displayProducts(products)
    Storage.saveProducts(products);
  }).then(() => {
    ui.getBagButtons();
    ui.cartLogic();
  });



  const form = document.querySelector("form")
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    let result = []


    const price = form.querySelector("[name=price-filter]").value
    // const id = form.querySelector("[name=id-filter]").value 
    const color = form.querySelector("[name=color-filter]").value

    let filteredOnes = result.length ? result : allProducts

    if (price) {
      result = filter.filterByMaximumPrice(filteredOnes, price)
    }

    if (color) {
      result = filter.filterByColor(filteredOnes, color)
    }

    // console.log(result)

    ui.displayProducts(result)
    ui.getBagButtons()
    ui.cartLogic()
  })

  categories.forEach(categoryBtn => {
    categoryBtn.addEventListener('click', event => {
      event.preventDefault()
   
console.log(categoryBtn.dataset);
      ui.displayProducts(filter.filterByCategory(allProducts, categoryBtn.dataset.category))
      ui.getBagButtons()
      ui.cartLogic()
    })
  })

});




