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
            // Don't remove the tracking number yet
        } else if (orderError) {
            trackingElement.textContent = 'Error: ' + orderError;
            localStorage.removeItem('orderError');
        } else {
            trackingElement.textContent = 'Not available';
        }
    }

    // Only clear the tracking number after we're sure the page has loaded
    // and the number has been displayed
    setTimeout(() => {
        localStorage.removeItem('orderTrackingNumber');
        localStorage.removeItem('orderError');
    }, 1000);
});
