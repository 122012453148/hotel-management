const fs = require('fs');
try {
    const content = fs.readFileSync('c:/Users/parth/OneDrive/Desktop/Hotel Management/frontend/src/pages/HotelManagerDashboard.jsx', 'utf8');

    const tags = ['div', 'main', 'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'span', 'button', 'form', 'label', 'input', 'textarea', 'motion.div', 'AnimatePresence', 'ManagerSidebar', 'Link', 'ArrowRight', 'CheckCircle', 'XCircle', 'X', 'Edit3', 'Trash2', 'MapPin', 'Building2', 'IndianRupee', 'TicketCheck', 'Users', 'TrendingUp', 'MessageSquare', 'Upload', 'Star', 'Loader2', 'QRCode'];

    tags.forEach(tag => {
        const openMatch = content.match(new RegExp('<' + tag + '(\\s|>)', 'g')) || [];
        const closeMatch = content.match(new RegExp('</' + tag + '>', 'g')) || [];
        const selfCloseMatch = content.match(new RegExp('<' + tag + '[^>]*/>', 'g')) || [];
        
        const openCount = openMatch.length;
        const closeCount = closeMatch.length;
        const selfCloseCount = selfCloseMatch.length;
        
        if (openCount !== (closeCount + selfCloseCount)) {
            console.log(`Tag mismatch for ${tag}: Open=${openCount}, Close=${closeCount}, SelfClose=${selfCloseCount}`);
        }
    });

    const braces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    console.log(`Braces: { = ${braces}, } = ${closeBraces}`);

    const parens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    console.log(`Parens: ( = ${parens}, ) = ${closeParens}`);
} catch (e) {
    console.error(e);
}
