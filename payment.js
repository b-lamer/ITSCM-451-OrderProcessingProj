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

    const cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    try {
        // Update inventory here
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

        // Clear cart and stored info
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('customerInfo');

        // Redirect to confirmation page
        window.location.href = 'confirmation.html';
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('There was an error processing your order. Please try again.');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', updateOrderSummary);
