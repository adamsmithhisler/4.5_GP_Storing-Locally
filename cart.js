
/*
    Author: Adam Smithhisler
    Date: 11/1/2026
    Purpose: SDC260 Assignment 4.5 - Storing Locally.
    Manage shopping cart display, calculate totals,
    synchronize the reservation timer, restore stock
    when reservations expire, and return to the storefront.
*/

/* =========================================
   CART PAGE SCRIPT

   This file manages:
   - Cart rendering
   - Timer synchronization
   - Timer visibility
   - Stock restoration
   - Page redirection
========================================= */


/* =========================================
   LOAD DATA FROM LOCAL STORAGE
========================================= */

// Stored cart items from shopping page
const cart = JSON.parse(localStorage.getItem("cart")) || [];

// Product inventory with stock values
const products = JSON.parse(localStorage.getItem("products")) || [];

// Cart expiration timestamp (milliseconds)
let cartEndTime = localStorage.getItem("cartEndTime");


/* =========================================
   DOM REFERENCES
========================================= */

// Cart item container
const cartItems = document.getElementById("cart-items");

// Total price display
const cartTotal = document.getElementById("cart-total");

// Countdown timer display
const countdown = document.getElementById("countdown");

// Timer section visibility
const timerSection = countdown.closest(".timer-section");


/* =========================================
   RENDER CART CONTENTS
========================================= */

// STEP 12

function displayCart() {

    // Clear previous cart content
    cartItems.innerHTML = "";

    // Check whether the cart is empty
    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p>Your shopping cart is empty.</p>
        `;

        cartTotal.textContent = "Total: $0.00";
        return;
    }

    // Create variable for total price
    let total = 0;

    // Loop through each reserved product
    cart.forEach((item) => {

        // Add product price to the running total
        total += item.price;

        // Create a cart item element
        const cartItem = document.createElement("article");
        cartItem.classList.add("cart-item");

        // Display product information
        cartItem.innerHTML = `
            <div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
            </div>

            <div>
                <p>$${item.price.toFixed(2)}</p>
            </div>
        `;

        // Add product to the cart display
        cartItems.appendChild(cartItem);
    });

    // Display the final cart total
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}


/* =========================================
   EXPIRE CART SESSION
========================================= */

// STEP 13

function expireCart() {

    // Restore reserved items to available inventory
    cart.forEach((item) => {

        // Find matching product in inventory
        const product = products.find(
            (p) => p.id === item.id
        );

        // Return one item to stock
        if (product) {
            product.stock++;
        }
    });

    // Save restored inventory to local storage
    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    // Clear shopping cart and expiration time
    localStorage.removeItem("cart");
    localStorage.removeItem("cartEndTime");

    // Clear local cart array
    cart.length = 0;

    // Reset timer variable
    cartEndTime = null;

    // Update cart display
    displayCart();

    // Reset countdown
    countdown.textContent = "15:00";

    // Hide timer after expiration
    timerSection.style.display = "none";

    // Notify the customer
    alert(
        "Your item reservations have ended. " +
        "Stock availability may have changed."
    );

    // Return to the storefront
    window.location.href = "index.html";
}


/* =========================================
   SYNCHRONIZE TIMER TO REAL-TIME
========================================= */

function updateTimer() {

    // Hide timer when no active reservation exists
    if (!cartEndTime || cart.length === 0) {

        timerSection.style.display = "none";
        countdown.textContent = "15:00";

        return;
    }

    // Calculate remaining reservation time
    const remaining = Number(cartEndTime) - Date.now();

    // If time has expired, trigger cleanup
    if (remaining <= 0) {

        expireCart();
        return;
    }

    // Show timer when reservation is active
    timerSection.style.display = "flex";

    // Convert milliseconds into minutes and seconds
    const minutes = Math.floor(remaining / 1000 / 60);
    const seconds = Math.floor((remaining / 1000) % 60);

    // Format and display remaining time
    countdown.textContent =
        `${minutes}:${seconds.toString().padStart(2, "0")}`;
}


/* =========================================
   INITIALIZATION
========================================= */

// Render cart on page load
displayCart();

// Initialize timer display and visibility
updateTimer();

// Update countdown every second
setInterval(updateTimer, 1000);
