// Load cart and customer data from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let customerInfo = JSON.parse(localStorage.getItem('customerInfo')) || {};

function togglePaymentFields() {
    const method = document.getElementById('paymentMethod').value;
    const cardFields = document.getElementById('cardFields');
    const paypalFields = document.getElementById('paypalFields');

    cardFields.style.display = (method === 'credit' || method === 'debit') ? 'block' : 'none';
    paypalFields.style.display = method === 'paypal' ? 'block' : 'none';
}

function updateOrderSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const summaryTotal = document.getElementById('summaryTotal');
    let total = 0;

    summaryItems.innerHTML = cart.map(item => {
        total += item.price;
        return `
            <div class="summary-item">
                <p>${item.productId} - ${item.color}</p>
                <p>Quantity: ${item.quantity}</p>
                <p>$${item.price}</p>
            </div>
        `;
    }).join('');

    summaryTotal.textContent = `$${total}`;
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

    // Create final order object
    const order = {
        customerInfo,
        cart,
        paymentInfo,
        orderDate: new Date().toISOString(),
        orderStatus: 'pending'
    };

    try {
        // Here you would typically send the order to your backend
        console.log('Order processed:', order);
        
        // Clear cart and stored info
        localStorage.removeItem('cart');
        localStorage.removeItem('customerInfo');

        // Redirect to confirmation page
        window.location.href = 'confirmation.html';
    } catch (error) {
        console.error('Error processing order:', error);
        alert('There was an error processing your order. Please try again.');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', updateOrderSummary);
