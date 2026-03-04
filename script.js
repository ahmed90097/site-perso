/* ========================================
   Mangach Travaux - JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');

    function handleNavScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll);
    handleNavScroll();

    // --- Mobile menu toggle ---
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('open');
        navToggle.classList.toggle('active');
    });

    // Close menu on link click
    document.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            navMenu.classList.remove('open');
            navToggle.classList.remove('active');
        });
    });

    // --- Active nav link on scroll ---
    const sections = document.querySelectorAll('section[id]');

    function highlightNavLink() {
        var scrollY = window.scrollY + 100;

        sections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');
            var link = document.querySelector('.nav-link[href="#' + id + '"]');

            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    document.querySelectorAll('.nav-link').forEach(function (l) {
                        l.classList.remove('active');
                    });
                    link.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);

    // --- Scroll animations (fade-in) ---
    var fadeElements = document.querySelectorAll(
        '.service-card, .realisation-item, .avantage-item, .info-card, .contact-card, .secteur-item'
    );

    fadeElements.forEach(function (el) {
        el.classList.add('fade-in');
    });

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(function (el) {
        observer.observe(el);
    });

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            var targetId = this.getAttribute('href');
            var target = document.querySelector(targetId);
            if (target) {
                var offset = navbar.offsetHeight + 20;
                var top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // --- Contact form handling (send to backend /send) ---
    var contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var btn = contactForm.querySelector('button[type="submit"]');
        var originalText = btn.innerHTML;

        var formData = {
            nom: document.getElementById('nom').value,
            email: document.getElementById('email').value,
            telephone: document.getElementById('telephone').value,
            sujet: document.getElementById('sujet').value,
            message: document.getElementById('message').value
        };

        btn.innerHTML = '<span>Envoi en cours...</span>';
        btn.disabled = true;

        fetch('/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        }).then(function (res) {
            if (res.ok) return res.json();
            return res.json().then(function (j) { throw j; });
        }).then(function (data) {
            btn.innerHTML = '<span>Message Envoye !</span>';
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            setTimeout(function () {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
                contactForm.reset();
            }, 2500);
        }).catch(function (err) {
            console.error('Send error', err);
            btn.innerHTML = '<span>Erreur d envoi</span>';
            btn.style.background = 'linear-gradient(135deg, #e53e3e, #c20000)';
            setTimeout(function () {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        });
    });

    // --- Service cards stagger animation ---
    var serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(function (card, i) {
        card.style.transitionDelay = (i * 0.1) + 's';
    });

    var realisationItems = document.querySelectorAll('.realisation-item');
    realisationItems.forEach(function (item, i) {
        item.style.transitionDelay = (i * 0.08) + 's';
    });

    // --- Lightbox for gallery images ---
    var lightbox = document.getElementById('lightbox');
    if (lightbox) {
        var lbImg = lightbox.querySelector('.lightbox-content img');
        var lbCaption = lightbox.querySelector('.lightbox-caption');
        var images = Array.prototype.slice.call(document.querySelectorAll('.lightbox-image'));
        var currentIndex = 0;

        function openLightbox(index) {
            currentIndex = index;
            var data = images[currentIndex];
            lbImg.src = data.src;
            lbImg.alt = data.alt || '';
            lbCaption.textContent = data.alt || '';
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            lbImg.src = '';
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % images.length;
            openLightbox(currentIndex);
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            openLightbox(currentIndex);
        }

        images.forEach(function (img, i) {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', function () {
                openLightbox(i);
            });
        });

        lightbox.addEventListener('click', function (e) {
            var action = e.target.getAttribute('data-action');
            if (action === 'close') closeLightbox();
            if (action === 'next') showNext();
            if (action === 'prev') showPrev();
        });

        // Buttons inside panel
        var btnClose = lightbox.querySelector('.lightbox-close');
        var btnNext = lightbox.querySelector('.lightbox-next');
        var btnPrev = lightbox.querySelector('.lightbox-prev');
        btnClose && btnClose.addEventListener('click', closeLightbox);
        btnNext && btnNext.addEventListener('click', showNext);
        btnPrev && btnPrev.addEventListener('click', showPrev);

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        });

        // Simple touch swipe support
        (function () {
            var startX = 0;
            var threshold = 50;
            var panel = lightbox.querySelector('.lightbox-panel');
            if (!panel) return;
            panel.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; });
            panel.addEventListener('touchend', function (e) {
                var dx = e.changedTouches[0].clientX - startX;
                if (dx > threshold) showPrev();
                if (dx < -threshold) showNext();
            });
        })();
    }
});