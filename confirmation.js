// confirmation.js
document.addEventListener('DOMContentLoaded', () => {
    // Get tracking number element
    const trackingNumberElement = document.getElementById('trackingNumber');
    
    // Try to get the order tracking number from localStorage
    const trackingNumber = localStorage.getItem('orderTrackingNumber');
    
    if (trackingNumber) {
        // Display the tracking number
        trackingNumberElement.textContent = trackingNumber;
        // Add class to make tracking number stand out
        trackingNumberElement.classList.add('tracking-number');
    } else {
        // Check if there was an error during order processing
        const orderError = localStorage.getItem('orderError');
        if (orderError) {
            trackingNumberElement.textContent = 'Error processing order: ' + orderError;
        } else {
            trackingNumberElement.textContent = 'Unavailable';
        }
    }
    
    // Clean up localStorage
    localStorage.removeItem('orderTrackingNumber');
    localStorage.removeItem('orderError');
    
    // Add event listener for "Return to Store" button
    const returnButton = document.querySelector('button');
    if (returnButton) {
        returnButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});
