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

// Event Listeners
phoneModelSelect.addEventListener('change', updateProductDisplay);
storageSelect.addEventListener('change', updateProductDisplay);
colorSelect.addEventListener('change', updateProductDisplay);
document.getElementById('addToCart').addEventListener('click', addToCart);
document.getElementById('checkout').addEventListener('click', checkout);

async function checkStock(productId) {
    try {
        console.log('Checking stock for:', productId);
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId
            })
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Stock check response:', data);
        
        // Return true if stock exists and is greater than 0
        return data && data.Stock > 0; // Changed from data.stock to data.Stock to match DynamoDB attribute
    } catch (error) {
        console.error('Error checking stock:', error);
        return false;
    }
}

async function addToCart() {
    const model = phoneModelSelect.value.split(' ')[0]; // Gets just "Samsung" from "Samsung ($999)"
    const storage = storageSelect.value.split(' ')[0]; // Gets just "64" from "64 GB (Included)"
    const color = colorSelect.value;
    const quantity = parseInt(quantityInput.value);

    if (!model || !storage || !color || quantity < 1) {
        showMessage('Please select all options and a valid quantity.', 'error');
        return;
    }

    // Format ProductID to match DynamoDB format (e.g., "Samsung64GB")
    const productId = `${model}${storage}GB`;
    console.log('Checking stock for product:', productId); // Add this for debugging
    
    const inStock = await checkStock(productId);
    console.log('Stock check result:', inStock); // Add this for debugging

    if (!inStock) {
        showMessage(`Sorry, ${model} ${storage}GB is out of stock.`, 'error');
        return;
    }

    const basePrice = BASE_PRICES[model];
    const storagePrice = STORAGE_PRICES[storage];
    const totalPrice = (basePrice + storagePrice) * quantity;

    cart.push({
        productId,
        color,
        quantity,
        price: totalPrice
    });

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

function proceedToCheckout() {
    if (cart.length === 0) {
        showMessage('Your cart is empty.', 'error');
        return;
    }
    
    window.location.href = 'checkout.html';
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
    setTimeout(() => {
        message.textContent = '';
        message.className = '';
    }, 3000);
}
