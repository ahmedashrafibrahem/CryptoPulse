// DOM Elements
const billingToggle = document.getElementById('billing-toggle');
const monthlyLabel = document.querySelector('.monthly');
const yearlyLabel = document.querySelector('.yearly');
const pricingCards = document.querySelectorAll('.pricing-card');
const faqItems = document.querySelectorAll('.faq-item');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

// Pricing Data
const prices = {
    basic: {
        monthly: 0,
        yearly: 0
    },
    pro: {
        monthly: 19,
        yearly: 182 // 19 * 12 * 0.8 (20% discount)
    },
    enterprise: {
        monthly: 49,
        yearly: 470 // 49 * 12 * 0.8 (20% discount)
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializePricing();
});

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

billingToggle.addEventListener('change', (e) => {
    const isYearly = e.target.checked;
    updateBillingLabels(isYearly);
    updatePrices(isYearly);
});

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        toggleFAQ(item);
    });
});

pricingCards.forEach(card => {
    const button = card.querySelector('.plan-btn');
    button.addEventListener('click', () => {
        handlePlanSelection(card.dataset.plan);
    });
});

// Functions
function initializePricing() {
    updateBillingLabels(false);
    updatePrices(false);
}

function updateBillingLabels(isYearly) {
    monthlyLabel.classList.toggle('active', !isYearly);
    yearlyLabel.classList.toggle('active', isYearly);
}

function updatePrices(isYearly) {
    pricingCards.forEach(card => {
        const plan = card.dataset.plan;
        const priceElement = card.querySelector('.amount');
        const periodElement = card.querySelector('.period');
        
        const price = isYearly ? prices[plan].yearly : prices[plan].monthly;
        const period = isYearly ? '/year' : '/month';
        
        priceElement.textContent = price;
        periodElement.textContent = period;
        
        // Animate price change
        priceElement.style.animation = 'none';
        priceElement.offsetHeight; // Trigger reflow
        priceElement.style.animation = 'fadeNumber 0.5s ease';
    });
}

function toggleFAQ(item) {
    const isActive = item.classList.contains('active');
    
    // Close all other FAQs
    faqItems.forEach(faq => {
        faq.classList.remove('active');
    });
    
    // Toggle the clicked FAQ
    if (!isActive) {
        item.classList.add('active');
    }
}

function handlePlanSelection(plan) {
    const isYearly = billingToggle.checked;
    const period = isYearly ? 'yearly' : 'monthly';
    const price = prices[plan][period];
    
    // Show different actions based on the plan
    switch (plan) {
        case 'basic':
            showNotification('Starting your free Basic plan setup...');
            break;
        case 'pro':
            showNotification('Redirecting to Pro plan checkout...');
            break;
        case 'enterprise':
            showNotification('Opening contact form for Enterprise plan...');
            break;
    }
    
    // Simulate redirect/action (replace with actual implementation)
    setTimeout(() => {
        console.log(`Selected ${plan} plan (${period}) at $${price}`);
    }, 1000);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, 100);
}

// Add keyframe animation for price changes
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeNumber {
        0% {
            opacity: 0;
            transform: translateY(-10px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style); 