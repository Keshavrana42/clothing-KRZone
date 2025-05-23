document.addEventListener('DOMContentLoaded', () => {

    // --- Cart Management Functions ---
    let cart = []; // Initialize cart array

    // Function to load cart items from localStorage
    const loadCartItems = () => {
        const cartItemsString = localStorage.getItem('cartItems');
        try {
            cart = cartItemsString ? JSON.parse(cartItemsString) : [];
        } catch (e) {
            console.error("Error parsing cart items from localStorage:", e);
            cart = []; // Reset cart if parsing fails
        }
    };

    // Function to save cart items to localStorage
    const saveCartItems = () => {
        localStorage.setItem('cartItems', JSON.stringify(cart));
        updateCartCount(); // Update count every time cart changes
        renderCart(); // Re-render cart display
    };

    // Function to update cart count in the navigation
    const updateCartCount = () => {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    };

    // Function to add a product to the cart
    window.addToCart = function(buttonElement) { // Made global for onclick
        const productCard = buttonElement.closest('.product-card');
        const productId = productCard.getAttribute('data-product-id');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = parseFloat(productCard.querySelector('.product-price').textContent.replace('₹', ''));
        const productImage = productCard.querySelector('img').src;
        const productDescription = productCard.querySelector('.product-description-top p').textContent;

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
            alert(`Quantity for "${productName}" updated in cart! Current quantity: ${existingItem.quantity}`);
        } else {
            const newItem = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                description: productDescription,
                quantity: 1
            };
            cart.push(newItem);
            alert(`"${productName}" added to your cart!`);
        }
        saveCartItems();
        // Scroll to the cart section after adding an item
        scrollToSection('cart-section');
    };

    // Function to update item quantity in cart
    window.updateQuantity = function(productId, change) { // Made global for onclick
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                removeFromCart(productId); // Remove if quantity drops to 0 or less
            }
            saveCartItems();
        }
    };

    // Function to remove item from cart
    window.removeFromCart = function(productId) { // Made global for onclick
        cart = cart.filter(item => item.id !== productId);
        alert("Item removed from cart!");
        saveCartItems();
    };

    // Function to render the cart display
    const renderCart = () => {
        const cartItemsContainer = document.getElementById('cart-items-display');
        const cartTotalPriceElement = document.getElementById('cart-total-price');
        const proceedToCheckoutButton = document.getElementById('proceed-to-checkout-button');


        if (!cartItemsContainer || !cartTotalPriceElement || !proceedToCheckoutButton) return; // Exit if elements not found

        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty. Start shopping!</p>';
            cartTotalPriceElement.textContent = '₹0.00';
            proceedToCheckoutButton.style.display = 'none'; // Hide checkout button
            return;
        }

        cartItemsContainer.innerHTML = ''; // Clear previous content
        proceedToCheckoutButton.style.display = 'block'; // Show checkout button

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            const itemSubtotal = item.price * item.quantity;
            total += itemSubtotal;

            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Price: ₹${item.price.toFixed(2)}</p>
                    <div class="cart-quantity-controls">
                        <button onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <span class="cart-item-subtotal">₹${itemSubtotal.toFixed(2)}</span>
                    <button class="remove-from-cart-button" onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalPriceElement.textContent = `₹${total.toFixed(2)}`;
    };

    // --- General Utility Functions ---
    window.scrollToSection = function(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerOffset = document.querySelector('nav').offsetHeight;
            const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset - 20;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // --- User Management Functions (Simulated) ---
    const usersKey = 'registeredUsers';
    const currentUserKey = 'loggedInUser';

    const getUsers = () => {
        const usersString = localStorage.getItem(usersKey);
        return usersString ? JSON.parse(usersString) : [];
    };

    const saveUsers = (users) => {
        localStorage.setItem(usersKey, JSON.stringify(users));
    };

    const setCurrentUser = (username) => {
        localStorage.setItem(currentUserKey, username);
        updateAuthLinks();
    };

    const getCurrentUser = () => {
        return localStorage.getItem(currentUserKey);
    };

    window.logout = function() {
        localStorage.removeItem(currentUserKey);
        alert('You have been logged out.');
        updateAuthLinks();
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            // Only update if on index.html or root
            // If on a different page, just update links, no redirect
        } else {
            // Redirect to home page after logout if not already there
            window.location.href = 'index.html';
        }
    };

    const updateAuthLinks = () => {
        const loggedInUser = getCurrentUser();
        const authLinksContainer = document.getElementById('auth-links-container'); // This will be in index.html

        if (!authLinksContainer) return; // Exit if on checkout/login/register page without this container

        if (loggedInUser) {
            authLinksContainer.innerHTML = `
                <span class="welcome-message">Welcome, ${loggedInUser}!</span>
                <a href="#" onclick="logout()">Logout</a>
            `;
        } else {
            authLinksContainer.innerHTML = `
                <a href="./login.html">Login</a>
                <a href="./register.html">Register</a>
            `;
        }
    };


    // --- Page specific logic ---

    // For Register Page (register.html)
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const messageElement = document.getElementById('registration-message');

            let users = getUsers();

            // Simple validation: check if username or email already exists
            if (users.some(user => user.username === username)) {
                messageElement.textContent = 'Username already exists.';
                messageElement.classList.remove('success');
                messageElement.style.display = 'block';
                return;
            }
            if (users.some(user => user.email === email)) {
                messageElement.textContent = 'Email already registered.';
                messageElement.classList.remove('success');
                messageElement.style.display = 'block';
                return;
            }

            // In a real app, hash the password before saving!
            users.push({ username, email, password });
            saveUsers(users);

            messageElement.textContent = 'Registration successful! You can now log in.';
            messageElement.classList.add('success');
            messageElement.style.display = 'block';
            registerForm.reset(); // Clear the form

            // Optionally redirect to login page after successful registration
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    // For Login Page (login.html)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const messageElement = document.getElementById('login-message');

            let users = getUsers();
            const user = users.find(u => u.username === username && u.password === password); // No hashing here for simulation

            if (user) {
                setCurrentUser(user.username);
                messageElement.textContent = 'Login successful! Redirecting...';
                messageElement.classList.add('success');
                messageElement.style.display = 'block';
                // Redirect to home page or a dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                messageElement.textContent = 'Invalid username or password.';
                messageElement.classList.remove('success');
                messageElement.style.display = 'block';
            }
        });
    }

    // For Forgot Password Page (forgot-password.html)
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        const identifierInput = document.getElementById('reset-identifier');
        const newPasswordField = document.getElementById('new-password');
        const confirmNewPasswordField = document.getElementById('confirm-new-password');
        const newPasswordFieldsContainer = document.getElementById('new-password-fields');
        const submitButton = document.getElementById('forgot-password-submit');
        const messageElement = document.getElementById('forgot-password-message');

        let foundUser = null; // To store the user object once identified

        forgotPasswordForm.addEventListener('submit', (event) => {
            event.preventDefault();

            messageElement.style.display = 'none'; // Hide previous messages

            if (!foundUser) {
                // Step 1: Identify user by username or email
                const identifier = identifierInput.value;
                let users = getUsers();
                foundUser = users.find(u => u.username === identifier || u.email === identifier);

                if (foundUser) {
                    messageElement.textContent = 'User found. Please enter your new password.';
                    messageElement.classList.add('success');
                    messageElement.style.display = 'block';
                    newPasswordFieldsContainer.style.display = 'block'; // Show new password fields
                    identifierInput.disabled = true; // Disable identifier input
                    submitButton.textContent = 'Set New Password'; // Change button text
                } else {
                    messageElement.textContent = 'User not found. Please check your username or email.';
                    messageElement.classList.remove('success');
                    messageElement.style.display = 'block';
                }
            } else {
                // Step 2: Set new password
                const newPassword = newPasswordField.value;
                const confirmNewPassword = confirmNewPasswordField.value;

                if (newPassword === '' || confirmNewPassword === '') {
                    messageElement.textContent = 'New password fields cannot be empty.';
                    messageElement.classList.remove('success');
                    messageElement.style.display = 'block';
                    return;
                }

                if (newPassword !== confirmNewPassword) {
                    messageElement.textContent = 'New passwords do not match.';
                    messageElement.classList.remove('success');
                    messageElement.style.display = 'block';
                    return;
                }

                // Update the user's password
                let users = getUsers();
                const userIndex = users.findIndex(u => u.username === foundUser.username); // Find by username (unique)
                if (userIndex > -1) {
                    users[userIndex].password = newPassword; // Update password
                    saveUsers(users);

                    alert('Password reset successful! You can now log in with your new password.'); // <-- ADDED ALERT HERE

                    messageElement.textContent = 'Password reset successful! Redirecting to login...';
                    messageElement.classList.add('success');
                    messageElement.style.display = 'block';

                    // Redirect to login page after successful reset
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    messageElement.textContent = 'An error occurred. User not found for password reset.';
                    messageElement.classList.remove('success');
                    messageElement.style.display = 'block';
                }
            }
        });
    }


    // --- Common Initialization ---
    loadCartItems(); // Load cart on page load
    updateCartCount(); // Update cart count on page load
    renderCart(); // Render cart display on page load (if on index.html)
    updateAuthLinks(); // Update login/logout links based on user status
});