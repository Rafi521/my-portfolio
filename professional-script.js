// Utility functions for better error handling
const safeQuerySelector = (selector) => {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.warn(`Error selecting element: ${selector}`, error);
        return null;
    }
};

const safeQuerySelectorAll = (selector) => {
    try {
        return document.querySelectorAll(selector);
    } catch (error) {
        console.warn(`Error selecting elements: ${selector}`, error);
        return [];
    }
};

// Debounce function for performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for scroll events
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Mobile Navigation Toggle with improved accessibility
const initMobileNavigation = () => {
    const hamburger = safeQuerySelector(".hamburger");
    const navMenu = safeQuerySelector(".nav-menu");

    if (!hamburger || !navMenu) {
        console.warn('Mobile navigation elements not found');
        return;
    }

    const toggleMobileMenu = () => {
        const isActive = hamburger.classList.contains("active");
        
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        
        // Update ARIA attributes for accessibility
        hamburger.setAttribute("aria-expanded", !isActive);
        navMenu.setAttribute("aria-hidden", isActive);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = !isActive ? 'hidden' : '';
    };

    hamburger.addEventListener("click", toggleMobileMenu);

    // Close mobile menu when clicking on a link
    const navLinks = safeQuerySelectorAll(".nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (hamburger.classList.contains("active")) {
                toggleMobileMenu();
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (event) => {
        if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
            if (hamburger.classList.contains("active")) {
                toggleMobileMenu();
            }
        }
    });

    // Handle escape key to close mobile menu
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && hamburger.classList.contains("active")) {
            toggleMobileMenu();
        }
    });
};

// Smooth scrolling for navigation links with error handling
const initSmoothScrolling = () => {
    const anchors = safeQuerySelectorAll("a[href^=\"#\"]");
    
    anchors.forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute("href");
            const target = safeQuerySelector(targetId);
            
            if (target) {
                const navbarHeight = safeQuerySelector(".navbar")?.offsetHeight || 70;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
                
                // Update focus for accessibility
                target.focus({ preventScroll: true });
            } else {
                console.warn(`Target element not found: ${targetId}`);
            }
        });
    });
};

// Enhanced navbar background on scroll with throttling
const initNavbarScroll = () => {
    const navbar = safeQuerySelector(".navbar");
    if (!navbar) return;

    const updateNavbar = throttle(() => {
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            navbar.style.background = "rgba(255, 255, 255, 0.98)";
            navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
            navbar.classList.add("scrolled");
        } else {
            navbar.style.background = "rgba(255, 255, 255, 0.95)";
            navbar.style.boxShadow = "none";
            navbar.classList.remove("scrolled");
        }
    }, 16); // ~60fps

    window.addEventListener("scroll", updateNavbar, { passive: true });
};

// Active navigation link highlighting with improved performance
const initActiveNavigation = () => {
    const sections = safeQuerySelectorAll("section[id]");
    const navLinks = safeQuerySelectorAll(".nav-link");
    
    if (sections.length === 0 || navLinks.length === 0) return;

    const updateActiveLink = throttle(() => {
        let current = "";
        const scrollY = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    }, 100);

    window.addEventListener("scroll", updateActiveLink, { passive: true });
};

// Intersection Observer for animations with error handling
const initScrollAnimations = () => {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
        console.warn('Intersection Observer not supported');
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                entry.target.classList.add("animated");
                
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = safeQuerySelectorAll(".skill-card, .project-card, .contact-card, .about-content, .info-card");
    animatedElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(el);
    });
};

// Enhanced hover effects with performance optimization
const initHoverEffects = () => {
    const cards = safeQuerySelectorAll(".skill-card, .project-card, .contact-card");
    
    cards.forEach(card => {
        let isHovered = false;
        
        card.addEventListener("mouseenter", function() {
            if (!isHovered) {
                isHovered = true;
                this.style.transform = "translateY(-15px) scale(1.02)";
            }
        });
        
        card.addEventListener("mouseleave", function() {
            if (isHovered) {
                isHovered = false;
                this.style.transform = "translateY(0) scale(1)";
            }
        });
    });
};

// Optimized parallax effect for hero section
const initParallaxEffect = () => {
    const hero = safeQuerySelector(".hero");
    if (!hero) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const updateParallax = throttle(() => {
        const scrolled = window.pageYOffset;
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }, 16);

    window.addEventListener("scroll", updateParallax, { passive: true });
};

// Loading animation with better performance
const initLoadingAnimation = () => {
    const addLoadingStyles = () => {
        const loadingStyles = `
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 10000;
                border-radius: 4px;
            }
            
            .skip-link:focus {
                top: 6px;
            }
            
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
            
            body:not(.loaded) {
                overflow: hidden;
            }
            
            body:not(.loaded)::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            body:not(.loaded)::after {
                content: '';
                position: fixed;
                top: 50%;
                left: 50%;
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                z-index: 10000;
                transform: translate(-50%, -50%);
            }
            
            @keyframes spin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            .loaded::before,
            .loaded::after {
                display: none;
            }
            
            .nav-link.active {
                color: #667eea;
            }
            
            .nav-link.active::after {
                width: 100%;
            }
            
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.textContent = loadingStyles;
        document.head.appendChild(styleSheet);
    };

    addLoadingStyles();

    // Remove loading state when page is fully loaded
    window.addEventListener("load", () => {
        document.body.classList.add("loaded");
    });
};

// Typing animation for hero title with better performance
const initTypingAnimation = () => {
    const heroTitle = safeQuerySelector(".hero-title");
    if (!heroTitle) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const typeWriter = (element, text, speed = 100) => {
        let i = 0;
        element.innerHTML = "";
        
        const type = () => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        
        type();
    };

    // Initialize typing animation when page loads
    window.addEventListener("load", () => {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 80);
        }, 500);
    });
};

// Staggered animation for cards with improved performance
const initStaggeredAnimations = () => {
    if (!('IntersectionObserver' in window)) return;

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0) scale(1)";
                    entry.target.classList.add("stagger-animated");
                }, index * 150);
                
                // Stop observing once animated
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    // Apply staggered animation to all cards
    const cards = safeQuerySelectorAll(".skill-card, .project-card, .contact-card");
    cards.forEach(card => {
        if (!card.classList.contains("animated")) {
            card.style.opacity = "0";
            card.style.transform = "translateY(30px) scale(0.95)";
            card.style.transition = "all 0.6s ease";
            cardObserver.observe(card);
        }
    });
};

// Error handling for external resources
const handleResourceErrors = () => {
    // Handle image loading errors
    const images = safeQuerySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.warn(`Failed to load image: ${this.src}`);
            this.style.display = 'none';
        });
    });

    // Handle font loading errors
    if ('fonts' in document) {
        document.fonts.ready.then(() => {
            console.log('All fonts loaded successfully');
        }).catch(error => {
            console.warn('Font loading error:', error);
        });
    }
};

// Performance monitoring
const initPerformanceMonitoring = () => {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
                }
            }, 0);
        });
    }
};

// Initialize all functionality when DOM is ready
const init = () => {
    try {
        initLoadingAnimation();
        initMobileNavigation();
        initSmoothScrolling();
        initNavbarScroll();
        initActiveNavigation();
        initScrollAnimations();
        initHoverEffects();
        initParallaxEffect();
        initTypingAnimation();
        initStaggeredAnimations();
        handleResourceErrors();
        initPerformanceMonitoring();
        
        console.log('Portfolio initialized successfully');
    } catch (error) {
        console.error('Error initializing portfolio:', error);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        console.log('Page hidden - pausing animations');
    } else {
        // Resume animations when page becomes visible
        console.log('Page visible - resuming animations');
    }
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        safeQuerySelector,
        safeQuerySelectorAll,
        debounce,
        throttle
    };
}

