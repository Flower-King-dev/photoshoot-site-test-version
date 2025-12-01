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

    // Hero Carousel Swipe Functionality
    initHeroCarousel();

    // Match side images height to main image height in mobile
    matchGalleryHeights();
    window.addEventListener('resize', matchGalleryHeights);
    
    // Recalculate heights after images load
    const galleryImages = document.querySelectorAll('.model-detail__main-image img, .event-detail__main-image img');
    galleryImages.forEach(img => {
        if (img.complete) {
            matchGalleryHeights();
        } else {
            img.addEventListener('load', matchGalleryHeights);
        }
    });
});

// Hero Carousel with Drag Support
function initHeroCarousel() {
    const carousel = document.querySelector('.hero__carousel');
    const container = document.querySelector('.hero__carousel-container');
    const slides = document.querySelectorAll('.hero__slide');
    
    if (!carousel || !container) return;

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let animationFrameId = null;
    let baseTranslate = 0;
    let isPaused = false;
    let resumeTimeout = null;
    const dragSpeed = 0.3; // ドラッグ時のスクロール速度倍率（移動距離を小さくする）
    
    // 慣性用の変数
    let velocity = 0; // 現在の速度
    let lastMouseX = 0; // 前回のマウスX座標（速度計算用）
    let lastMouseTime = 0; // 前回のマウス移動時間（速度計算用）
    let isInertiaScrolling = false; // 慣性スクロール中かどうか
    const friction = 0.96; // 摩擦係数（減速率）- 小さくすると減速が速くなり、慣性が短くなる
    const minVelocity = 0.3; // 最小速度（これ以下で停止）- 大きくすると早く停止する
    const fixedVelocity = 9.0; // 固定速度（マウスの移動速度に関係なく一定の速度）- 大きくすると速度が速くなる
    
    // スライドの幅とギャップを計算
    function getSlideDimensions() {
        if (slides.length === 0) return { width: 500, gap: 48 };
        const firstSlide = slides[0];
        const rect = firstSlide.getBoundingClientRect();
        const slideWidth = rect.width;
        const slideStyle = window.getComputedStyle(firstSlide);
        const gap = parseInt(slideStyle.marginRight) || 48;
        return { width: slideWidth, gap: gap };
    }
    
    // 1セット分の幅を計算（8枚分）
    function getOneSetWidth() {
        const { width, gap } = getSlideDimensions();
        return (width * 8) + (gap * 8);
    }
    
    // 位置をループ範囲内に調整（ギャップを防ぐ）
    function normalizePosition(pos) {
        const oneSetWidth = getOneSetWidth();
        // 負の値なので、範囲は -oneSetWidth から 0 の間
        // 範囲外に出た場合は、ループ範囲内に戻す
        while (pos > 0) {
            pos = pos - oneSetWidth;
        }
        while (pos < -oneSetWidth) {
            pos = pos + oneSetWidth;
        }
        return pos;
    }

    // アニメーションの現在位置を取得
    function getCurrentAnimationPosition() {
        const style = window.getComputedStyle(container);
        const transform = style.transform;
        if (transform === 'none' || !transform) return 0;
        
        // matrixまたはmatrix3dからtranslateX値を抽出
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
            const values = matrix[1].split(',').map(v => parseFloat(v.trim()));
            return values[4] || 0; // matrixの5番目の値がtranslateX
        }
        
        const matrix3d = transform.match(/matrix3d\(([^)]+)\)/);
        if (matrix3d) {
            const values = matrix3d[1].split(',').map(v => parseFloat(v.trim()));
            return values[12] || 0; // matrix3dの13番目の値がtranslateX
        }
        
        return 0;
    }
    
    // スムーズなアニメーション用の更新関数
    function updatePosition() {
        if (isDragging) {
            container.style.transform = `translateX(${currentTranslate}px)`;
            animationFrameId = requestAnimationFrame(updatePosition);
        } else if (isInertiaScrolling) {
            // 慣性スクロール中
            velocity *= friction; // 減速
            currentTranslate += velocity;
            
            // 位置を正規化（ギャップを防ぐ）
            currentTranslate = normalizePosition(currentTranslate);
            
            container.style.transform = `translateX(${currentTranslate}px)`;
            
            // 速度が閾値以下になったら停止
            if (Math.abs(velocity) < minVelocity) {
                isInertiaScrolling = false;
                velocity = 0;
                currentTranslate = normalizePosition(currentTranslate);
                container.style.transform = `translateX(${currentTranslate}px)`;
                baseTranslate = currentTranslate;
                
                // 2秒後に自動回転を再開（右から左へ）
                resumeTimeout = setTimeout(() => {
                    resumeAnimation();
                }, 2000);
            } else {
                animationFrameId = requestAnimationFrame(updatePosition);
            }
        }
    }
    
    // アニメーションを再開する関数
    function resumeAnimation() {
        isPaused = false;
        
        // 速度を完全にリセット（一貫した慣性を保証）
        velocity = 0;
        lastMouseX = 0;
        lastMouseTime = performance.now();
        
        // 現在位置をループ範囲内に調整（シームレスなループを維持）
        const oneSetWidth = getOneSetWidth();
        let resetPosition = normalizePosition(currentTranslate);
        
        // アニメーションを完全にクリア
        container.style.animation = 'none';
        container.style.transform = '';
        
        // 強制的に再計算（レイアウトを更新）
        void container.offsetHeight;
        
        // 位置を保持したまま設定（慣性が消えた位置からアニメーションを開始）
        container.style.transform = `translateX(${resetPosition}px)`;
        void container.offsetHeight;
        
        // アニメーションの進行度を計算（0%から100%の間で）
        // アニメーションは 0 から -oneSetWidth まで動くので、
        // 現在位置をアニメーションの進行度に変換
        const animationProgress = Math.abs(resetPosition) / oneSetWidth;
        const animationDuration = window.innerWidth <= 480 ? 90 : 
                                  window.innerWidth <= 768 ? 105 : 120;
        
        // アニメーションの開始時間を調整（現在位置から開始するように）
        // 負のdelayを使用して、アニメーションを途中から開始
        // これにより、慣性が消えた位置からアニメーションが開始され、常に同じ速度で流れる
        const animationDelay = -(animationProgress * animationDuration);
        
        // 適切なアニメーションを設定（常に右から左へ、同じ速度）
        // animation-delayを使用して、現在位置からアニメーションを開始
        if (window.innerWidth <= 480) {
            container.style.animation = `slideHorizontalMobile 90s linear ${animationDelay}s infinite`;
        } else if (window.innerWidth <= 768) {
            container.style.animation = `slideHorizontalTablet 105s linear ${animationDelay}s infinite`;
        } else {
            container.style.animation = `slideHorizontal 120s linear ${animationDelay}s infinite`;
        }
        
        // 位置を更新（アニメーション再開後の基準位置）
        currentTranslate = resetPosition;
        baseTranslate = resetPosition;
    }

    // マウス/タッチ開始
    function handleStart(e) {
        // 慣性スクロールを完全に停止（速度が累積されないように）
        isInertiaScrolling = false;
        velocity = 0; // 速度を確実に0にリセット
        
        // アニメーションフレームを確実にキャンセル
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // 既存のリジュームタイマーをクリア
        if (resumeTimeout) {
            clearTimeout(resumeTimeout);
            resumeTimeout = null;
        }
        
        // 速度とマウス位置の追跡を完全にリセット（一貫した慣性を保証）
        // これらは常に同じ初期値から開始される
        velocity = 0; // 再度確実に0にリセット
        lastMouseX = 0; // 0にリセット（最初の移動で速度計算をスキップするため）
        lastMouseTime = performance.now();
        
        isDragging = true;
        isPaused = true;
        
        // アニメーションを完全に停止して現在位置を取得
        container.style.animation = 'none';
        // 強制的に再計算（レイアウトを更新）
        void container.offsetHeight;
        
        // 現在位置を取得（アニメーション停止後の正確な位置）
        baseTranslate = getCurrentAnimationPosition();
        // 位置を正規化（ループ範囲内に）
        baseTranslate = normalizePosition(baseTranslate);
        
        // 現在の位置を手動で設定（アニメーションを上書き）
        container.style.transform = `translateX(${baseTranslate}px)`;
        
        // 位置を更新
        currentTranslate = baseTranslate;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        startX = clientX;
        // lastMouseXは0のまま（最初の移動で速度計算をスキップするため）
        // これにより、最初の移動で速度が0から始まり、一貫性が保たれる
        lastMouseTime = performance.now();
        
        // スムーズなアニメーションを開始（新しいフレームを開始）
        animationFrameId = requestAnimationFrame(updatePosition);
        
        e.preventDefault();
    }

    // マウス/タッチ移動
    function handleMove(e) {
        if (!isDragging) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const diffX = (clientX - startX) * dragSpeed;
        currentTranslate = baseTranslate + diffX;
        
        // 位置をループ範囲内に正規化（ギャップを防ぐ）
        currentTranslate = normalizePosition(currentTranslate);
        
        // 速度を計算（慣性用）- 固定速度を使用（マウスの移動速度に関係なく一定）
        const currentTime = performance.now();
        const deltaTime = currentTime - lastMouseTime;
        
        // 速度計算の条件を厳密にする（一貫性を保つため）
        if (deltaTime > 0 && deltaTime < 100 && lastMouseX !== 0) {
            const deltaMouseX = clientX - lastMouseX;
            // マウスの移動方向を検出（左: 負、右: 正）
            const direction = deltaMouseX < 0 ? -1 : 1;
            // 固定速度を使用（マウスの移動速度に関係なく一定）
            // 方向に応じて速度を設定（左に動かすと負、右に動かすと正）
            velocity = fixedVelocity * direction;
        } else if (lastMouseX === 0) {
            // 最初の移動時は速度を0に（一貫性を保つため）
            velocity = 0;
        } else {
            // 異常な時間差の場合は速度を保持（累積を防ぐため、0にはしない）
            // ただし、これは通常発生しない
        }
        
        // マウス位置と時間を更新（次の速度計算のため）
        lastMouseX = clientX;
        lastMouseTime = currentTime;
        
        e.preventDefault();
    }

    // マウス/タッチ終了
    function handleEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        
        // 最終位置を正規化
        currentTranslate = normalizePosition(currentTranslate);
        container.style.transform = `translateX(${currentTranslate}px)`;
        
        // 速度が十分大きい場合は慣性スクロールを開始
        // 速度の絶対値を確認（累積を防ぐため）
        const currentVelocity = Math.abs(velocity);
        if (currentVelocity > minVelocity) {
            // 慣性スクロールを開始（速度は現在の値を使用、累積しない）
            isInertiaScrolling = true;
            // アニメーションフレームを確実にキャンセルしてから再開
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(updatePosition);
        } else {
            // 速度が小さい場合は即座に停止
            velocity = 0;
            isInertiaScrolling = false;
            baseTranslate = currentTranslate;
            
            // 2秒後に自動回転を再開（右から左へ）
            resumeTimeout = setTimeout(() => {
                resumeAnimation();
            }, 2000);
        }
    }

    // イベントリスナーを追加
    // マウスイベント（グローバルに設定して、マウスが要素外に出ても動作するように）
    carousel.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    
    // タッチイベント
    carousel.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd, { passive: false });
}

// Match gallery side images height to main image height in mobile
function matchGalleryHeights() {
    // Only apply in mobile view (max-width: 768px)
    if (window.innerWidth > 768) {
        // Reset heights in desktop view
        const sideImages = document.querySelectorAll('.model-detail__side-images, .event-detail__side-images');
        sideImages.forEach(side => {
            side.style.height = '';
            side.style.maxHeight = '';
        });
        return;
    }

    // Model detail gallery
    const modelMainImage = document.querySelector('.model-detail__main-image');
    const modelSideImages = document.querySelector('.model-detail__side-images');
    if (modelMainImage && modelSideImages) {
        const mainHeight = modelMainImage.offsetHeight;
        modelSideImages.style.height = mainHeight + 'px';
        modelSideImages.style.maxHeight = mainHeight + 'px';
    }

    // Event detail gallery
    const eventMainImage = document.querySelector('.event-detail__main-image');
    const eventSideImages = document.querySelector('.event-detail__side-images');
    if (eventMainImage && eventSideImages) {
        const mainHeight = eventMainImage.offsetHeight;
        eventSideImages.style.height = mainHeight + 'px';
        eventSideImages.style.maxHeight = mainHeight + 'px';
    }
}

