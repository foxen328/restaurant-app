import { menuArray } from './data.js';

const menuContainer = document.getElementById('menu-container');
const notificationContainer = document.getElementById('notification-container');
const cartPreviewModal = document.getElementById('cart-preview-modal');
const cartItemsContainer = document.getElementById('cart-items-container');
const closeModal = document.querySelector('.close');
const paymentForm = document.getElementById('payment-form');

const menuList = menuArray.map(menuItem => {
  return `
        <div class="menu-item" data-id="${menuItem.id}" data-price="${menuItem.price}">
          <span style="font-size: 2em; margin-right: 10px;">${menuItem.emoji}</span>
          <div class="menu-item-content">
            <h3>${menuItem.name}</h3>
            <p>${menuItem.ingredients.join(', ')}</p>
            <p><strong>$${menuItem.price}</strong></p>
          </div>
          <button class="add-button" aria-label="Add ${menuItem.name} to cart">+</button>
          <button class="remove-button" aria-label="Remove ${menuItem.name} from cart">-</button>
        </div>`;
}).join('');

menuContainer.innerHTML = menuList;

let totalPrice = 0;
let cart = [];

// Function to show notifications
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;
  notificationContainer.appendChild(notification);

  // Show the notification
  requestAnimationFrame(() => {
    notification.classList.add('show');
  });

  // Hide the notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    notification.addEventListener('transitionend', () => {
      notificationContainer.removeChild(notification);
    });
  }, 3000);
}

// Function to update the cart items in the modal
function updateCartItems() {
  cartItemsContainer.innerHTML = '';

  // Group items by their ID and count their quantity
  const groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.id]) {
      acc[item.id] = { ...item, quantity: 0 };
    }
    acc[item.id].quantity += 1;
    return acc;
  }, {});

  // Display grouped items
  Object.values(groupedCart).forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <p>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>
      <button class="remove-cart-item" data-id="${item.id}">Remove</button>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  document.querySelectorAll('.remove-cart-item').forEach(button => {
    button.addEventListener('click', (event) => {
      const itemId = event.target.getAttribute('data-id');
      const itemIndex = cart.findIndex(cartItem => cartItem.id == itemId);
      if (itemIndex > -1) {
        totalPrice -= cart[itemIndex].price;
        cart.splice(itemIndex, 1);
        document.getElementById('total-price').innerText = totalPrice.toFixed(2);
        showNotification(`Removed item from cart!`);
        updateCartItems();
      }

      if (cart.length === 0) {
        document.getElementById('total-price-container').style.display = 'none';
        cartPreviewModal.style.display = 'none';
      }
    });
  });
}

// Add items to cart
document.querySelectorAll('.add-button').forEach(button => {
  button.addEventListener('click', (event) => {
    const menuItemElement = event.target.closest('.menu-item');
    const itemId = menuItemElement.getAttribute('data-id');
    const itemPrice = parseFloat(menuItemElement.getAttribute('data-price'));

    totalPrice += itemPrice;
    document.getElementById('total-price').innerText = totalPrice.toFixed(2);

    // Add item to cart
    const item = menuArray.find(menuItem => menuItem.id == itemId);
    cart.push(item);

    // Show total price container if it’s not already displayed
    document.getElementById('total-price-container').style.display = 'block';
    showNotification(`Added ${item.name} to cart!`);
  });
});

// Remove items from cart
document.querySelectorAll('.remove-button').forEach(button => {
  button.addEventListener('click', (event) => {
    const menuItemElement = event.target.closest('.menu-item');
    const itemId = menuItemElement.getAttribute('data-id');
    const itemPrice = parseFloat(menuItemElement.getAttribute('data-price'));

    const itemIndex = cart.findIndex(cartItem => cartItem.id == itemId);
    if (itemIndex > -1) {
      cart.splice(itemIndex, 1);
      totalPrice -= itemPrice;
      document.getElementById('total-price').innerText = totalPrice.toFixed(2);

      showNotification(`Removed ${menuArray.find(menuItem => menuItem.id == itemId).name} from cart!`);
    }

    if (cart.length === 0) {
      document.getElementById('total-price-container').style.display = 'none';
    }
  });
});

// Clear cart
document.getElementById('clear-cart').addEventListener('click', () => {
  cart = [];
  totalPrice = 0;
  document.getElementById('total-price').innerText = totalPrice.toFixed(2);
  document.getElementById('total-price-container').style.display = 'none';
  showNotification('Cart cleared!');
});

// Checkout
document.getElementById('checkout').addEventListener('click', () => {
  if (cart.length > 0) {
    cartPreviewModal.style.display = 'block';
    updateCartItems();
  } else {
    showNotification('Your cart is empty. Please add items to checkout.');
  }
});

// Initialize flatpickr for the expiry date
flatpickr("#expiry-date", {
  plugins: [
    new monthSelectPlugin({
      shorthand: true, // display the full month name
      dateFormat: "m/Y", // format the date
    })
  ]
});

// Handle payment form submission
paymentForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent the form from actually submitting

  const cardName = document.getElementById('card-name').value;
  const cardNumber = document.getElementById('card-number').value;
  const expiryDate = document.getElementById('expiry-date').value;
  const cvc = document.getElementById('cvc').value;

  // You can add validation logic here if needed

  const checkoutMessage = `Thanks for your order, ${cardName}! Your total is $${totalPrice.toFixed(2)}.`;
  showNotification(checkoutMessage);

  // Clear the cart and close the modal
  cart = [];
  totalPrice = 0;
  document.getElementById('total-price').innerText = totalPrice.toFixed(2);
  document.getElementById('total-price-container').style.display = 'none';
  cartPreviewModal.style.display = 'none';
});

// Close modal
closeModal.addEventListener('click', () => {
  cartPreviewModal.style.display = 'none';
});

// Close modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
  if (event.target == cartPreviewModal) {
    cartPreviewModal.style.display = 'none';
  }
});
