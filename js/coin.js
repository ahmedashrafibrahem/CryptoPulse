// Constants
const BASE_URL = 'https://api.coingecko.com/api/v3';
const urlParams = new URLSearchParams(window.location.search);
const coinId = urlParams.get('id');
let currentCurrency = 'usd';
let priceChart = null;

// DOM Elements
const currencySelect = document.getElementById('currency-select');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const timeButtons = document.querySelectorAll('.time-button');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (!coinId) {
        window.location.href = 'index.html';
        return;
    }
    fetchCoinData();
    fetchChartData(1); // Default to 24h
});

currencySelect.addEventListener('change', (e) => {
    currentCurrency = e.target.value.toLowerCase();
    fetchCoinData();
    fetchChartData(getActiveDays());
});

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

timeButtons.forEach(button => {
    button.addEventListener('click', () => {
        timeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        fetchChartData(parseInt(button.dataset.days));
    });
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

const formatNumber = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
};

const formatPercentage = (value) => {
    if (!value && value !== 0) return 'N/A';
    const formatted = value.toFixed(2);
    const isPositive = value > 0;
    return `<span class="${isPositive ? 'success-color' : 'danger-color'}">${isPositive ? '+' : ''}${formatted}%</span>`;
};

const getActiveDays = () => {
    const activeButton = document.querySelector('.time-button.active');
    return parseInt(activeButton.dataset.days);
};

// API Functions
const fetchCoinData = async () => {
    try {
        const response = await fetch(
            `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch coin data');
        }

        const data = await response.json();
        updateCoinInfo(data);
    } catch (error) {
        console.error('Error fetching coin data:', error);
        showError('Failed to load coin data. Please try again later.');
    }
};

const fetchChartData = async (days) => {
    try {
        const response = await fetch(
            `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=${currentCurrency}&days=${days}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch chart data');
        }

        const data = await response.json();
        updateChart(data.prices, days);
    } catch (error) {
        console.error('Error fetching chart data:', error);
        showError('Failed to load chart data. Please try again later.');
    }
};

// UI Update Functions
const updateCoinInfo = (data) => {
    // Update basic info
    document.title = `${data.name} (${data.symbol.toUpperCase()}) - CryptoPulse`;
    document.getElementById('coin-image').src = data.image.large;
    document.getElementById('coin-image').alt = data.name;
    document.getElementById('coin-name').textContent = data.name;
    document.getElementById('coin-symbol').textContent = data.symbol.toUpperCase();

    // Update price info
    const price = data.market_data.current_price[currentCurrency];
    const priceChange = data.market_data.price_change_percentage_24h;
    document.getElementById('current-price').textContent = formatCurrency(price, currentCurrency);
    document.getElementById('price-change').innerHTML = formatPercentage(priceChange);

    // Update stats
    document.getElementById('market-cap').textContent = formatCurrency(data.market_data.market_cap[currentCurrency], currentCurrency);
    document.getElementById('volume').textContent = formatCurrency(data.market_data.total_volume[currentCurrency], currentCurrency);
    document.getElementById('circulating-supply').textContent = formatNumber(data.market_data.circulating_supply);
    document.getElementById('total-supply').textContent = formatNumber(data.market_data.total_supply) || 'N/A';

    // Update description
    const description = data.description.en;
    document.getElementById('coin-description').innerHTML = description;
};

const updateChart = (priceData, days) => {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    if (priceChart) {
        priceChart.destroy();
    }

    const labels = priceData.map(price => {
        const date = new Date(price[0]);
        if (days === 1) {
            return date.toLocaleTimeString();
        } else {
            return date.toLocaleDateString();
        }
    });

    const prices = priceData.map(price => price[1]);

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Price (${currentCurrency.toUpperCase()})`,
                data: prices,
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
                    grid: {
                        display: false,
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        callback: function(value) {
                            return formatCurrency(value, currentCurrency);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
};

const showError = (message) => {
    const container = document.querySelector('.coin-detail-section');
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            ${message}
        </div>
    `;
}; 