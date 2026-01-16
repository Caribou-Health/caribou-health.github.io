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
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

// Close mobile menu when clicking a link
function handleNavLinkClick(e) {
    if (navMenu.classList.contains('active')) {
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
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeGDdywNmGI5b2qebFiMJN4IJN24JpPcXiVC0fq4bSIVN8BZw/formResponse',
    viewUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeGDdywNmGI5b2qebFiMJN4IJN24JpPcXiVC0fq4bSIVN8BZw/viewform',
    fields: {
        name: 'entry.733572800',
        email: 'entry.1769692911',
        role: 'entry.1170592026'
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
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSejCRGtfjp6MlyRfsI-Em7vMm2TvCpADyz4Q4XKZuNtXLrXSA/formResponse',
    fields: {
        name: 'entry.176696630',
        email: 'entry.66249757',
        subject: 'entry.1734840493',
        message: 'entry.1077715039',
        feedbackSource: 'entry.34887441'
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
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in class
    document.querySelectorAll('.fade-in, .stagger-children').forEach(el => {
        observer.observe(el);
    });

    // Add fade-in class to sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

    // Add stagger animation to grids
    document.querySelectorAll('.about-grid, .features-grid, .jobs-grid').forEach(grid => {
        grid.classList.add('stagger-children');
        observer.observe(grid);
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
                if (check) check.textContent = '✓';

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
    // Handle keyboard navigation for mobile menu
    navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMobileMenu();
        }
    });

    // Trap focus in mobile menu when open
    navMenu.addEventListener('keydown', (e) => {
        if (!navMenu.classList.contains('active')) return;

        if (e.key === 'Escape') {
            toggleMobileMenu();
            navToggle.focus();
        }
    });

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
// Initialize
// ============================================

function init() {
    // Navigation
    window.addEventListener('scroll', handleNavScroll);
    window.addEventListener('scroll', updateActiveNavLink);
    navToggle.addEventListener('click', toggleMobileMenu);
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

// Initialize demo slideshow
document.addEventListener('DOMContentLoaded', () => {
    initDemoSlideshow();
});
