const menuBtn=document.querySelector('.menu-btn');const nav=document.querySelector('.nav');if(menuBtn){menuBtn.addEventListener('click',()=>nav.classList.toggle('open'));}
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('show');});},{threshold:.15});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
