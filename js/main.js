document.addEventListener('DOMContentLoaded', function () {
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out',
            once: true,
            offset: 100
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- Cart Logic --- //
    const cartKey = 'oscarCahnCart';
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    function saveCart() {
        localStorage.setItem(cartKey, JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        // Update badge
        const badge = document.getElementById('cart-count');
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (badge) {
            badge.innerText = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }

        // Add bounce animation if quantity changed (optional polish)
    }

    // Add to Cart
    window.addToCart = function (product) {
        const existingItem = cart.find(item => item.id === product.id && item.variant === product.variant);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();

        // Show feedback (Toast or Alert)
        alert('Added to bag: ' + product.name);
    }

    // Render Cart Page
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        renderCart();
    }

    function renderCart() {
        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-5">
                    <h3 class="text-gold mb-3">Your bag is empty</h3>
                    <p class="text-muted mb-4">Looks like you haven't decided on your weapon of choice yet.</p>
                    <a href="products.html" class="btn btn-outline-gold">Browse Cues</a>
                </div>
            `;
            document.getElementById('checkout-btn').classList.add('disabled');
            updateTotals();
            return;
        }

        document.getElementById('checkout-btn').classList.remove('disabled');

        let html = '';
        cart.forEach((item, index) => {
            html += `
                <div class="card bg-card border-secondary mb-3 p-3">
                    <div class="row align-items-center">
                        <div class="col-md-2 col-4">
                            <img src="${item.image}" class="img-fluid border border-dark" alt="${item.name}">
                        </div>
                        <div class="col-md-4 col-8">
                            <h5 class="mb-1" style="font-family: var(--font-heading);">${item.name}</h5>
                            <p class="text-muted small mb-0">${item.variant || 'Standard'}</p>
                        </div>
                        <div class="col-md-2 col-4 mt-3 mt-md-0">
                             <span class="text-gold fw-bold">£${item.price}</span>
                        </div>
                        <div class="col-md-3 col-4 mt-3 mt-md-0">
                            <div class="d-flex align-items-center justify-content-center">
                                <button class="btn btn-quantity" onclick="updateQuantity(${index}, -1)">-</button>
                                <input type="text" class="form-control bg-transparent text-white text-center border-0 p-0 mx-2" style="width: 40px;" value="${item.quantity}" readonly>
                                <button class="btn btn-quantity" onclick="updateQuantity(${index}, 1)">+</button>
                            </div>
                        </div>
                        <div class="col-md-1 col-4 mt-3 mt-md-0 text-end">
                            <button class="btn text-danger p-0" onclick="removeItem(${index})"><i class="fa fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
        cartContainer.innerHTML = html;
        updateTotals();
    }

    window.updateQuantity = function (index, change) {
        if (cart[index].quantity + change <= 0) {
            removeItem(index);
            return;
        }
        cart[index].quantity += change;
        saveCart();
        renderCart();
    }

    window.removeItem = function (index) {
        if (confirm('Remove this item?')) {
            cart.splice(index, 1);
            saveCart();
            renderCart();
        }
    }

    function updateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const subtotalEl = document.getElementById('cart-subtotal');
        const totalEl = document.getElementById('cart-total');

        if (subtotalEl) subtotalEl.innerText = '£' + subtotal.toFixed(2);
        if (totalEl) totalEl.innerText = '£' + subtotal.toFixed(2);
    }

    // Checkout Page Logic
    const summaryList = document.getElementById('order-summary-list');
    if (summaryList) {
        let listHtml = '';
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            listHtml += `
                <li class="list-group-item d-flex justify-content-between lh-sm bg-card border-secondary text-white">
                    <div>
                        <h6 class="my-0">${item.name}</h6>
                        <small class="text-muted">Qty: ${item.quantity}</small>
                    </div>
                    <span class="text-white">£${item.price * item.quantity}</span>
                </li>
            `;
        });
        summaryList.innerHTML = listHtml;
        document.getElementById('order-count').innerText = cart.length;
        document.getElementById('order-total').innerText = '£' + total.toFixed(2);
        document.getElementById('pay-amount').innerText = '£' + total.toFixed(2);

        // Form Submit
        const form = document.getElementById('checkout-form');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // Simulate processing
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.disabled = true;
            btn.innerText = 'Processing...';

            setTimeout(() => {
                cart = []; // Clear cart
                saveCart();
                const modal = new bootstrap.Modal(document.getElementById('successModal'));
                modal.show();
                btn.innerText = originalText;
                btn.disabled = false;
            }, 1500);
        });
    }

    // Product Detail Page - Add to Cart Listener
    const addToCartBtn = document.querySelector('.btn-premium-cta');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function () {
            const product = {
                id: 'grandmaster-001',
                name: 'The Grandmaster',
                price: 599.00,
                image: 'images/cue_splicing_detail.png', // Main thumb
                variant: document.querySelector('.form-select').value
            };
            addToCart(product);
        });
    }

    // Initial UI Update
    updateCartUI();
});
