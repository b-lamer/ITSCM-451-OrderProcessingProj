// confirmation.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Confirmation page loaded');
    
    // Get tracking number element
    const trackingNumberElement = document.getElementById('trackingNumber');
    console.log('Found tracking element:', trackingNumberElement);
    
    // Try to get the order tracking number from localStorage
    const trackingNumber = localStorage.getItem('orderTrackingNumber');
    console.log('Retrieved tracking number from localStorage:', trackingNumber);
    
    if (trackingNumber) {
        // Display the tracking number
        trackingNumberElement.textContent = trackingNumber;
        // Add class to make tracking number stand out
        trackingNumberElement.classList.add('tracking-number');
        console.log('Set tracking number display to:', trackingNumber);
    } else {
        // Check if there was an error during order processing
        const orderError = localStorage.getItem('orderError');
        console.log('Order error from localStorage:', orderError);
        if (orderError) {
            trackingNumberElement.textContent = 'Error processing order: ' + orderError;
        } else {
            trackingNumberElement.textContent = 'Not available';
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
