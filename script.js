// ===== PARTICLE BACKGROUND =====
const canvas = document.getElementById('particleCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 60;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = document.getElementById('hero').offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,102,241,${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ===== HEADER SCROLL =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE MENU =====
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');
mobileToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
  mobileToggle.textContent = mobileMenu.classList.contains('active') ? '✕' : '☰';
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    mobileToggle.textContent = '☰';
  });
});

// ===== SCROLL ANIMATIONS WITH STAGGER =====
const fadeEls = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // stagger children cards
      const cards = entry.target.querySelectorAll('.benefit-card, .product-card, .pricing-card, .guarantee-card, .testimonial-card, .process-step, .faq-item');
      cards.forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.08}s`;
        card.classList.add('card-visible');
      });
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
fadeEls.forEach(el => observer.observe(el));

// ===== ANIMATED COUNTERS =====
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterEls = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
counterEls.forEach(el => counterObserver.observe(el));

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('active');
    // close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isOpen) item.classList.add('active');
  });
});

// ===== FORM TƯ VẤN (LEAD FORM) =====
const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const interest = document.getElementById('package').value;

    if (!name || !phone) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const btn = leadForm.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Đang xử lý...';

    const msg = encodeURIComponent(
      `Xin chào Lumina! Mình là ${name}, SĐT: ${phone}. Mình quan tâm gói: ${interest || 'chưa chọn'}. Cho mình xin thông tin ưu đãi nhé!`
    );

    // Gửi data tới Google Forms chạy ngầm
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScnAGtiNTmkpyYeijFDlbCcIe_i6ce_7jiSnejoEELQTuTWaw/formResponse';
    
    // Nối thêm thông tin Gói quan tâm vào mục Số điện thoại để dễ nhìn trên Google Sheets
    const phoneData = `${phone} (Gói: ${interest || 'Chưa chọn'})`;

    fetch(formUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        "entry.556413437": name, 
        "entry.1883712141": phoneData
      })
    }).catch(err => console.log('Gửi Form ẩn lỗi:', err));

    window.open(`https://zalo.me/0937872631?text=${msg}`, '_blank');
    leadForm.reset();
    btn.innerHTML = originalText;
  });
}

// ===== GIFT FORM =====
const giftForm = document.getElementById('giftForm');
if (giftForm) {
  giftForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('giftName').value.trim();
    const phone = document.getElementById('giftPhone').value.trim();
    
    if(!name || !phone) {
      alert('Vui lòng điền đủ tên và số điện thoại!');
      return;
    }
    
    const btn = giftForm.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Đang xử lý...';
    
    // Gửi data tới Google Forms chạy ngầm
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScnAGtiNTmkpyYeijFDlbCcIe_i6ce_7jiSnejoEELQTuTWaw/formResponse';

    const phoneData = `${phone} (Nhận Quà Zalo)`;

    fetch(formUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        "entry.556413437": name, 
        "entry.1883712141": phoneData
      })
    })
    .then(() => {
      alert('Đăng ký nhận quà thành công! Bấm OK để vào nhóm Zalo.');
      window.open('https://zalo.me/g/aguhpd664', '_blank');
      giftForm.reset();
      btn.innerHTML = originalText;
    })
    .catch(error => {
      alert('Đăng ký nhận quà thành công! Bấm OK để vào nhóm Zalo.');
      window.open('https://zalo.me/g/aguhpd664', '_blank');
      giftForm.reset();
      btn.innerHTML = originalText;
    });
  });
}

// ===== BACK TO TOP =====
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 600);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== MARQUEE PAUSE ON HOVER =====
const marquee = document.querySelector('.marquee-track');
if (marquee) {
  marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = 'paused');
  marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = 'running');
}
