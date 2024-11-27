// Constants
const API_ENDPOINT = 'https://u1gir1ouw7.execute-api.us-east-1.amazonaws.com/prod/check-stock';

// Load cart and customer data from localStorage
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

function togglePaymentFields() {
    const method = document.getElementById('paymentMethod').value;
    const cardFields = document.getElementById('cardFields');
    const paypalFields = document.getElementById('paypalFields');

    cardFields.style.display = (method === 'credit' || method === 'debit') ? 'block' : 'none';
    paypalFields.style.display = method === 'paypal' ? 'block' : 'none';
}

async function processPayment() {
    const form = document.getElementById('paymentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const method = document.getElementById('paymentMethod').value;
    let paymentInfo = {
        method: method
    };

    // Collect payment details based on method
    if (method === 'credit' || method === 'debit') {
        paymentInfo = {
            ...paymentInfo,
            cardNumber: document.getElementById('cardNumber').value,
            expiryDate: document.getElementById('expiryDate').value,
            cvv: document.getElementById('cvv').value
        };
    } else if (method === 'paypal') {
        paymentInfo = {
            ...paymentInfo,
            paypalEmail: document.getElementById('paypalEmail').value
        };
    }

    const cart = JSON.parse(localStorage.getItem('phoneShopCart')) || [];
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo')) || {};

    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    try {
        // Process each item in cart
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
            const bodyData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
            
            if (!bodyData.success) {
                throw new Error(bodyData.message || 'Failed to update inventory');
            }
        }

        // Create final order object
        const order = {
            customerInfo,
            cart,
            paymentInfo,
            orderDate: new Date().toISOString(),
            orderStatus: 'completed'
        };

        console.log('Order processed:', order);

        // Clear cart and stored info after successful processing
        localStorage.removeItem('phoneShopCart');
        localStorage.removeItem('customerInfo');

        // Redirect to confirmation
        window.location.href = 'confirmation.html';
    } catch (error) {
        console.error('Payment processing error:', error);
        alert('There was an error processing your payment. Please try again.');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    updateOrderSummary();
    const paymentMethodSelect = document.getElementById('paymentMethod');
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', togglePaymentFields);
    }
});
