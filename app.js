// ATELIER VISTA - Application Logic & Interactive Simulator

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scroll Effect
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('#main-header nav');
    
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (nav.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // Close menu when clicking link
    const navLinks = document.querySelectorAll('#main-header nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
        });
    });

    // 3. Contact / Appointment Modal
    const quoteBtn = document.getElementById('quote-btn');
    const contactModal = document.getElementById('contact-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const contactForm = document.getElementById('contact-form');
    const contactSuccess = document.getElementById('contact-success');

    if (quoteBtn && contactModal) {
        quoteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            contactModal.classList.add('active');
        });

        closeModalBtn.addEventListener('click', () => {
            contactModal.classList.remove('active');
        });

        // Close when clicking outside content
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.remove('active');
            }
        });

        // Form Submit
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            contactSuccess.classList.remove('hidden');
            setTimeout(() => {
                contactForm.reset();
                contactSuccess.classList.add('hidden');
                contactModal.classList.remove('active');
            }, 2500);
        });
    }

    // 4. Partner Upload & Admin Approval Simulation

    // Elements
    const partnerForm = document.getElementById('partner-upload-form');
    const presetSelect = document.getElementById('prod-image-preset');
    const customImageGroup = document.getElementById('custom-image-group');
    const customImageFile = document.getElementById('prod-image-file');
    const uploadToast = document.getElementById('upload-success-toast');
    
    const pendingItemsList = document.getElementById('pending-items-list');
    const approvedProductsContainer = document.getElementById('approved-products-container');
    const emptyPendingState = document.getElementById('empty-pending-state');
    
    const pendingCountEl = document.getElementById('pending-count');
    const approvedCountEl = document.getElementById('approved-count');

    // Preset selection change listener
    presetSelect.addEventListener('change', () => {
        if (presetSelect.value === 'custom') {
            customImageGroup.classList.remove('hidden');
            customImageFile.required = true;
        } else {
            customImageGroup.classList.add('hidden');
            customImageFile.required = false;
        }
    });

    // Base Products List (stored in memory/localStorage)
    const initialApproved = [
        {
            id: 'mock-1',
            brand: 'Lumina Art',
            name: 'Terrazzo Masa Lambası',
            desc: 'El yapımı terrazzo kaideli, pirinç detaylı modern aydınlatma.',
            image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 'mock-2',
            brand: 'Nordic Wood',
            name: 'Oak Minimalist Koltuk',
            desc: 'Doğal meşe iskelet üzerine keten döşemeli konforlu berjer.',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'
        }
    ];

    let approvedProducts = JSON.parse(localStorage.getItem('av_approved_products')) || initialApproved;
    let pendingProducts = JSON.parse(localStorage.getItem('av_pending_products')) || [];

    // Save lists helper
    const saveState = () => {
        localStorage.setItem('av_approved_products', JSON.stringify(approvedProducts));
        localStorage.setItem('av_pending_products', JSON.stringify(pendingProducts));
    };

    // Render Approved Products
    const renderApproved = () => {
        // Clear all except initial static ones if we want, but better to clear all and rebuild from state
        approvedProductsContainer.innerHTML = '';
        
        approvedProducts.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-id', prod.id);
            
            card.innerHTML = `
                <div class="product-img-wrapper">
                    <img src="${prod.image}" alt="${prod.name}">
                    <span class="partner-badge">${prod.brand}</span>
                </div>
                <div class="product-info">
                    <h3>${prod.name}</h3>
                    <p class="prod-desc">${prod.desc}</p>
                    <div class="product-footer">
                        <span class="status-verified"><i class="fa-solid fa-circle-check"></i> Atelier Vista Onaylı</span>
                    </div>
                </div>
            `;
            approvedProductsContainer.appendChild(card);
        });

        approvedCountEl.textContent = approvedProducts.length;
    };

    // Render Pending Products in Admin Panel
    const renderPending = () => {
        // Clear previous
        const items = pendingItemsList.querySelectorAll('.pending-item');
        items.forEach(el => el.remove());

        if (pendingProducts.length === 0) {
            emptyPendingState.classList.remove('hidden');
        } else {
            emptyPendingState.classList.add('hidden');
            
            pendingProducts.forEach(prod => {
                const item = document.createElement('div');
                item.className = 'pending-item';
                item.setAttribute('data-id', prod.id);
                
                item.innerHTML = `
                    <img src="${prod.image}" alt="${prod.name}" class="pending-thumb">
                    <div class="pending-details">
                        <span class="brand-name">${prod.brand}</span>
                        <h5>${prod.name}</h5>
                    </div>
                    <div class="pending-actions">
                        <button class="btn-action btn-approve" data-id="${prod.id}">Onayla</button>
                        <button class="btn-action btn-reject" data-id="${prod.id}">Reddet</button>
                    </div>
                `;
                pendingItemsList.appendChild(item);
            });
        }

        pendingCountEl.textContent = pendingProducts.length;

        // Add action listeners to dynamically created buttons
        const approveBtns = pendingItemsList.querySelectorAll('.btn-approve');
        approveBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                approveProduct(id);
            });
        });

        const rejectBtns = pendingItemsList.querySelectorAll('.btn-reject');
        rejectBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                rejectProduct(id);
            });
        });
    };

    // Product Submission Handler
    partnerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const brand = document.getElementById('comp-name').value.trim();
        const name = document.getElementById('prod-name').value.trim();
        const desc = document.getElementById('prod-desc').value.trim();
        const imagePreset = presetSelect.value;

        const processSubmission = (imgUrl) => {
            const newProd = {
                id: 'prod-' + Date.now(),
                brand,
                name,
                desc,
                image: imgUrl
            };

            pendingProducts.push(newProd);
            saveState();
            renderPending();
            
            // Show Success Toast
            uploadToast.classList.remove('hidden');
            setTimeout(() => {
                uploadToast.classList.add('hidden');
            }, 3000);

            // Reset form
            partnerForm.reset();
            customImageGroup.classList.add('hidden');
            customImageFile.required = false;
        };

        // Handle Image upload file vs preset selection
        if (imagePreset === 'custom' && customImageFile.files.length > 0) {
            const file = customImageFile.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                processSubmission(event.target.result); // Save Base64 data url
            };
            reader.readAsDataURL(file);
        } else {
            // Use selected preset image url
            processSubmission(imagePreset);
        }
    });

    // Admin Actions
    const approveProduct = (id) => {
        const index = pendingProducts.findIndex(p => p.id === id);
        if (index > -1) {
            const prod = pendingProducts[index];
            
            // Remove from pending
            pendingProducts.splice(index, 1);
            
            // Add to approved
            approvedProducts.push(prod);
            
            saveState();
            renderPending();
            renderApproved();
        }
    };

    const rejectProduct = (id) => {
        const index = pendingProducts.findIndex(p => p.id === id);
        if (index > -1) {
            // Remove from pending
            pendingProducts.splice(index, 1);
            
            saveState();
            renderPending();
        }
    };

    // Initial render
    renderApproved();
    renderPending();
});
