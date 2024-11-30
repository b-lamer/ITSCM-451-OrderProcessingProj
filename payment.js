// Constants
const STOCK_API_ENDPOINT = 'https://u1gir1ouw7.execute-api.us-east-1.amazonaws.com/prod/check-stock';
const ORDER_API_ENDPOINT = 'https://u1gir1ouw7.execute-api.us-east-1.amazonaws.com/prod/submit-order';

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

async function checkInventoryAvailability(cart) {
    for (const item of cart) {
        try {
            const response = await fetch(STOCK_API_ENDPOINT, {
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
                throw new Error(`Failed to check stock for ${item.productId}`);
            }

            const data = await response.json();
            const bodyData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;

            if (!bodyData.success) {
                throw new Error(bodyData.message || `Insufficient stock for ${item.productId}`);
            }
        } catch (error) {
            console.error('Stock check error:', error);
            throw new Error(`Stock check failed for ${item.productId}`);
        }
    }
    return true;
}

async function processPayment() {
    try {
        const form = document.getElementById('paymentForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const method = document.getElementById('paymentMethod').value;
        const cart = JSON.parse(localStorage.getItem('phoneShopCart')) || [];
        const customerInfo = JSON.parse(localStorage.getItem('customerInfo')) || {};

        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // First check inventory availability
        await checkInventoryAvailability(cart);

        // Prepare order data
        const orderData = {
            Name: customerInfo.fullName,
            Email: customerInfo.email,
            Address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`,
            PaymentInfo: method,
            OrderItems: cart.map(item => ({
                ProductID: item.productId,
                Quantity: item.quantity
            })),
            OrderStatus: "Pending"
        };

        // Submit order
        const orderResponse = await fetch(ORDER_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
            throw new Error('Failed to submit order');
        }

        const orderResult = await orderResponse.json();
        const orderBody = typeof orderResult.body === 'string' ? JSON.parse(orderResult.body) : orderResult.body;

        if (orderResult.statusCode === 200 && orderBody.status === 'success') {
            try {
                // Clear cart and stored info after successful processing
                localStorage.removeItem('phoneShopCart');
                localStorage.removeItem('customerInfo');

                // Store success message in localStorage
                localStorage.setItem('orderSuccess', JSON.stringify({
                    orderId: orderBody.OrderID,
                    message: 'Order processed successfully'
                }));

                // Use a small timeout to ensure localStorage is updated before redirect
                setTimeout(() => {
                    window.location.href = 'confirmation.html';
                }, 100);
            } catch (e) {
                // If we get an error here, the order was still successful
                // Just redirect to confirmation page
                window.location.href = 'confirmation.html';
            }
        } else {
            throw new Error(orderBody.message || 'Order processing failed');
        }

    } catch (error) {
        console.error('Payment processing error:', error);
        alert('There was an error processing your order: ' + error.message);
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
