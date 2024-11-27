// Constants
const API_ENDPOINT = 'https://u1gir1ouw7.execute-api.us-east-1.amazonaws.com/prod/check-stock';
const BASE_PRICES = {
    'iPhone': 999,
    'Samsung': 999,
    'Pixel': 899
};
const STORAGE_PRICES = {
    '64': 0,
    '128': 100,
    '256': 200
};

// State
let cart = [];

// DOM Elements
const phoneModelSelect = document.getElementById('phoneModel');
const storageSelect = document.getElementById('storage');
const colorSelect = document.getElementById('color');
const quantityInput = document.getElementById('quantity');
const selectedProduct = document.getElementById('selectedProduct');
const productIdDisplay = document.getElementById('productIdDisplay');
const colorDisplay = document.getElementById('colorDisplay');
const priceDisplay = document.getElementById('priceDisplay');
const priceBreakdown = document.getElementById('priceBreakdown');
const cartItems = document.getElementById('cartItems');
const message = document.getElementById('message');
const STORAGE_KEY = 'phoneShopCart';


function updateProductDisplay() {
    const model = phoneModelSelect.value.split(' ')[0];
    const storage = storageSelect.value.split(' ')[0];
    const color = colorSelect.value;
    
    selectedProduct.style.display = 'block';
    productIdDisplay.textContent = `${model} ${storage}GB`;
    colorDisplay.textContent = color;
    
    const basePrice = BASE_PRICES[model];
    const storagePrice = STORAGE_PRICES[storage];
    const totalPrice = basePrice + storagePrice;
    
    priceDisplay.textContent = `$${totalPrice}`;
    priceBreakdown.textContent = `Base Price: $${basePrice} + Storage Upgrade: $${storagePrice}`;
}

async function checkStock(productId, requestedQuantity, updateInventory = false) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId,
                quantity: updateInventory ? requestedQuantity : 0  // Only send quantity if updating inventory
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const bodyData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        console.log('Parsed response body:', bodyData);
        
        return {
            success: bodyData.success === true,
            currentStock: bodyData.remainingStock || 0,
            message: bodyData.message
        };
    } catch (error) {
        console.error('Error checking stock:', error);
        return {
            success: false,
            currentStock: 0,
            message: 'Error checking stock'
        };
    }
}

async function addToCart() {
    console.log('addToCart function called');
    
    const model = phoneModelSelect.value.split(' ')[0];
    const storage = storageSelect.value.split(' ')[0];
    const color = colorSelect.value;
    const quantity = parseInt(quantityInput.value);

    if (!model || !storage || !color || quantity < 1) {
        showMessage('Please select all options and a valid quantity.', 'error');
        return;
    }

    const productId = `${model}${storage}GB`;
    console.log('Checking stock for product:', productId);
    
    const stockCheck = await checkStock(productId, quantity);
    console.log('Stock check result:', stockCheck);

    // Calculate total requested quantity including what's already in cart
    const existingCartItem = cart.find(item => item.productId === productId);
    const totalRequestedQuantity = (existingCartItem ? existingCartItem.quantity : 0) + quantity;

    // Check if we have enough stock
    if (totalRequestedQuantity > stockCheck.currentStock) {
        showMessage(`Sorry, insufficient stock. Available: ${stockCheck.currentStock}, Requested: ${totalRequestedQuantity}`, 'error');
        return;
    }

    if (!stockCheck.success) {
        showMessage(`Sorry, insufficient stock available. Current stock: ${stockCheck.currentStock}`, 'error');
        return;
    }

    if (existingCartItem) {
        // Update quantity instead of adding new item
        existingCartItem.quantity += quantity;
        existingCartItem.price = (BASE_PRICES[model] + STORAGE_PRICES[storage]) * existingCartItem.quantity;
    } else {
        // Add new item
        const basePrice = BASE_PRICES[model];
        const storagePrice = STORAGE_PRICES[storage];
        const totalPrice = (basePrice + storagePrice) * quantity;

        cart.push({
            productId,
            color,
            quantity,
            price: totalPrice
        });
    }

    updateCartDisplay();
    showMessage('Product added to cart!', 'success');
}

function updateCartDisplay() {
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <p>${item.productId} - ${item.color}</p>
            <p>Quantity: ${item.quantity}</p>
            <p>Price: $${item.price}</p>
        </div>
    `).join('');
    
    // Add this line to save cart
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

async function proceedToCheckout() {
    if (cart.length === 0) {
        showMessage('Your cart is empty.', 'error');
        return;
    }

    try {
        // Process each item in the cart
        for (const item of cart) {
            const stockCheck = await checkStock(item.productId, item.quantity, true); // Set updateInventory to true

            if (!stockCheck.success) {
                showMessage(`Error: ${stockCheck.message}`, 'error');
                return;
            }
        }

        // If all items processed successfully, proceed to checkout page
        window.location.href = 'checkout.html';
        
    } catch (error) {
        console.error('Checkout error:', error);
        showMessage('Error processing checkout. Please try again.', 'error');
    }
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
    setTimeout(() => {
        message.textContent = '';
        message.className = '';
    }, 3000);
}

function initializeEventListeners() {
    // Remove existing listeners first
    phoneModelSelect.removeEventListener('change', updateProductDisplay);
    storageSelect.removeEventListener('change', updateProductDisplay);
    colorSelect.removeEventListener('change', updateProductDisplay);
    const addToCartButton = document.getElementById('addToCart');
    const checkoutButton = document.getElementById('checkout');
    
    // Clear existing click listeners
    if (addToCartButton) {
        const newAddToCartButton = addToCartButton.cloneNode(true);
        addToCartButton.parentNode.replaceChild(newAddToCartButton, addToCartButton);
        newAddToCartButton.addEventListener('click', addToCart);
    }
    
    if (checkoutButton) {
        const newCheckoutButton = checkoutButton.cloneNode(true);
        checkoutButton.parentNode.replaceChild(newCheckoutButton, checkoutButton);
        newCheckoutButton.addEventListener('click', proceedToCheckout);
    }

    // Add new listeners
    phoneModelSelect.addEventListener('change', updateProductDisplay);
    storageSelect.addEventListener('change', updateProductDisplay);
    colorSelect.addEventListener('change', updateProductDisplay);
}

document.addEventListener('DOMContentLoaded', initializeEventListeners);
