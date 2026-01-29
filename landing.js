// Scroll Reveal Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

// Observe all scroll-reveal elements
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));
});

// Platform Tab Switching
const platformTabs = document.querySelectorAll('.platform-tab');
const platformContents = document.querySelectorAll('.platform-content');

platformTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const platform = tab.dataset.platform;
        
        // Remove active class from all tabs and contents
        platformTabs.forEach(t => t.classList.remove('active'));
        platformContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.querySelector(`.platform-content[data-platform="${platform}"]`).classList.add('active');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax effect for hero visual
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroVisual) {
        const parallaxSpeed = 0.5;
        heroVisual.style.transform = `translate(-50%, calc(-50% + ${scrolled * parallaxSpeed}px))`;
    }
    
    ticking = false;
}

function requestParallaxTick() {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestParallaxTick);

// Stagger animation to feature cards
document.addEventListener('DOMContentLoaded', () => {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    const useCases = document.querySelectorAll('.use-case');
    useCases.forEach((useCase, index) => {
        useCase.style.transitionDelay = `${index * 0.1}s`;
    });

    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.style.transitionDelay = `${index * 0.15}s`;
    });
});

// Nav background on scroll and fade at bottom
let lastScroll = 0;
const nav = document.querySelector('.nav');
const ctaSection = document.querySelector('.cta-section');

function updateNav() {
    const currentScroll = window.pageYOffset;
    const ctaPosition = ctaSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    // Fade out nav when CTA section is in view
    if (ctaPosition < windowHeight / 2) {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
    }
    
    lastScroll = currentScroll;
}

window.addEventListener('scroll', updateNav);
window.addEventListener('load', updateNav);

// Mouse trail effect 
let mouseX = 0;
let mouseY = 0;
let mouseTrailX = 0;
let mouseTrailY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateMouseTrail() {
    mouseTrailX += (mouseX - mouseTrailX) * 0.1;
    mouseTrailY += (mouseY - mouseTrailY) * 0.1;
    
    requestAnimationFrame(animateMouseTrail);
}

animateMouseTrail();

// Hover effect of buttons
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        if (!this.classList.contains('btn-secondary')) {
            this.style.transform = 'translateY(0)';
        }
    });
});

// Counter animation for hero badge
let rotationAngle = 0;
function rotateBadgeIcon() {
    rotationAngle += 1;
    const icon = document.querySelector('.hero-badge svg');
    if (icon) {
        icon.style.transform = `rotate(${rotationAngle}deg)`;
    }
    requestAnimationFrame(rotateBadgeIcon);
}
rotateBadgeIcon();