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

// Event Listeners
phoneModelSelect.addEventListener('change', updateProductDisplay);
storageSelect.addEventListener('change', updateProductDisplay);
colorSelect.addEventListener('change', updateProductDisplay);
document.getElementById('addToCart').addEventListener('click', addToCart);
document.getElementById('checkout').addEventListener('click', checkout);

// Functions
function updateProductDisplay() {
    const model = phoneModelSelect.value;
    const storage = storageSelect.value;
    const color = colorSelect.value;

    if (model && storage && color) {
        const basePrice = BASE_PRICES[model];
        const storagePrice = STORAGE_PRICES[storage];
        const totalPrice = basePrice + storagePrice;

        selectedProduct.style.display = 'block';
        productIdDisplay.textContent = `${model} ${storage}GB`;
        colorDisplay.textContent = color;
        priceDisplay.textContent = `Total Price: $${totalPrice}`;
        priceBreakdown.innerHTML = `
            Base Price: $${basePrice}<br>
            Storage Upgrade: +$${storagePrice}
        `;
    } else {
        selectedProduct.style.display = 'none';
    }
}

async function checkStock(productId) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.stock > 0;
    } catch (error) {
        console.error('Error checking stock:', error);
        return false;
    }
}

async function addToCart() {
    const model = phoneModelSelect.value;
    const storage = storageSelect.value;
    const color = colorSelect.value;
    const quantity = parseInt(quantityInput.value);

    if (!model || !storage || !color || quantity < 1) {
        showMessage('Please select all options and a valid quantity.', 'error');
        return;
    }

    const productId = `${model}${storage}GB`;
    const inStock = await checkStock(productId);

    if (!inStock) {
        showMessage('Sorry, this product is out of stock.', 'error');
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
}

function checkout() {
    if (cart.length === 0) {
        showMessage('Your cart is empty.', 'error');
        return;
    }
    
    // Implement checkout logic here
    showMessage('Checkout functionality coming soon!', 'success');
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
    setTimeout(() => {
        message.textContent = '';
        message.className = '';
    }, 3000);
}
