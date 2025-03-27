// DOM Elements
const blogSearchInput = document.getElementById('blog-search-input');
const blogSearchBtn = document.getElementById('blog-search-btn');
const categoryItems = document.querySelectorAll('.category-list li');
const sortSelect = document.getElementById('sort-select');
const blogPosts = document.querySelector('.blog-posts');
const paginationNumbers = document.querySelector('.pagination-numbers');
const paginationBtns = document.querySelectorAll('.pagination-btn');
const newsletterForm = document.getElementById('newsletter-form');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

// State
let currentPage = 1;
const postsPerPage = 6;
let currentCategory = 'all';
let currentSort = 'latest';
let searchTerm = '';

// Blog Posts Data
const blogPostsData = [
    {
        id: 1,
        title: 'Understanding Bitcoin Mining: A Comprehensive Guide',
        excerpt: 'Learn about the fundamentals of Bitcoin mining, from hardware requirements to mining pools.',
        category: 'guides',
        image: '/assets/blog/bitcoin-mining.jpg',
        alt: 'Bitcoin mining farm with multiple mining rigs',
        date: '2024-03-14',
        views: 1250
    },
    {
        id: 2,
        title: 'DeFi Protocols: The Future of Finance',
        excerpt: 'Explore how decentralized finance is revolutionizing traditional financial systems.',
        category: 'defi',
        image: '/assets/blog/defi.jpg',
        alt: 'Decentralized Finance concept illustration',
        date: '2024-03-13',
        views: 980
    },
    {
        id: 3,
        title: 'NFT Market Analysis: Q1 2024',
        excerpt: 'A detailed analysis of NFT market trends and performance in the first quarter of 2024.',
        category: 'analysis',
        image: '/assets/blog/nft.jpg',
        alt: 'NFT digital art visualization',
        date: '2024-03-12',
        views: 1500
    },
    {
        id: 4,
        title: 'Ethereum 2.0: What You Need to Know',
        excerpt: 'Understanding the implications of Ethereum\'s transition to proof-of-stake.',
        category: 'technology',
        image: '/assets/blog/ethereum.jpg',
        alt: 'Ethereum cryptocurrency symbol',
        date: '2024-03-11',
        views: 2100
    },
    {
        id: 5,
        title: 'Top 5 Crypto Security Best Practices',
        excerpt: 'Essential security measures to protect your cryptocurrency investments.',
        category: 'guides',
        image: '/assets/blog/security.jpg',
        alt: 'Cryptocurrency security concept',
        date: '2024-03-10',
        views: 1800
    },
    {
        id: 6,
        title: 'Breaking: Major Bank Adopts Cryptocurrency',
        excerpt: 'Leading financial institution announces integration of cryptocurrency services.',
        category: 'news',
        image: '/assets/blog/bank.jpg',
        alt: 'Traditional bank building with cryptocurrency symbols',
        date: '2024-03-09',
        views: 3000
    },
    // Add more blog posts as needed
];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeBlog();
});

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

blogSearchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    currentPage = 1;
    updateBlogPosts();
});

blogSearchBtn.addEventListener('click', () => {
    updateBlogPosts();
});

categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        categoryItems.forEach(cat => cat.classList.remove('active'));
        item.classList.add('active');
        currentCategory = item.dataset.category;
        currentPage = 1;
        updateBlogPosts();
    });
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    updateBlogPosts();
});

paginationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.page === 'prev' && currentPage > 1) {
            currentPage--;
        } else if (btn.dataset.page === 'next' && currentPage < getTotalPages()) {
            currentPage++;
        }
        updateBlogPosts();
    });
});

newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    if (validateEmail(email)) {
        // Simulate newsletter subscription
        showNotification('Thank you for subscribing to our newsletter!');
        newsletterForm.reset();
    } else {
        showNotification('Please enter a valid email address.', 'error');
    }
});

// Functions
function initializeBlog() {
    updateBlogPosts();
}

function updateBlogPosts() {
    const filteredPosts = filterPosts();
    const sortedPosts = sortPosts(filteredPosts);
    const paginatedPosts = paginatePosts(sortedPosts);
    
    renderPosts(paginatedPosts);
    updatePagination(filteredPosts.length);
    updateURL();
}

function filterPosts() {
    return blogPostsData.filter(post => {
        const matchesCategory = currentCategory === 'all' || post.category === currentCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchTerm) ||
                            post.excerpt.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });
}

function sortPosts(posts) {
    return [...posts].sort((a, b) => {
        switch (currentSort) {
            case 'latest':
                return new Date(b.date) - new Date(a.date);
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'popular':
                return b.views - a.views;
            default:
                return 0;
        }
    });
}

function paginatePosts(posts) {
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    return posts.slice(start, end);
}

function renderPosts(posts) {
    if (posts.length === 0) {
        blogPosts.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No posts found matching your criteria.</p>
            </div>
        `;
        return;
    }

    blogPosts.innerHTML = posts.map(post => `
        <article class="blog-post" data-category="${post.category}">
            <div class="post-image">
                <img src="${post.image}" alt="${post.alt}" loading="lazy">
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="category">${post.category}</span>
                    <span class="date">${formatDate(post.date)}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <div class="post-footer">
                    <a href="#" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                    <span class="views"><i class="fas fa-eye"></i> ${post.views}</span>
                </div>
            </div>
        </article>
    `).join('');
}

function updatePagination(totalPosts) {
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    
    // Update prev/next buttons
    document.querySelector('[data-page="prev"]').disabled = currentPage === 1;
    document.querySelector('[data-page="next"]').disabled = currentPage === totalPages;
    
    // Update page numbers
    paginationNumbers.innerHTML = generatePaginationNumbers(totalPages);
}

function generatePaginationNumbers(totalPages) {
    let numbers = '';
    for (let i = 1; i <= totalPages; i++) {
        numbers += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }
    return numbers;
}

function goToPage(page) {
    currentPage = page;
    updateBlogPosts();
}

function getTotalPages() {
    const filteredPosts = filterPosts();
    return Math.ceil(filteredPosts.length / postsPerPage);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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

function updateURL() {
    const params = new URLSearchParams();
    if (currentCategory !== 'all') params.set('category', currentCategory);
    if (searchTerm) params.set('search', searchTerm);
    if (currentSort !== 'latest') params.set('sort', currentSort);
    if (currentPage > 1) params.set('page', currentPage);
    
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newURL);
}

// Make goToPage available globally for pagination buttons
window.goToPage = goToPage; 