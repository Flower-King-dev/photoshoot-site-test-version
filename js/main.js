// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.header__hamburger');
    const mobileMenu = document.querySelector('.header__mobile-menu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            mobileMenu.classList.toggle('header__mobile-menu--open');
        });
    }

    // Header Hide/Show on Scroll
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    let scrollThreshold = 10; // Minimum scroll distance to trigger hide/show
    
    if (header) {
        window.addEventListener('scroll', function() {
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Only trigger if scroll distance is significant
            if (Math.abs(currentScrollTop - lastScrollTop) < scrollThreshold) {
                return;
            }
            
            // At the top of the page, always show header
            if (currentScrollTop <= 0) {
                header.classList.remove('header--hidden');
                lastScrollTop = currentScrollTop;
                return;
            }
            
            // Scrolling down - hide header
            if (currentScrollTop > lastScrollTop) {
                header.classList.add('header--hidden');
            } 
            // Scrolling up - show header
            else {
                header.classList.remove('header--hidden');
            }
            
            lastScrollTop = currentScrollTop;
        }, { passive: true });
    }

    // Hero 3D Carousel: Optional - adjust rotation speed based on viewport
    const carouselContainer = document.querySelector('.hero__carousel-container');
    if (carouselContainer) {
        // Optional: Adjust rotation speed for different screen sizes
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            carouselContainer.style.animationDuration = '25s';
        }
    }

    // Q&A Accordion
    const qaItems = document.querySelectorAll('.qa__item');
    qaItems.forEach(item => {
        const question = item.querySelector('.qa__question');
        const answer = item.querySelector('.qa__answer');
        
        if (question && answer) {
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('qa__item--active');
                
                // Close all items
                qaItems.forEach(qaItem => {
                    const qaAnswer = qaItem.querySelector('.qa__answer');
                    if (qaAnswer) {
                        qaItem.classList.remove('qa__item--active');
                        qaAnswer.style.maxHeight = '0px';
                    }
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('qa__item--active');
                    // Calculate actual content height dynamically
                    // Temporarily set padding to match active state for accurate measurement
                    const originalPadding = answer.style.padding;
                    answer.style.padding = '16px 24px 24px 24px';
                    answer.style.maxHeight = 'none';
                    const trueHeight = answer.scrollHeight;
                    answer.style.maxHeight = '0px';
                    answer.style.padding = originalPadding;
                    // Force reflow to ensure measurement is accurate
                    void answer.offsetHeight;
                    // Set max-height to actual height with buffer to prevent truncation
                    answer.style.maxHeight = (trueHeight + 100) + 'px';
                }
            });
        }
    });

    // Falling Petals Effect
    createFallingPetals();
});

// Falling Petals Effect
function createFallingPetals() {
    // Check if container already exists
    let container = document.querySelector('.petals-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'petals-container';
        document.body.appendChild(container);
    }

    // Flower images array
    const flowerImages = [
        'flower/f11.png',
        'flower/f12.png',
        'flower/f13.png',
        'flower/f14.png',
        'flower/f15.png',
        'flower/f16.png'
    ];

    // Number of petals to create
    const petalCount = 20;
    
    // Create petals
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'falling-petal';
        
        const img = document.createElement('img');
        // Randomly select a flower image
        const randomFlower = flowerImages[Math.floor(Math.random() * flowerImages.length)];
        img.src = randomFlower;
        img.alt = 'Petal';
        
        petal.appendChild(img);
        
        // Random horizontal position
        const leftPosition = Math.random() * 100;
        petal.style.left = leftPosition + '%';
        
        // Random initial vertical position (from top to bottom of viewport)
        const viewportHeight = window.innerHeight;
        const initialY = -150 + Math.random() * (viewportHeight + 300); // -150px to (viewportHeight + 150px)
        petal.style.setProperty('--initial-y', initialY + 'px');
        petal.style.top = '0px'; // Start at top of container, use translateY for position
        
        // Random animation duration (10-20 seconds for variety)
        const duration = 10 + Math.random() * 10;
        petal.style.animationDuration = duration + 's';
        
        // Minimal delay to stagger the start slightly (0 to 2 seconds max)
        const delay = Math.random() * 2;
        petal.style.animationDelay = delay + 's';
        
        // Random size variation (15px to 35px)
        const size = 15 + Math.random() * 20;
        petal.style.width = size + 'px';
        petal.style.height = size + 'px';
        
        // Random rotation speed (360deg to 720deg for multiple rotations)
        const rotationSpeed = 360 + (Math.random() * 360);
        petal.style.setProperty('--rotation', rotationSpeed + 'deg');
        
        container.appendChild(petal);
    }
    
    // Update container height to match body/document height
    function updateContainerHeight() {
        const bodyHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight,
            window.innerHeight
        );
        container.style.height = bodyHeight + 'px';
        // Update CSS variable for animation
        document.documentElement.style.setProperty('--container-height', bodyHeight + 'px');
    }
    
    // Update on load, resize, and scroll
    updateContainerHeight();
    
    // Use requestAnimationFrame for smooth updates
    let lastHeight = 0;
    function checkHeight() {
        const currentHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );
        if (currentHeight !== lastHeight) {
            updateContainerHeight();
            lastHeight = currentHeight;
        }
        requestAnimationFrame(checkHeight);
    }
    requestAnimationFrame(checkHeight);
    
    window.addEventListener('resize', updateContainerHeight);
}

