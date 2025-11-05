// Load products and exclusive items from JSON files
let products = [];
let exclusiveProducts = [];

Promise.all([
    fetch('js/products.json').then(response => response.json()),
    fetch('js/exclusive.json').then(response => response.json())
])
.then(([productData, exclusiveData]) => {
    products = productData;
    exclusiveProducts = exclusiveData;
    initializePage();
})
.catch(error => console.error('Error loading data:', error));

// Cart functionality
let cart = [];

// DOM Elements
const cartIcon = document.querySelector('.cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.querySelector('.close-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.querySelector('.cart-count');
const checkoutBtn = document.querySelector('.checkout-btn');

// Event Listeners
cartIcon.addEventListener('click', toggleCart);
closeCart.addEventListener('click', toggleCart);
checkoutBtn.addEventListener('click', checkout);

// Toggle cart sidebar
function toggleCart(e) {
    e.preventDefault();
    cartSidebar.classList.toggle('active');
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId) || exclusiveProducts.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Update cart display
function updateCart() {
    // Update cart count
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);

    // Update cart items
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">$${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
                <button onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');

    // Update total (in INR)
    const total = cart.reduce((sum, item) => sum + (convertToINR(item.price) * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    alert('Thank you for your purchase!');
    cart = [];
    updateCart();
    toggleCart({ preventDefault: () => {} });
}

// Display products
// Convert USD to INR (you can adjust the conversion rate as needed)
const USD_TO_INR = 83; // Current approximate conversion rate

function convertToINR(usdPrice) {
    return Math.round(usdPrice); // Prices in products.json are already in INR
}

function displayProducts(productList) {
    const productsGrid = document.getElementById('products-grid') || document.getElementById('featured-products');
    if (!productsGrid) return;

    productsGrid.innerHTML = productList.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">₹${convertToINR(product.price)}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-variants">
                    <select class="size-select" onchange="updateProductOption(${product.id}, 'size', this.value)">
                        <option value="">Select Size</option>
                        ${product.sizes ? product.sizes.map(size => `<option value="${size}">${size}</option>`).join('') : ''}
                    </select>
                    <select class="color-select" onchange="updateProductOption(${product.id}, 'color', this.value)">
                        <option value="">Select Color</option>
                        ${product.colors ? product.colors.map(color => `<option value="${color}">${color}</option>`).join('') : ''}
                    </select>
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Filter products
function filterProducts() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sizeFilter = document.getElementById('size-filter');
    const colorFilter = document.getElementById('color-filter');

    if (!categoryFilter || !priceFilter) return;

    const category = categoryFilter.value;
    const maxPrice = parseInt(priceFilter.value);
    const size = sizeFilter ? sizeFilter.value : 'all';
    const color = colorFilter ? colorFilter.value : 'all';

    const filteredProducts = products.filter(product => {
        const categoryMatch = category === 'all' || product.category === category;
        const priceMatch = product.price <= maxPrice;
        const sizeMatch = size === 'all' || (product.sizes && product.sizes.includes(size));
        const colorMatch = color === 'all' || (product.colors && product.colors.includes(color));
        return categoryMatch && priceMatch && sizeMatch && colorMatch;
    });

    displayProducts(filteredProducts);
}

// Initialize page
function displayExclusiveProducts() {
    const exclusiveGrid = document.getElementById('exclusive-products');
    if (!exclusiveGrid) return;

    exclusiveGrid.innerHTML = exclusiveProducts.map(product => `
        <div class="exclusive-item">
            <div class="exclusive-image-container">
                <img src="${product.image}" alt="${product.name}" class="exclusive-image" style="height: 350px; width: 100%; object-fit: cover;">
            </div>
            <h3 class="exclusive-title">${product.name}</h3>
            <p class="exclusive-price">₹${convertToINR(product.price)}</p>
            <p>${product.description}</p>
            <div class="product-variants">
                <select class="size-select">
                    <option value="">Select Size</option>
                    ${product.sizes ? product.sizes.map(size => `<option value="${size}">${size}</option>`).join('') : ''}
                </select>
                <select class="color-select">
                    <option value="">Select Color</option>
                    ${product.colors ? product.colors.map(color => `<option value="${color}">${color}</option>`).join('') : ''}
                </select>
            </div>
            <button class="exclusive-btn" onclick="addToCart('${product.id}')">
                Add to Cart
            </button>
        </div>
    `).join('');
}

function initializePage() {
    // Check authentication and update login/logout visibility
    const currentUser = localStorage.getItem('currentUser');
    const loginLink = document.querySelector('.nav-links a[href="login.html"]');
    
    if (currentUser && loginLink) {
        // Convert login to logout if user is logged in
        loginLink.href = "#";
        loginLink.onclick = logout;
        loginLink.textContent = "Logout";
    }

    // Display all products
    if (document.getElementById('products-grid')) {
        // Products page
        displayProducts(products);
        
        // Set up filters
        const categoryFilter = document.getElementById('category-filter');
        const priceFilter = document.getElementById('price-filter');
        const priceValue = document.getElementById('price-value');

        if (categoryFilter && priceFilter && priceValue) {
            categoryFilter.addEventListener('change', filterProducts);
            priceFilter.addEventListener('input', (e) => {
                priceValue.textContent = `₹${Number(e.target.value).toLocaleString('en-IN')}`;
                filterProducts();
            });
        }
    } else if (document.getElementById('featured-products')) {
        // Home page - show featured products (first 6)
        const featuredProducts = products
            .filter(p => !p.excludeFromFeatured) // exclude flagged items
            .sort(() => Math.random() - 0.5) // Randomly shuffle products
            .slice(0, 6); // Get first 6 products
        displayProducts(featuredProducts);
        
        // Display exclusive products if the section exists
        if (document.getElementById('exclusive-products')) {
            displayExclusiveProducts();
        }
    }
}