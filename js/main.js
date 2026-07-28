// Eastern Orchid - Main JS
document.addEventListener('DOMContentLoaded', function() {
  // Mobile nav: close on outside click
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (navToggle) {
    navToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      navLinks.classList.toggle('open');
    });
    
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav-inner')) {
        navLinks.classList.remove('open');
      }
    });
  }
  
  // Active nav link based on current path
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    const href = link.getAttribute('href');
    if (currentPath === '/' || currentPath.endsWith('index.html')) {
      if (href === 'index.html' || href === './') {
        link.classList.add('active');
      }
    } else if (href && currentPath.includes(href.replace('index.html', '').replace('./', ''))) {
      link.classList.add('active');
    }
  });
});
