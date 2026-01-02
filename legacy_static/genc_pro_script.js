
// genc_pro_script.js
document.addEventListener('DOMContentLoaded', ()=>{
  // mobile menu (if present)
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  if(menuToggle) menuToggle.addEventListener('click', ()=> mainNav.classList.toggle('open'));

  // smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href.length>1){ e.preventDefault(); const el = document.querySelector(href); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  });

  // reveal on scroll
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('visible'); });
  }, { threshold:0.18 });
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

  // typing effect (improved)
  const typing = document.querySelector('.typing');
  if(typing){
    const text = typing.dataset.text || typing.textContent.trim();
    typing.textContent='';
    let i=0;
    const speed = 30;
    const loop = ()=>{
      if(i<text.length){ typing.textContent += text.charAt(i); i++; setTimeout(loop, speed); }
    };
    loop();
  }

  // hero parallax for circles
  const hero = document.querySelector('.hero');
  if(hero){
    hero.addEventListener('mousemove', (e)=>{
      const cx = window.innerWidth/2, cy = window.innerHeight/2;
      const dx = (e.clientX - cx)/cx, dy = (e.clientY - cy)/cy;
      document.querySelectorAll('.circles span').forEach((s, idx)=>{
        const mult = (idx+1)*8;
        s.style.transform = `translate(${dx*mult}px, ${dy*mult}px)`;
      });
    });
  }

  // protections for poster page
  if(location.pathname.endsWith('poster.html')){
    document.addEventListener('contextmenu', e=> e.preventDefault());
    document.addEventListener('keydown', function(e){ if(e.ctrlKey && (e.key==='s' || e.key==='p' || e.key==='u')) e.preventDefault(); });
    if(window.matchMedia){ try{ const mq = window.matchMedia('print'); mq.addListener(m=>{ if(m.matches) alert('Printing disabled for this view'); }); }catch(e){} }
  }
});
