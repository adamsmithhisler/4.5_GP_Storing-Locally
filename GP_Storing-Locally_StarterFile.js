
/*
    Author: Adam Smithhisler
    Date: 11/1/2026
    Purpose: SDC260 Assignment 4.5 - Storing Locally.
    Display glass artwork, manage product inventory,
    save shopping cart information using localStorage,
    and maintain a 15-minute reservation timer.
*/

/* =========================================
   PRODUCT DATA
========================================= */

// STEP 3

const defaultProducts = [
    {
        id: 1,
        name: "Aurora Vase",
        price: 95,
        stock: 4,
        image: "images/AuroraVase.png",
        description: "Hand-blown glass vase with swirling aurora colors."
    },
    {
        id: 2,
        name: "Ember Bowl",
        price: 75,
        stock: 3,
        image: "images/EmberBowl.png",
        description: "Decorative fire-inspired centerpiece bowl."
    },
    {
        id: 3,
        name: "Crystal Wave",
        price: 120,
        stock: 2,
        image: "images/CrystalWave.png",
        description: "Ocean-inspired sculpture with flowing glass curves."
    },
    {
        id: 4,
        name: "Solar Lantern",
        price: 60,
        stock: 5,
        image: "images/SolarLantern.png",
        description: "Handcrafted lantern with warm glowing tones."
    },
    {
        id: 5,
        name: "Frost Pendant",
        price: 45,
        stock: 1,
        image: "images/FrostPendant.png",
        description: "Elegant frozen-glass pendant artwork."
    },
    {
        id: 6,
        name: "Nebula Orb",
        price: 140,
        stock: 0,
        image: "images/NebulaOrb.png",
        description: "Galaxy-inspired decorative glass orb."
    },
    {
        id: 7,
        name: "Ocean Swirl Glass Vase",
        price: 59.99,
        stock: 6,
        image: "images/ocean-vase.png",
        description: "Hand-blown decorative vase with flowing blue, turquoise, and white glass patterns."
    },
    {
        id: 8,
        name: "Sunset Glow Glass Ornament",
        price: 24.99,
        stock: 12,
        image: "images/sunset-ornament.png",
        description: "Handcrafted hanging glass ornament featuring warm amber, orange, and red colors."
    },
    {
        id: 9,
        name: "Botanical Glass Paperweight",
        price: 34.99,
        stock: 8,
        image: "images/botanical-paperweight.png",
        description: "Solid glass paperweight with a delicate floral design suspended inside clear glass."
    }
];

/* =========================================
   LOCAL STORAGE SETUP
========================================= */

// STEP 4

let products =
    JSON.parse(localStorage.getItem("products")) || defaultProducts;

let cart =
    JSON.parse(localStorage.getItem("cart")) || [];

let cartEndTime =
    localStorage.getItem("cartEndTime") || null;

/* =========================================
   DOM REFERENCES
========================================= */

const productGrid = document.getElementById("product-grid");
const cartCount = document.getElementById("cart-count");
const countdown = document.getElementById("countdown");
const notification = document.getElementById("notification");
const cartButton = document.getElementById("cart-button");

// Reference to the timer section for visibility control.
const timerSection = countdown.closest(".timer-section");

/* =========================================
   CART NAVIGATION
========================================= */

// STEP 5

if (cartButton) {

    // Open cart page when clicked.
    cartButton.addEventListener("click", () => {
        window.location.href = "cart.html";
    });

    // Allow keyboard navigation.
    cartButton.addEventListener("keydown", e => {

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.location.href = "cart.html";
        }

    });
}

/* =========================================
   CREATE TOOLTIP ELEMENT
========================================= */

// STEP 6

const tooltip = document.createElement("div");

tooltip.classList.add("mouse-tooltip");
tooltip.textContent = "OUT OF STOCK";

document.body.appendChild(tooltip);

/* =========================================
   DISPLAY PRODUCTS
========================================= */

// STEP 7

function displayProducts() {

    // Clear existing products before rebuilding the grid.
    productGrid.innerHTML = "";

    products.forEach(product => {

        // Create a product card.
        const card = document.createElement("article");
        card.classList.add("product-card");

        // Mark unavailable products.
        if (product.stock === 0) {

            card.classList.add("out-of-stock");

            // Show tooltip while moving over unavailable items.
            card.addEventListener("mousemove", event => {

                tooltip.style.left = `${event.clientX}px`;
                tooltip.style.top = `${event.clientY}px`;

                tooltip.classList.add("show");
            });

            // Hide tooltip when leaving the product.
            card.addEventListener("mouseleave", () => {

                tooltip.classList.remove("show");
            });
        }

        // Display product image, details, stock, and button.
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">

            <section class="product-content">

                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <p>$${product.price.toFixed(2)}</p>

                <p class="stock">
                    Available: ${product.stock}
                </p>

                <button
                    ${product.stock === 0 ? "disabled" : ""}
                    onclick="addToCart(${product.id})"
                    aria-label="Add ${product.name} to cart">

                    Add To Cart
                </button>

            </section>
        `;

        // Add the finished card to the product grid.
        productGrid.appendChild(card);
    });
}

/* =========================================
   ADD TO CART
========================================= */

// STEP 8

function addToCart(id) {

    // Locate the selected product.
    const product = products.find(p => p.id === id);

    // Prevent unavailable products from being added.
    if (!product || product.stock <= 0) {
        return;
    }

    // Reserve one item from inventory.
    product.stock--;

    // Add reserved item to the cart.
    cart.push({ ...product });

    // Save updated inventory and cart.
    saveData();

    // Start timer if this is the first reservation.
    startTimer();

    // Show timer immediately after adding a product.
    updateTimer();

    // Refresh the storefront and cart count.
    displayProducts();
    displayCart();

    // Display the Add to Cart notification.
    showNotification();
}

/* =========================================
   UPDATE CART COUNT
========================================= */

function displayCart() {

    cartCount.textContent = cart.length;
}

/* =========================================
   SAVE DATA
========================================= */

// STEP 9

function saveData() {

    // Store inventory changes.
    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    // Store reserved cart items.
    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    // Store reservation expiration if active.
    if (cartEndTime) {

        localStorage.setItem(
            "cartEndTime",
            cartEndTime
        );
    }
}

/* =========================================
   NOTIFICATION
========================================= */

function showNotification() {

    notification.classList.add("show");

    setTimeout(() => {

        notification.classList.remove("show");

    }, 1500);
}

/* =========================================
   TIMER LOGIC
========================================= */

// STEP 10

function startTimer() {

    // Only create a new timer if none exists.
    if (!cartEndTime) {

        // Current time plus 15 minutes.
        cartEndTime = Date.now() + 15 * 60 * 1000;

        // Save timer expiration.
        localStorage.setItem(
            "cartEndTime",
            cartEndTime
        );
    }
}

function updateTimer() {

    // Check that the timer display exists.
    if (!countdown) {
        return;
    }

    // Hide timer when there is no active reservation.
    if (!cartEndTime || cart.length === 0) {

        timerSection.style.display = "none";

        countdown.textContent = "15:00";

        return;
    }

    // Calculate how much reservation time remains.
    const remaining = Number(cartEndTime) - Date.now();

    // Expire the reservation when time runs out.
    if (remaining <= 0) {

        clearCart();

        return;
    }

    // Show the timer when a reservation is active.
    timerSection.style.display = "flex";

    // Calculate minutes and seconds.
    const minutes = Math.floor(remaining / 1000 / 60);

    const seconds = Math.floor((remaining / 1000) % 60);

    // Update the displayed countdown.
    countdown.textContent =
        `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/* =========================================
   CLEAR CART
========================================= */

// STEP 11

function clearCart() {

    // Restore reserved items to product inventory.
    cart.forEach(item => {

        const product = products.find(
            p => p.id === item.id
        );

        if (product) {

            product.stock++;
        }
    });

    // Clear the shopping cart.
    cart = [];

    // Clear the reservation expiration.
    cartEndTime = null;

    // Remove expired reservation data.
    localStorage.removeItem("cart");
    localStorage.removeItem("cartEndTime");

    // Save restored stock quantities.
    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    // Refresh visible products and cart count.
    displayProducts();
    displayCart();

    // Reset timer text.
    countdown.textContent = "15:00";

    // Hide timer because no reservation remains.
    timerSection.style.display = "none";

    // Notify the user.
    alert(
        "Your item reservations have ended. " +
        "Stock availability may have changed."
    );
}

/* =========================================
   INITIALIZATION
========================================= */

// Display glass products.
displayProducts();

// Restore cart count if items were previously reserved.
displayCart();

// Show timer only if a reservation exists.
updateTimer();

// Update countdown every second.
setInterval(updateTimer, 1000);
