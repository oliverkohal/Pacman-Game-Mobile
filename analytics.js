// Vercel Analytics - Load when page is ready
(function() {
    // Create and append the Vercel analytics script
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    document.head.appendChild(script);
})();
