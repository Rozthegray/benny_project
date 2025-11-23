(function(){
  const supportsIO = 'IntersectionObserver' in window;

  function toggleVisible(el, isVisible){
    if(isVisible){
      el.classList.add('is-visible');
    } else {
      el.classList.remove('is-visible');
    }
  }

  function observeAll(selectorList) {
    const els = document.querySelectorAll(selectorList);
    if(!els.length) return;

    if(supportsIO){
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          toggleVisible(entry.target, entry.isIntersecting);
        });
      }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.12
      });

      els.forEach(e => io.observe(e));
    } else {
      // fallback: reveal all immediately
      els.forEach(el => el.classList.add('is-visible'));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    observeAll('.reveal, .reveal-left, .reveal-right, .reveal-bottom, .reveal-stagger');
  });
})();