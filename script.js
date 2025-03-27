const API_KEY = 'YOUR_API_KEY';

// DOM Elements
const coinsGrid = document.getElementById('coins-grid');
const searchInput = document.getElementById('search-input');
const searchButton = document.querySelector('.search-button');
const currencySelect = document.getElementById('currency-select');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const navLinks = document.querySelectorAll('.nav-links a');
const paginationNumbers = document.getElementById('pagination-numbers');
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');

// State
let currentCurrency = 'usd';
let coinsData = [];
let currentPage = 1;
const COINS_PER_PAGE = 10;
let totalCoins = 0;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchCoins();
    setupEventListeners();
});

// Functions
function setupEventListeners() {
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    currencySelect.addEventListener('change', handleCurrencyChange);
    setupMobileMenu();
    setupPagination();
}

async function fetchCoins() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`);
        const data = await response.json();
        
        coinsData = data;
        totalCoins = data.length;
        updateCoinsDisplay();
        updatePagination();
    } catch (error) {
        console.error('Error fetching coins:', error);
        showNotification('Error loading coins. Please try again later.', 'error');
    }
}

function updateCoinsDisplay() {
    const startIndex = (currentPage - 1) * COINS_PER_PAGE;
    const endIndex = startIndex + COINS_PER_PAGE;
    const pageCoins = coinsData.slice(startIndex, endIndex);
    
    coinsGrid.innerHTML = pageCoins.map(coin => `
        <div class="coin-row">
            <div class="coin-rank">#${coin.market_cap_rank}</div>
            <div class="coin-name">
                <img src="${coin.image}" alt="${coin.name}" class="coin-icon">
                <span>${coin.name}</span>
                <span class="coin-symbol">${coin.symbol.toUpperCase()}</span>
            </div>
            <div class="coin-price">$${coin.current_price.toLocaleString()}</div>
            <div class="coin-change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                ${coin.price_change_percentage_24h.toFixed(2)}%
            </div>
            <div class="coin-market-cap">$${coin.market_cap.toLocaleString()}</div>
        </div>
    `).join('');
}

function setupPagination() {
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateCoinsDisplay();
            updatePagination();
        }
    });

    nextButton.addEventListener('click', () => {
        const maxPages = Math.ceil(totalCoins / COINS_PER_PAGE);
        if (currentPage < maxPages) {
            currentPage++;
            updateCoinsDisplay();
            updatePagination();
        }
    });
}

function updatePagination() {
    const maxPages = Math.ceil(totalCoins / COINS_PER_PAGE);
    
    // Update pagination numbers
    paginationNumbers.innerHTML = '';
    for (let i = 1; i <= maxPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('pagination-number');
        if (i === currentPage) button.classList.add('active');
        button.addEventListener('click', () => {
            currentPage = i;
            updateCoinsDisplay();
            updatePagination();
        });
        paginationNumbers.appendChild(button);
    }
    
    // Update navigation buttons
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === maxPages;
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredCoins = coinsData.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm) || 
        coin.symbol.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    coinsData = filteredCoins;
    totalCoins = filteredCoins.length;
    updateCoinsDisplay();
    updatePagination();
}

function handleCurrencyChange() {
    currentCurrency = currencySelect.value.toLowerCase();
    currentPage = 1;
    fetchCoins();
}

function setupMobileMenu() {
    mobileMenuButton.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.nav-links').classList.remove('active');
        });
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 