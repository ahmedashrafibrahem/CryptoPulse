// Constants
const API_KEY = 'CG-L7SX8uWa6DY6ELfFZAvxr7yN';
const BASE_URL = 'https://api.coingecko.com/api/v3';
const REFRESH_INTERVAL = 30000; // 30 seconds

// DOM Elements
const cryptoGrid = document.getElementById('crypto-grid');
const searchInput = document.getElementById('search-input');
const currencySelect = document.getElementById('currency-select');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

// State
let cryptoData = [];
let currentCurrency = 'usd';
let searchTerm = '';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchCryptoData();
    setInterval(fetchCryptoData, REFRESH_INTERVAL);
});

searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderCryptoData();
});

currencySelect.addEventListener('change', (e) => {
    currentCurrency = e.target.value.toLowerCase();
    fetchCryptoData();
});

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
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

const formatMarketCap = (value, currency) => {
    if (!value) return 'N/A';
    const billion = 1000000000;
    const million = 1000000;
    const thousand = 1000;

    let formatted;
    if (value >= billion) {
        formatted = `${(value / billion).toFixed(2)}B`;
    } else if (value >= million) {
        formatted = `${(value / million).toFixed(2)}M`;
    } else if (value >= thousand) {
        formatted = `${(value / thousand).toFixed(2)}K`;
    } else {
        formatted = value.toFixed(2);
    }

    return `${currency.toUpperCase()} ${formatted}`;
};

const formatPercentage = (value) => {
    if (!value && value !== 0) return 'N/A';
    const formatted = value.toFixed(2);
    const isPositive = value > 0;
    return `<span class="${isPositive ? 'success-color' : 'danger-color'}">${isPositive ? '+' : ''}${formatted}%</span>`;
};

// API Functions
const fetchCryptoData = async () => {
    try {
        cryptoGrid.innerHTML = '<div class="loading">Loading cryptocurrency data...</div>';

        // Using the free API endpoint
        const response = await fetch(
            `${BASE_URL}/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&sparkline=false&page=1`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a few minutes.');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format received from API');
        }

        cryptoData = data;
        renderCryptoData();
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        cryptoGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                ${error.message || 'Failed to load cryptocurrency data. Please try again later.'}
            </div>
        `;
    }
};

// Render Functions
const renderCryptoData = () => {
    const filteredData = cryptoData.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm) ||
        coin.symbol.toLowerCase().includes(searchTerm)
    );

    if (filteredData.length === 0) {
        cryptoGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-search"></i>
                No cryptocurrencies found matching "${searchTerm}"
            </div>
        `;
        return;
    }

    const headerHtml = `
        <div class="crypto-table-header">
            <div class="table-cell">#</div>
            <div class="table-cell">Name</div>
            <div class="table-cell">Price</div>
            <div class="table-cell">24h Change</div>
            <div class="table-cell">Market Cap</div>
        </div>
    `;

    const rowsHtml = filteredData.map((coin, index) => `
        <div class="crypto-row" onclick="window.location.href='coin.html?id=${coin.id}'">
            <div class="table-cell">${index + 1}</div>
            <div class="table-cell">
                <div class="coin-info">
                    <img src="${coin.image}" alt="${coin.name}" class="coin-image">
                    <div class="coin-name-wrapper">
                        <span class="coin-name">${coin.name}</span>
                        <span class="coin-symbol">${coin.symbol.toUpperCase()}</span>
                    </div>
                </div>
            </div>
            <div class="table-cell price">${formatCurrency(coin.current_price, currentCurrency)}</div>
            <div class="table-cell change">${formatPercentage(coin.price_change_percentage_24h)}</div>
            <div class="table-cell market-cap">${formatMarketCap(coin.market_cap, currentCurrency)}</div>
        </div>
    `).join('');

    cryptoGrid.innerHTML = headerHtml + rowsHtml;
}; 