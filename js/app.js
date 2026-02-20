/**
 * Caribou Health Website
 * Interactive functionality and animations
 */

// ============================================
// DOM Elements
// ============================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const waitlistForm = document.getElementById('waitlistForm');
const contactForm = document.getElementById('contactForm');
const newsletterForm = document.getElementById('newsletterForm');
const formSuccess = document.getElementById('formSuccess');

// ============================================
// Navigation
// ============================================

// Navbar scroll effect
let lastScroll = 0;

function handleNavScroll() {
    if (!navbar) return; // Guard clause for pages without navbar

    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
}

// Mobile menu toggle
function toggleMobileMenu() {
    if (!navToggle || !navMenu) return; // Guard clause for pages without nav elements

    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

// Close mobile menu when clicking a link
function handleNavLinkClick(e) {
    if (navMenu && navMenu.classList.contains('active')) {
        toggleMobileMenu();
    }

    // Update active state
    navLinks.forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
}

// Update active nav link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.pageYOffset + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ============================================
// Form Handling
// ============================================

// Show toast notification
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Hide toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Google Form configuration for waitlist
const GOOGLE_FORM_CONFIG = {
    // Use viewform for prefilled URL approach
    formUrl: 'https://docs.google.com/forms/d/e/1nELXqm1xKEaHlgpXp7EDW7dorlha-LlREbjYmhiCOyc/formResponse',
    viewUrl: 'https://docs.google.com/forms/d/e/1nELXqm1xKEaHlgpXp7EDW7dorlha-LlREbjYmhiCOyc/viewform',
    fields: {
        name: 'entry.1147532320',
        email: 'entry.1704067018',
        role: 'entry.1721982950'
    }
};

// Handle waitlist form submission - sends to Google Form via hidden iframe
function handleWaitlistSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const name = form.querySelector('#waitlist-name').value.trim();
    const email = form.querySelector('#waitlist-email').value.trim();
    const roleSelect = form.querySelector('#waitlist-role');
    const role = roleSelect ? roleSelect.value : '';

    // Validation
    if (!name || !email) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Map the role value to match Google Form options exactly
    let googleFormRole = 'Patient'; // default
    if (role === 'patient') googleFormRole = 'Patient';
    else if (role === 'caregiver') googleFormRole = 'Caregiver/Family Member';
    else if (role === 'provider' || role === 'healthcare') googleFormRole = 'Healthcare Provider';
    else if (role === 'other') googleFormRole = 'Other';

    // Create hidden iframe for form submission
    const iframeName = 'google-form-iframe-' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;left:-9999px;';
    document.body.appendChild(iframe);

    // Create the form targeting the iframe
    const googleForm = document.createElement('form');
    googleForm.method = 'POST';
    googleForm.action = GOOGLE_FORM_CONFIG.formUrl;
    googleForm.target = iframeName;
    googleForm.style.display = 'none';

    // Add the form fields
    const fields = [
        { name: GOOGLE_FORM_CONFIG.fields.name, value: name },
        { name: GOOGLE_FORM_CONFIG.fields.email, value: email },
        { name: GOOGLE_FORM_CONFIG.fields.role, value: googleFormRole }
    ];

    fields.forEach(field => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = field.name;
        input.value = field.value;
        googleForm.appendChild(input);
    });

    document.body.appendChild(googleForm);

    // Track if iframe loaded (means form was processed)
    let submitted = false;
    iframe.onload = function() {
        if (submitted) {
            // Clean up
            setTimeout(() => {
                iframe.remove();
                googleForm.remove();
            }, 1000);
        }
    };

    // Submit the form
    googleForm.submit();
    submitted = true;

    // Show success after brief delay
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        form.style.display = 'none';
        formSuccess.style.display = 'block';
        showToast('Successfully joined the waitlist!', 'success');
    }, 1000);
}

// Google Form configuration for contact/feedback
const CONTACT_FORM_CONFIG = {
    formUrl: 'https://docs.google.com/forms/d/e/1JewgUNveFkVc9ny4bOpB6oLR3AUo41BjGujqRSj-mpA/formResponse',
    fields: {
        name: 'entry.471354672',
        email: 'entry.1129247242',
        subject: 'entry.94761292',
        message: 'entry.1664704084',
        feedbackSource: 'entry.2121488763'
    }
};

// Handle contact form submission - submits to Google Form via hidden iframe
function handleContactSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const name = form.querySelector('#contact-name').value.trim();
    const email = form.querySelector('#contact-email').value.trim();
    const subjectSelect = form.querySelector('#contact-subject');
    const subject = subjectSelect ? subjectSelect.value : '';
    const message = form.querySelector('#contact-message').value.trim();

    // Validation
    if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Map the subject value to match Google Form options exactly
    let googleFormSubject = 'General Inquiry'; // default
    if (subject === 'general') googleFormSubject = 'General Inquiry';
    else if (subject === 'partnership') googleFormSubject = 'Partnership Opportunity';
    else if (subject === 'careers') googleFormSubject = 'Career Question';
    else if (subject === 'press') googleFormSubject = 'Press/Media';
    else if (subject === 'support') googleFormSubject = 'Support';

    // Create hidden iframe for form submission
    const iframeName = 'contact-form-iframe-' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;left:-9999px;';
    document.body.appendChild(iframe);

    // Create the form targeting the iframe
    const googleForm = document.createElement('form');
    googleForm.method = 'POST';
    googleForm.action = CONTACT_FORM_CONFIG.formUrl;
    googleForm.target = iframeName;
    googleForm.style.display = 'none';

    // Add the form fields
    const fields = [
        { name: CONTACT_FORM_CONFIG.fields.name, value: name },
        { name: CONTACT_FORM_CONFIG.fields.email, value: email },
        { name: CONTACT_FORM_CONFIG.fields.subject, value: googleFormSubject },
        { name: CONTACT_FORM_CONFIG.fields.message, value: message },
        { name: CONTACT_FORM_CONFIG.fields.feedbackSource, value: 'Website - Contact Form' }
    ];

    fields.forEach(field => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = field.name;
        input.value = field.value;
        googleForm.appendChild(input);
    });

    document.body.appendChild(googleForm);

    // Submit the form
    googleForm.submit();

    // Show success after brief delay
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        const contactFormSuccess = document.getElementById('contactFormSuccess');
        if (contactFormSuccess) {
            form.style.display = 'none';
            contactFormSuccess.style.display = 'block';
        }

        showToast('Thank you for your message! We\'ll get back to you soon.', 'success');

        // Clean up
        setTimeout(() => {
            iframe.remove();
            googleForm.remove();
        }, 2000);
    }, 1000);
}

// Handle newsletter form submission - shows popup for name then sends to Google Form
function handleNewsletterSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = form.querySelector('input[type="email"]').value.trim();

    if (!email) {
        showToast('Please enter your email address.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }

    // Show popup to get name
    showNewsletterNamePopup(email, form, submitBtn);
}

// Show popup to collect name for newsletter subscription
function showNewsletterNamePopup(email, form, submitBtn) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'newsletter-popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'newsletter-popup';
    popup.style.cssText = `
        background: linear-gradient(135deg, #1a1f35 0%, #0d1117 100%);
        border: 1px solid rgba(94, 250, 255, 0.3);
        border-radius: 16px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;

    popup.innerHTML = `
        <h3 style="font-family: 'DM Serif Display', serif; color: #fff; font-size: 1.5rem; margin-bottom: 8px;">Almost there!</h3>
        <p style="color: rgba(255,255,255,0.7); margin-bottom: 24px; font-size: 0.95rem;">Please enter your name to complete your newsletter subscription.</p>
        <input type="text" id="newsletter-name-input" placeholder="Enter your name" style="
            width: 100%;
            padding: 14px 16px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: #fff;
            font-size: 1rem;
            margin-bottom: 20px;
            outline: none;
            transition: border-color 0.3s;
            box-sizing: border-box;
        " />
        <div style="display: flex; gap: 12px;">
            <button id="newsletter-cancel-btn" style="
                flex: 1;
                padding: 12px 20px;
                background: transparent;
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                color: rgba(255,255,255,0.7);
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.3s;
            ">Cancel</button>
            <button id="newsletter-submit-btn" style="
                flex: 1;
                padding: 12px 20px;
                background: linear-gradient(135deg, #5efaff 0%, #a78bfa 100%);
                border: none;
                border-radius: 8px;
                color: #0d1117;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            ">Subscribe</button>
        </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Focus the input
    const nameInput = popup.querySelector('#newsletter-name-input');
    setTimeout(() => nameInput.focus(), 100);

    // Handle input focus styling
    nameInput.addEventListener('focus', () => {
        nameInput.style.borderColor = 'rgba(94, 250, 255, 0.5)';
    });
    nameInput.addEventListener('blur', () => {
        nameInput.style.borderColor = 'rgba(255,255,255,0.1)';
    });

    // Handle cancel
    const cancelBtn = popup.querySelector('#newsletter-cancel-btn');
    cancelBtn.addEventListener('click', () => {
        overlay.remove();
    });

    // Handle click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // Handle submit
    const popupSubmitBtn = popup.querySelector('#newsletter-submit-btn');
    popupSubmitBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
            nameInput.style.borderColor = '#ff6b6b';
            showToast('Please enter your name.', 'error');
            return;
        }

        // Remove popup and submit
        overlay.remove();
        submitNewsletterForm(name, email, form, submitBtn);
    });

    // Handle enter key
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            popupSubmitBtn.click();
        }
    });
}

// Submit the newsletter form to Google Forms via hidden iframe
function submitNewsletterForm(name, email, form, submitBtn) {
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Create hidden iframe for form submission
    const iframeName = 'newsletter-form-iframe-' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;left:-9999px;';
    document.body.appendChild(iframe);

    // Create the form targeting the iframe
    const googleForm = document.createElement('form');
    googleForm.method = 'POST';
    googleForm.action = GOOGLE_FORM_CONFIG.formUrl;
    googleForm.target = iframeName;
    googleForm.style.display = 'none';

    // Add the form fields - use "Other" as role since "Newsletter" isn't a valid Google Form option
    const fields = [
        { name: GOOGLE_FORM_CONFIG.fields.name, value: name + ' (Newsletter)' },
        { name: GOOGLE_FORM_CONFIG.fields.email, value: email },
        { name: GOOGLE_FORM_CONFIG.fields.role, value: 'Other' }
    ];

    fields.forEach(field => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = field.name;
        input.value = field.value;
        googleForm.appendChild(input);
    });

    document.body.appendChild(googleForm);

    // Submit the form
    googleForm.submit();

    // Show success after brief delay
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        form.reset();
        showToast('Subscribed to newsletter!', 'success');

        // Clean up
        setTimeout(() => {
            iframe.remove();
            googleForm.remove();
        }, 2000);
    }, 1000);
}

// ============================================
// Scroll Animations
// ============================================

// Intersection Observer for fade-in animations
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px 50px 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add fade-in class to sections that don't already have it
    document.querySelectorAll('section').forEach(section => {
        if (!section.classList.contains('fade-in')) {
            section.classList.add('fade-in');
        }
    });

    // Add stagger animation to grids
    document.querySelectorAll('.about-grid, .features-grid, .jobs-grid').forEach(grid => {
        if (!grid.classList.contains('stagger-children')) {
            grid.classList.add('stagger-children');
        }
    });

    // Collect all animatable elements
    const animatableEls = document.querySelectorAll('.fade-in, .stagger-children');

    // Helper: check if element is in viewport and mark visible
    function checkVisibility() {
        animatableEls.forEach(el => {
            if (el.classList.contains('visible')) return;
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight + 50 && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }

    // Observe elements for future scroll-triggered reveals
    animatableEls.forEach(el => {
        observer.observe(el);
    });

    // Fallback: manually check elements already in viewport on load
    // IntersectionObserver initial callback can miss elements already visible
    requestAnimationFrame(() => {
        checkVisibility();
    });

}

// ============================================
// Smooth Scrolling
// ============================================

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// Parallax Effects
// ============================================

function initParallaxEffects() {
    const orbs = document.querySelectorAll('.gradient-orb');

    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 10;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;

            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// ============================================
// Interactive App Demo Animation
// ============================================

function initAppDemoAnimation() {
    const demoScreens = document.querySelectorAll('.demo-screen');
    const demoDots = document.querySelectorAll('.demo-dot');
    let currentScreen = 0;
    let demoInterval;

    function showScreen(index) {
        // Hide all screens
        demoScreens.forEach(screen => screen.classList.remove('active'));
        demoDots.forEach(dot => dot.classList.remove('active'));

        // Show target screen
        if (demoScreens[index]) {
            demoScreens[index].classList.add('active');
        }
        if (demoDots[index]) {
            demoDots[index].classList.add('active');
        }

        currentScreen = index;

        // Animate tasks on dashboard screen
        if (index === 1) {
            animateDashboardTasks();
        }
    }

    function animateDashboardTasks() {
        const dashboardScreen = document.getElementById('screen-dashboard');
        if (!dashboardScreen) return;

        const tasks = dashboardScreen.querySelectorAll('.demo-task');
        const progressCircle = dashboardScreen.querySelector('.progress-circle');
        const progressText = dashboardScreen.querySelector('.progress-text');

        // Reset tasks
        tasks.forEach(task => {
            task.classList.remove('done');
            const check = task.querySelector('.task-check');
            if (check) check.textContent = '';
        });

        // Animate tasks one by one
        let taskIndex = 0;
        const taskInterval = setInterval(() => {
            if (taskIndex < tasks.length) {
                tasks[taskIndex].classList.add('done');
                const check = tasks[taskIndex].querySelector('.task-check');
                if (check) check.textContent = '\u2713';

                // Update progress
                const progress = ((taskIndex + 1) / tasks.length) * 100;
                if (progressText) progressText.textContent = Math.round(70 + (30 * (taskIndex + 1) / tasks.length)) + '%';
                if (progressCircle) {
                    const circumference = 163;
                    const offset = circumference - (progress / 100) * circumference;
                    progressCircle.style.strokeDashoffset = offset;
                }

                taskIndex++;
            } else {
                clearInterval(taskInterval);
            }
        }, 800);
    }

    function nextScreen() {
        const next = (currentScreen + 1) % demoScreens.length;
        showScreen(next);
    }

    // Click handlers for dots
    demoDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showScreen(index);
            // Reset interval
            clearInterval(demoInterval);
            demoInterval = setInterval(nextScreen, 4000);
        });
    });

    // Start auto-rotation
    demoInterval = setInterval(nextScreen, 4000);

    // Initialize first screen
    showScreen(0);
}

// ============================================
// Typing Effect for Hero
// ============================================

function initTypingEffect() {
    const highlights = document.querySelectorAll('.hero-title .highlight');
    const words = ['accessible', 'achievable', 'autonomous'];
    let wordIndex = 0;

    // This is a subtle effect - the words stay but we could animate them
    // For now, we'll add a subtle glow pulse
    highlights.forEach((highlight, index) => {
        highlight.style.animationDelay = `${index * 0.3}s`;
    });
}

// ============================================
// Counter Animation
// ============================================

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// ============================================
// Accessibility
// ============================================

function initAccessibility() {
    // Handle keyboard navigation for mobile menu (only if nav elements exist)
    if (navToggle) {
        navToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileMenu();
            }
        });
    }

    // Trap focus in mobile menu when open
    if (navMenu) {
        navMenu.addEventListener('keydown', (e) => {
            if (!navMenu.classList.contains('active')) return;

            if (e.key === 'Escape') {
                toggleMobileMenu();
                if (navToggle) navToggle.focus();
            }
        });
    }

    // Skip to main content
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        padding: 8px 16px;
        background: var(--accent-cyan);
        color: var(--text-dark);
        z-index: 1000;
        transition: top 0.3s;
    `;
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ============================================
// Jobs Carousel
// ============================================

function initJobsCarousel() {
    const wrapper = document.querySelector('.jobs-carousel-wrapper');
    const carousel = document.querySelector('.jobs-carousel');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (!carousel || !prevBtn || !nextBtn || !dotsContainer) return;

    const cards = Array.from(carousel.querySelectorAll('.job-card'));
    let currentPage = 0;

    function getVisibleCount() {
        const w = window.innerWidth;
        if (w <= 768) return 1;
        if (w <= 1024) return 2;
        return 3;
    }

    function getMaxPage() {
        return Math.max(0, cards.length - getVisibleCount());
    }

    function buildDots() {
        dotsContainer.innerHTML = '';
        const totalPages = getMaxPage() + 1;
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === currentPage ? ' active' : '');
            dot.setAttribute('aria-label', 'Go to page ' + (i + 1));
            dot.addEventListener('click', () => goToPage(i));
            dotsContainer.appendChild(dot);
        }
    }

    function goToPage(page) {
        const maxPage = getMaxPage();
        currentPage = Math.max(0, Math.min(page, maxPage));

        // Calculate translate amount based on card width + gap
        const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
        const cardWidth = cards[0].offsetWidth + gap;
        const offset = currentPage * cardWidth;
        carousel.style.transform = 'translateX(-' + offset + 'px)';

        updateUI();
    }

    function updateUI() {
        const maxPage = getMaxPage();
        // Update arrows
        prevBtn.disabled = currentPage <= 0;
        nextBtn.disabled = currentPage >= maxPage;

        // Update dots
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentPage);
        });
    }

    prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

    // Touch/swipe support
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            goToPage(currentPage + (diff > 0 ? 1 : -1));
        }
    }, { passive: true });

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (currentPage > getMaxPage()) currentPage = getMaxPage();
            buildDots();
            goToPage(currentPage);
        }, 150);
    });

    // Initialize
    buildDots();
    goToPage(0);
}

// ============================================
// Demo Slideshow Animation
// ============================================

function initDemoSlideshow() {
    const slides = document.querySelectorAll('.demo-slide');
    const indicators = document.querySelectorAll('.indicator');

    if (!slides.length) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    const slideInterval = 3500; // 3.5 seconds per slide

    function showSlide(index) {
        // Remove active from all slides and indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));

        // Add active to current slide and indicator
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Initialize first slide
    showSlide(0);

    // Auto-advance slides
    setInterval(nextSlide, slideInterval);

    // Allow manual click on indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
        indicator.style.cursor = 'pointer';
    });
}

// ============================================
// Application Form
// ============================================

function initApplicationForm() {
    const form = document.getElementById('applicationForm');
    if (!form) return;

    // File drop zone handling
    const dropZone = form.querySelector('.file-drop-zone');
    const fileInput = form.querySelector('#app-documents');
    const fileList = form.querySelector('.file-list');

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            fileInput.files = e.dataTransfer.files;
            updateFileList(fileInput.files, fileList);
        });

        fileInput.addEventListener('change', () => updateFileList(fileInput.files, fileList));
    }

    // Form submission
    form.addEventListener('submit', handleApplicationSubmit);
}

function updateFileList(files, container) {
    container.innerHTML = '';
    Array.from(files).forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';
        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        item.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">(${sizeMB} MB)</span>
        `;
        container.appendChild(item);
    });
}

// Application Form Configuration
// After running setupForm() in Apps Script, replace these with your actual values:
const APPLICATION_FORM_CONFIG = {
    formUrl: 'https://docs.google.com/forms/d/e/1b7ZUaXwD7ZG-0ruTIuJ5zOJtejUzmvQ471TYJC3NTMI/formResponse',
    fields: {
        name: 'entry.1136904062',
        email: 'entry.351461911',
        role: 'entry.321013124',
        coverLetter: 'entry.1305207623',
        deadline: 'entry.1616421931',
        howHeard: 'entry.174526948'
    },
    appsScriptUrl: 'https://script.google.com/macros/s/AKfycbzALAW3LMry4NWRNYaS10UfNDpJsbNbMMwUDQ0mJM8KUUx-K7k16WvBRtEQzAY993sCLg/exec'
};

// Role label mapping for Google Form (must match exactly)
const ROLE_LABELS = {
    'creative-intern': 'Creative Intern',
    'software-intern': 'Software Development Intern',
    'public-health': 'Public Health Practicum',
    'tech-lead': 'Tech Lead'
};

// Source label mapping for Google Form
const SOURCE_LABELS = {
    'linkedin': 'LinkedIn',
    'university': 'University/College',
    'referral': 'Friend/Referral',
    'job-board': 'Job Board',
    'social-media': 'Social Media',
    'other': 'Other'
};

async function handleApplicationSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('.form-submit-btn');

    // Collect form data
    const name = form.querySelector('#app-name').value.trim();
    const email = form.querySelector('#app-email').value.trim();
    const role = form.querySelector('#app-role').value;
    const coverLetter = form.querySelector('#app-cover-letter').value.trim();
    const deadline = form.querySelector('#app-deadline').value;
    const howHeard = form.querySelector('#app-how-heard').value;
    const files = form.querySelector('#app-documents').files;

    // Validation
    if (!name || !email || !role) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.textContent = files.length > 0 ? 'Uploading documents...' : 'Submitting...';

    // Convert files to base64 for upload
    let fileData = [];
    if (files.length > 0) {
        try {
            fileData = await Promise.all(Array.from(files).map(async (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            data: reader.result.split(',')[1] // Remove data:mime;base64, prefix
                        });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }));
        } catch (err) {
            console.warn('File conversion error:', err);
        }
    }

    // Method 1: Submit to Google Form via hidden iframe (data backup - no files)
    if (APPLICATION_FORM_CONFIG.formUrl && APPLICATION_FORM_CONFIG.fields.name) {
        try {
            const iframeName = 'app-form-iframe-' + Date.now();
            const iframe = document.createElement('iframe');
            iframe.name = iframeName;
            iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;left:-9999px;';
            document.body.appendChild(iframe);

            const googleForm = document.createElement('form');
            googleForm.method = 'POST';
            googleForm.action = APPLICATION_FORM_CONFIG.formUrl;
            googleForm.target = iframeName;
            googleForm.style.display = 'none';

            const roleLabel = ROLE_LABELS[role] || role;
            const sourceLabel = SOURCE_LABELS[howHeard] || howHeard || '';

            const fields = [
                { name: APPLICATION_FORM_CONFIG.fields.name, value: name },
                { name: APPLICATION_FORM_CONFIG.fields.email, value: email },
                { name: APPLICATION_FORM_CONFIG.fields.role, value: roleLabel },
                { name: APPLICATION_FORM_CONFIG.fields.coverLetter, value: coverLetter },
                { name: APPLICATION_FORM_CONFIG.fields.howHeard, value: sourceLabel }
            ];

            // Date fields in Google Forms need _year, _month, _day suffixes
            if (deadline && APPLICATION_FORM_CONFIG.fields.deadline) {
                const d = new Date(deadline);
                fields.push({ name: APPLICATION_FORM_CONFIG.fields.deadline + '_year', value: d.getFullYear() });
                fields.push({ name: APPLICATION_FORM_CONFIG.fields.deadline + '_month', value: d.getMonth() + 1 });
                fields.push({ name: APPLICATION_FORM_CONFIG.fields.deadline + '_day', value: d.getDate() });
            }

            fields.forEach(field => {
                if (field.name && field.value) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = field.name;
                    input.value = field.value;
                    googleForm.appendChild(input);
                }
            });

            document.body.appendChild(googleForm);
            googleForm.submit();

            // Clean up after submission
            setTimeout(() => {
                iframe.remove();
                googleForm.remove();
            }, 3000);
        } catch (err) {
            console.warn('Google Form submission error:', err);
        }
    }

    // Method 2: Submit to Apps Script Web App (creates ClickUp task with attachments)
    if (APPLICATION_FORM_CONFIG.appsScriptUrl) {
        try {
            const payload = {
                name: name,
                email: email,
                role: ROLE_LABELS[role] || role,
                coverLetter: coverLetter,
                deadline: deadline,
                howHeard: SOURCE_LABELS[howHeard] || howHeard || '',
                files: fileData // Include base64 encoded files
            };

            // Use fetch with cors mode to actually get a response
            fetch(APPLICATION_FORM_CONFIG.appsScriptUrl, {
                method: 'POST',
                mode: 'no-cors', // Apps Script doesn't support CORS, so we can't read response
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(() => {
                console.log('Apps Script submission sent with ' + fileData.length + ' file(s)');
            }).catch(err => {
                console.warn('Apps Script submission error:', err);
            });
        } catch (err) {
            console.warn('Apps Script fetch error:', err);
        }
    }

    // Show success after brief delay (form data is being sent in background)
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
        form.style.display = 'none';
        document.getElementById('applicationFormSuccess').style.display = 'block';

        if (fileData.length > 0) {
            showToast(`Application submitted with ${fileData.length} document(s)!`, 'success');
        } else {
            showToast('Application submitted successfully!', 'success');
        }
    }, 2000);
}

// ============================================
// Initialize
// ============================================

function init() {
    // Navigation (with null checks for pages that may not have these elements)
    window.addEventListener('scroll', handleNavScroll);
    window.addEventListener('scroll', updateActiveNavLink);
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
    navLinks.forEach(link => link.addEventListener('click', handleNavLinkClick));

    // Forms
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', handleWaitlistSubmit);
    }
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    // Animations
    initScrollAnimations();
    initSmoothScrolling();
    initParallaxEffects();
    initAppDemoAnimation();
    initTypingEffect();
    initDemoSlideshow();
    initJobsCarousel();

    // Forms
    initApplicationForm();

    // Accessibility
    initAccessibility();

    // Initial navbar check
    handleNavScroll();

    console.log('Caribou Health website initialized');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================
// Export for potential module use
// ============================================

window.CaribouHealth = {
    showToast,
    animateCounter
};
