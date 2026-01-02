
// faculty.js - handles modal open/close and reveal
document.addEventListener('DOMContentLoaded', function() {
  // reveal on scroll for cards
  const cards = document.querySelectorAll('.card');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('reveal-visible'); obs.unobserve(en.target); } });
  }, {threshold: 0.12});
  cards.forEach(c=>obs.observe(c));

  // modal logic
  const modal = document.getElementById('facultyModal');
  const mImg = document.getElementById('m-img');
  const mName = document.getElementById('m-name');
  const mRole = document.getElementById('m-role');
  const mQual = document.getElementById('m-qual');
  const mExp = document.getElementById('m-exp');
  const mComp = document.getElementById('m-comp');

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', ()=>{
      const img = card.getAttribute('data-img');
      const name = card.getAttribute('data-name');
      const role = card.getAttribute('data-role');
      const qual = card.getAttribute('data-qual');
      const exp = card.getAttribute('data-exp');
      const comp = card.getAttribute('data-comp');
      mImg.src = img;
      mName.textContent = name;
      mRole.textContent = role;
      mQual.textContent = qual;
      mExp.textContent = exp;
      mComp.textContent = comp;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  // close handlers
  document.querySelector('.modal').addEventListener('click', function(e){
    if(e.target === this || e.target.classList.contains('close-btn')){
      this.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ document.getElementById('facultyModal').classList.remove('open'); document.body.style.overflow = ''; } });
});
