document.addEventListener("DOMContentLoaded", () => {

/* CONFIG */
const DEF = {
    links: [
        {n:"YouTube", u:"https://youtube.com"},
        {n:"Roblox", u:"https://roblox.com"},
        {n:"Proton", u:"https://mail.proton.me"}
    ],
    user: "Guest", eng: "google", acc: "#ffffff",
    font: "'Inter', sans-serif", scale: 8,
    wEn: true, wHide: false, cel: false,
    side: "left", fmt24: true, zen: false
};

let cfg = JSON.parse(localStorage.getItem('v9')) || DEF;

/* INIT */
function init() {
    const setVal = (id, v) => {
        const el = document.getElementById(id);
        if(el) el.value = v;
    };
    const setChk = (id, v) => {
        const el = document.getElementById(id);
        if(el) el.checked = v;
    };

    setVal('user', cfg.user);
    setVal('eng', cfg.eng);
    setVal('acc', cfg.acc);
    setVal('font', cfg.font);
    setVal('scale', cfg.scale);
    setChk('w-en', cfg.wEn);
    setChk('w-hide', cfg.wHide);
    setChk('cel', cfg.cel);
    setVal('side', cfg.side);
    setChk('fmt24', cfg.fmt24);
    setChk('zen', cfg.zen);

    live();
    loadBg();
    loadFav();
    render();
    renderManage();
    clock();
    weather();
    plh();
}

/* VISUALS */
function live() {
    const r = document.documentElement.style;
    r.setProperty('--accent', cfg.acc);
    r.setProperty('--font', cfg.font);

    const time = document.getElementById('time');
    if(time) time.style.fontSize = cfg.scale + 'rem';

    document.body.className = cfg.side === 'right' ? 'right-sidebar' : '';

    ['wthr','greet','bar'].forEach(id=>{
        const el = document.getElementById(id);
        if(!el) return;
        if(cfg.zen){
            el.style.opacity='0';
            el.style.pointerEvents='none';
        } else {
            el.style.opacity = (id==='wthr' && !cfg.wEn) ? '0' : '1';
            el.style.pointerEvents='auto';
        }
    });
}

/* CLOCK */
function clock() {
    const now = new Date();
    const hr = cfg.fmt24 ? {hour12:false} : {hour12:true};

    const time = document.getElementById('time');
    const date = document.getElementById('date');
    const greet = document.getElementById('greet');

    if(time) time.innerText = now.toLocaleTimeString('en-US',{...hr,hour:'2-digit',minute:'2-digit'});
    if(date) date.innerText = now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});

    const h = now.getHours();
    let msg = h<5?"Late Night":h<12?"Good Morning":h<18?"Good Afternoon":"Good Evening";
    if(greet) greet.innerText = `${msg}, ${cfg.user}`;

    setTimeout(clock,1000);
}

/* WEATHER */
function weather() {
    if(!cfg.wEn || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async p=>{
        try{
            const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.coords.latitude}&longitude=${p.coords.longitude}&current_weather=true`);
            const d = await r.json();
            let t = d.current_weather.temperature;
            let u = "°C";
            if(!cfg.cel){ t=(t*9/5)+32; u="°F"; }

            const wt = document.getElementById('w-temp');
            const wl = document.getElementById('w-loc');

            if(wt) wt.innerText = Math.round(t)+u;
            if(wl) wl.style.display = cfg.wHide?'none':'inline';
        }catch{}
    });
}

/* LINKS */
function render() {
    const l = document.getElementById('links');
    if(!l) return;
    l.innerHTML='';

    cfg.links.forEach(k=>{
        const i=document.createElement('li');
        i.className='item';
        i.onclick=()=>location.href=k.u;

        let d='google.com';
        try{ d=new URL(k.u).hostname; }catch{}

        i.innerHTML=`<div class="icon"><img class="favicon" src="https://www.google.com/s2/favicons?domain=${d}&sz=64"></div><span class="label">${k.n}</span>`;
        l.appendChild(i);
    });
}

function renderManage() {
    const m=document.getElementById('link-list');
    if(!m) return;
    m.innerHTML='';
    cfg.links.forEach((k,i)=>{
        const d=document.createElement('div');
        d.className='manage-item';
        d.innerHTML=`<span>${k.n}</span><i class="fa-solid fa-trash del-btn" onclick="delLink(${i})"></i>`;
        m.appendChild(d);
    });
}

/* SEARCH */
const search=document.getElementById('search');
if(search){
    search.addEventListener('keypress',e=>{
        if(e.key!=='Enter') return;
        let v=e.target.value;
        if(!v) return;
        if(v.includes('.')&&!v.includes(' ')){
            location.href=v.startsWith('http')?v:'https://'+v;
            return;
        }
        const urls={
            google:"https://google.com/search?q=",
            ddg:"https://duckduckgo.com/?q=",
            bing:"https://bing.com/search?q=",
            brave:"https://search.brave.com/search?q=",
            startpage:"https://startpage.com/do/search?q=",
            ecosia:"https://ecosia.org/search?q="
        };
        location.href=(urls[cfg.eng]||urls.google)+encodeURIComponent(v);
    });
}

/* FILES */
const file=document.getElementById('file');
if(file){
    file.onchange=e=>{
        const r=new FileReader();
        r.onload=ev=>{localStorage.setItem('v9bg',ev.target.result);loadBg();};
        r.readAsDataURL(e.target.files[0]);
    };
}

function loadBg(){
    const b=localStorage.getItem('v9bg');
    const bg=document.getElementById('bg');
    if(bg) bg.style.backgroundImage=b?`url(${b})`:`url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564')`;
}

/* WINDOW DRAG */
const winEl=document.getElementById('win');
const head=document.getElementById('drag');
let drag=false,sx,sy,lx,ly;

if(head){
    head.onmousedown=e=>{
        drag=true;sx=e.clientX;sy=e.clientY;
        const r=winEl.getBoundingClientRect();
        lx=r.left;ly=r.top;
        winEl.style.transform='none';
    };
}

window.onmousemove=e=>{
    if(!drag) return;
    winEl.style.left=(lx+e.clientX-sx)+'px';
    winEl.style.top=(ly+e.clientY-sy)+'px';
};
window.onmouseup=()=>drag=false;

init();
});
