// Main JavaScript for Riding Club of Barrington Hills
// Navigation and accessibility features

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Menu Toggle
    const mobileMenuButton = document.querySelector('[aria-controls="mobile-menu"]');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileSubmenuButtons = document.querySelectorAll('[aria-controls^="mobile-"]');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
            
            // Update hamburger icon
            const icon = this.querySelector('svg');
            if (icon) {
                if (!isExpanded) {
                    // Change to X icon
                    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
                } else {
                    // Change back to hamburger
                    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
                }
            }
        });
    }
    
    // Mobile Submenu Toggle
    mobileSubmenuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const menuId = this.getAttribute('aria-controls');
            const menu = document.getElementById(menuId);
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            this.setAttribute('aria-expanded', !isExpanded);
            if (menu) {
                menu.classList.toggle('hidden');
                
                // Rotate arrow icon
                const arrow = this.querySelector('svg');
                if (arrow) {
                    arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            }
        });
    });
    
    // Keyboard Navigation for Desktop Submenus
    const submenuButtons = document.querySelectorAll('[aria-haspopup="true"]');
    const submenus = document.querySelectorAll('[role="menu"]');
    
    submenuButtons.forEach(button => {
        // Handle Enter and Space key presses
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Handle Escape key to close submenu
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const menu = document.getElementById(this.getAttribute('aria-controls'));
                if (menu) {
                    menu.classList.add('opacity-0', 'invisible');
                    this.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
    
    // Handle Tab navigation for submenus
    submenus.forEach(menu => {
        const menuItems = menu.querySelectorAll('a[role="menuitem"]');
        
        menuItems.forEach((item, index) => {
            item.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextItem = menuItems[index + 1] || menuItems[0];
                    nextItem.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevItem = menuItems[index - 1] || menuItems[menuItems.length - 1];
                    prevItem.focus();
                } else if (e.key === 'Escape') {
                    const button = document.querySelector(`[aria-controls="${menu.id}"]`);
                    if (button) {
                        button.focus();
                        menu.classList.add('opacity-0', 'invisible');
                        button.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenu && !mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.add('hidden');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            
            // Reset hamburger icon
            const icon = mobileMenuButton.querySelector('svg');
            if (icon) {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
            }
        }
    });
    
    // Close mobile menu on window resize if desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768 && mobileMenu) {
            mobileMenu.classList.add('hidden');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading states for forms (will be used in later phases)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Processing...';
            }
        });
    });
    
    // Console log for debugging
    console.log('RCBH Website loaded successfully');
    console.log('Navigation accessibility features initialized');
});
