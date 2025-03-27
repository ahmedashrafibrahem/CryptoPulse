// Constants
const BASE_URL = 'https://api.coingecko.com/api/v3';
let miniChart = null;

// DOM Elements
const currencySelect = document.getElementById('currency-select');
const demoCurrencySelect = document.getElementById('demo-currency-select');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const demoSearch = document.getElementById('demo-search');
const searchResults = document.getElementById('search-results');
const currencyPreview = document.getElementById('currency-preview');
const miniTimeButtons = document.querySelectorAll('.mini-time-button');
const alertPrice = document.getElementById('alert-price');
const alertBtn = document.querySelector('.alert-btn');

// State
let currentCurrency = 'usd';
let cryptoData = [];
let btcData = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeDemos();
    setInterval(updateBitcoinPrice, 30000); // Update every 30 seconds
});

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

currencySelect.addEventListener('change', (e) => {
    currentCurrency = e.target.value.toLowerCase();
    updateBitcoinPrice();
});

demoCurrencySelect.addEventListener('change', (e) => {
    const currency = e.target.value.toLowerCase();
    updateCurrencyPreview(currency);
});

demoSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    if (searchTerm.length > 0) {
        searchCoins(searchTerm);
    } else {
        searchResults.innerHTML = '';
    }
});

miniTimeButtons.forEach(button => {
    button.addEventListener('click', () => {
        miniTimeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        updateMiniChart(parseInt(button.dataset.days));
    });
});

alertBtn.addEventListener('click', () => {
    const price = parseFloat(alertPrice.value);
    if (price > 0) {
        showNotification('Price alert set successfully!');
        alertPrice.value = '';
    }
});

// Helper Functions
const formatCurrency = (value, currency) => {
    if (!value) return 'N/A';
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formatter.format(value);
};

const showNotification = (message) => {
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
};

// API Functions
const fetchBitcoinData = async () => {
    try {
        const response = await fetch(
            `${BASE_URL}/simple/price?ids=bitcoin&vs_currencies=${currentCurrency}&include_24h_change=true`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Bitcoin data');
        }

        const data = await response.json();
        return data.bitcoin;
    } catch (error) {
        console.error('Error fetching Bitcoin data:', error);
        return null;
    }
};

const searchCoins = async (query) => {
    try {
        const response = await fetch(
            `${BASE_URL}/search?query=${query}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch search results');
        }

        const data = await response.json();
        displaySearchResults(data.coins.slice(0, 5));
    } catch (error) {
        console.error('Error searching coins:', error);
        searchResults.innerHTML = '<div class="error-message">Failed to fetch search results</div>';
    }
};

const fetchChartData = async (days) => {
    try {
        const response = await fetch(
            `${BASE_URL}/coins/bitcoin/market_chart?vs_currency=${currentCurrency}&days=${days}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch chart data');
        }

        const data = await response.json();
        return data.prices;
    } catch (error) {
        console.error('Error fetching chart data:', error);
        return null;
    }
};

// UI Update Functions
const updateBitcoinPrice = async () => {
    const data = await fetchBitcoinData();
    if (data) {
        const price = data[currentCurrency];
        const change = data[`${currentCurrency}_24h_change`];
        
        document.querySelector('.ticker-price').textContent = formatCurrency(price, currentCurrency);
        document.querySelector('.ticker-icon').src = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png';
    }
};

const displaySearchResults = (coins) => {
    searchResults.innerHTML = coins.map(coin => `
        <div class="search-result-item">
            <img src="${coin.thumb}" alt="${coin.name}" width="20" height="20">
            <span>${coin.name} (${coin.symbol.toUpperCase()})</span>
        </div>
    `).join('');
};

const updateCurrencyPreview = async (currency) => {
    try {
        const response = await fetch(
            `${BASE_URL}/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=${currency}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch currency preview');
        }

        const data = await response.json();
        currencyPreview.innerHTML = Object.entries(data).map(([coin, prices]) => `
            <div class="currency-preview-item">
                <strong>${coin}</strong>
                <span>${formatCurrency(prices[currency], currency)}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error updating currency preview:', error);
        currencyPreview.innerHTML = '<div class="error-message">Failed to load preview</div>';
    }
};

const updateMiniChart = async (days) => {
    const prices = await fetchChartData(days);
    if (!prices) return;

    const ctx = document.getElementById('miniChart').getContext('2d');
    
    if (miniChart) {
        miniChart.destroy();
    }

    const labels = prices.map(price => {
        const date = new Date(price[0]);
        return days === 1 ? date.toLocaleTimeString() : date.toLocaleDateString();
    });

    miniChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Bitcoin Price (${currentCurrency.toUpperCase()})`,
                data: prices.map(price => price[1]),
                borderColor: '#6c5ce7',
                backgroundColor: 'rgba(108, 92, 231, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
};

// Initialization
const initializeDemos = async () => {
    await updateBitcoinPrice();
    await updateCurrencyPreview('usd');
    await updateMiniChart(1);
}; 