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
});

