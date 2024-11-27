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
document.getElementById('checkout').addEventListener('click', proceedToCheckout);


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

async function checkStock(productId) {
    try {
        // Get current item from DynamoDB to check if it exists and has stock
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 0  // Just checking existence, not updating stock
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data && data.success === true;
    } catch (error) {
        console.error('Error checking stock:', error);
        return false;
    }
}

async function addToCart() {
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
    
    const productExists = await checkStock(productId);
    console.log('Stock check result:', productExists);

    if (!productExists) {
        showMessage(`Sorry, ${model} ${storage}GB is not available.`, 'error');
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

async function proceedToCheckout() {
    if (cart.length === 0) {
        showMessage('Your cart is empty.', 'error');
        return;
    }

    try {
        // Process each item in the cart
        for (const item of cart) {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: item.productId,
                    quantity: item.quantity
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to process ${item.productId}`);
            }

            const data = await response.json();
            if (!data.success) {
                showMessage(`Error: ${data.message}`, 'error');
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
