// Load cart data from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let customerInfo = {};

// Display order summary
// At the start of checkout.js
function updateOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('phoneShopCart')) || [];
    const summaryItems = document.getElementById('summaryItems');
    const summaryTotal = document.getElementById('summaryTotal');
    let total = 0;

    // Clear existing content
    summaryItems.innerHTML = '';

    // Add each cart item
    cart.forEach(item => {
        total += item.price;
        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        itemElement.innerHTML = `
            <p>${item.productId} - ${item.color}</p>
            <p>Quantity: ${item.quantity}</p>
            <p>$${item.price}</p>
        `;
        summaryItems.appendChild(itemElement);
    });

    // Update total
    summaryTotal.textContent = `$${total}`;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateOrderSummary();
});

// Handle form submission
function proceedToPayment() {
    const form = document.getElementById('customerInfoForm');
    const formData = new FormData(form);
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Store customer information
    customerInfo = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode')
    };

    // Save to localStorage
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo));

    // Proceed to payment page
    window.location.href = 'payment.html';
}

// Initialize page
// In checkout.js
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('phoneShopCart')) || [];
    
    // Update order summary with cart items
    updateOrderSummary();
    
    // Pre-fill form if returning from payment page
    const savedInfo = localStorage.getItem('customerInfo');
    if (savedInfo) {
        const info = JSON.parse(savedInfo);
        Object.keys(info).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = info[key];
            }
        });
    }
});
