document.addEventListener('DOMContentLoaded',()=>{
 const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:.2});
 document.querySelectorAll('[data-anim]').forEach(el=>obs.observe(el));
 const t=document.querySelector('.typing');if(t){const text=t.textContent;t.textContent='';let i=0;const iv=setInterval(()=>{t.textContent+=text[i];i++;if(i>=text.length)clearInterval(iv)},50)}
 if(location.pathname.endsWith('poster.html')){document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('keydown',e=>{if(e.ctrlKey&&(e.key==='s'||e.key==='p'||e.key==='u'))e.preventDefault()})}
});