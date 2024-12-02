document.addEventListener('DOMContentLoaded', () => {
    console.log('Checking for tracking number...');
    const trackingElement = document.getElementById('trackingNumber');
    console.log('Found tracking element:', trackingElement);

    if (trackingElement) {
        // Get tracking number from localStorage
        const trackingNumber = localStorage.getItem('orderTrackingNumber');
        console.log('Retrieved tracking number from localStorage:', trackingNumber);

        // Get any error message
        const orderError = localStorage.getItem('orderError');
        console.log('Order error from localStorage:', orderError);

        if (trackingNumber) {
            trackingElement.textContent = trackingNumber;
            // Clear the tracking number after displaying it
            localStorage.removeItem('orderTrackingNumber');
        } else if (orderError) {
            trackingElement.textContent = 'Error: ' + orderError;
            localStorage.removeItem('orderError');
        } else {
            trackingElement.textContent = 'Not available';
        }
    }

    // Clear any remaining order data
    localStorage.removeItem('orderTrackingNumber');
    localStorage.removeItem('orderError');
});
