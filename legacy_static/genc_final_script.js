
// genc_final_script.js
document.addEventListener('DOMContentLoaded',()=>{
  const toggle=document.querySelector('.menu-toggle'); const nav=document.querySelector('.nav');
  if(toggle){toggle.addEventListener('click',()=>nav.classList.toggle('open'));}
  const obs=new IntersectionObserver(entries=>{entries.forEach(en=>{if(en.isIntersecting)en.target.classList.add('visible');});},{threshold:0.15});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
  if(location.pathname.endsWith('poster.html')){
    document.addEventListener('contextmenu',e=>e.preventDefault());
    document.addEventListener('keydown',e=>{if(e.ctrlKey&&(e.key==='s'||e.key==='p'||e.key==='u'))e.preventDefault();});
  }
});
