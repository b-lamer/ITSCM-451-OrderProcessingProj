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

        console.log('Sending order data:', orderData);

        // Submit order
        const orderResponse = await fetch(ORDER_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const orderResult = await orderResponse.json();
        console.log('Raw order result:', orderResult);

        // Parse the body string since it comes as a stringified JSON
        const bodyJson = JSON.parse(orderResult.body);
        console.log('Parsed body:', bodyJson);

        if (bodyJson && bodyJson.OrderID !== undefined) {
            console.log('Found OrderID:', bodyJson.OrderID);
            localStorage.setItem('orderTrackingNumber', bodyJson.OrderID.toString());
            console.log('Saved tracking number to localStorage:', bodyJson.OrderID.toString());
        } else {
            console.warn('No OrderID in response:', bodyJson);
            localStorage.setItem('orderError', 'No tracking number received from server');
        }

        // Clear cart and stored info
        localStorage.removeItem('phoneShopCart');
        localStorage.removeItem('customerInfo');

        // Redirect to confirmation page
        window.location.replace('confirmation.html');

    } catch (error) {
        console.error('Payment processing error:', error);
        localStorage.setItem('orderError', error.message);
        window.location.replace('confirmation.html');
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
