// CONFIG
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

// INIT
function init() {
    // Inputs
    const setVal = (id, v) => { if(document.getElementById(id)) document.getElementById(id).value = v; }
    const setChk = (id, v) => { if(document.getElementById(id)) document.getElementById(id).checked = v; }

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
    loadBg(); loadFav(); render(); renderManage(); clock(); weather(); plh();
}

function save() {
    cfg.user = document.getElementById('user').value;
    cfg.eng = document.getElementById('eng').value;
    cfg.acc = document.getElementById('acc').value;
    cfg.font = document.getElementById('font').value;
    cfg.scale = document.getElementById('scale').value;
    cfg.wEn = document.getElementById('w-en').checked;
    cfg.wHide = document.getElementById('w-hide').checked;
    cfg.cel = document.getElementById('cel').checked;
    cfg.side = document.getElementById('side').value;
    cfg.fmt24 = document.getElementById('fmt24').checked;
    cfg.zen = document.getElementById('zen').checked;

    localStorage.setItem('v9', JSON.stringify(cfg));
    live(); weather();
}

// VISUALS
function live() {
    const r = document.documentElement.style;
    r.setProperty('--accent', cfg.acc);
    r.setProperty('--font', cfg.font);
    document.getElementById('time').style.fontSize = cfg.scale + 'rem';
    document.body.className = cfg.side === 'right' ? 'right-sidebar' : '';
    
    const els = ['wthr', 'greet', 'bar'];
    els.forEach(id => {
        const el = document.getElementById(id);
        if(cfg.zen) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
        else { el.style.opacity = (id==='wthr' && !cfg.wEn) ? '0' : '1'; el.style.pointerEvents = 'auto'; }
    });
}

// CLOCK
function clock() {
    const now = new Date();
    const hr = cfg.fmt24 ? {hour12:false} : {hour12:true};
    document.getElementById('time').innerText = now.toLocaleTimeString('en-US', {...hr, hour:'2-digit', minute:'2-digit'});
    document.getElementById('date').innerText = now.toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'});
    
    const h = now.getHours();
    let msg = "Welcome";
    if(h<5) msg = "Late Night"; else if(h<12) msg = "Good Morning";
    else if(h<18) msg = "Good Afternoon"; else msg = "Good Evening";
    document.getElementById('greet').innerText = `${msg}, ${cfg.user}`;
    setTimeout(clock, 1000);
}

// WEATHER
function weather() {
    if(!cfg.wEn || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async p => {
        const {latitude, longitude} = p.coords;
        try {
            const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const d = await r.json();
            let t = d.current_weather.temperature;
            let u = "°C";
            if(!cfg.cel) { t = (t*9/5)+32; u = "°F"; }
            document.getElementById('w-temp').innerText = Math.round(t)+u;
            document.getElementById('w-loc').style.display = cfg.wHide ? 'none' : 'inline';
        } catch(e) {}
    });
}

// LINKS
function render() {
    const l = document.getElementById('links'); l.innerHTML = '';
    cfg.links.forEach(k => {
        const i = document.createElement('li'); i.className = 'item';
        i.onclick = () => window.location.href = k.u;
        
        let domain = 'google.com';
        try { domain = new URL(k.u).hostname; } catch(e) {}
        
        i.innerHTML = `<div class="icon"><img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" class="favicon"></div><span class="label">${k.n}</span>`;
        l.appendChild(i);
    });
}

function renderManage() {
    const m = document.getElementById('link-list'); m.innerHTML = '';
    cfg.links.forEach((k, idx) => {
        const d = document.createElement('div'); d.className = 'manage-item';
        d.innerHTML = `<span>${k.n}</span><i class="fa-solid fa-trash del-btn" onclick="delLink(${idx})"></i>`;
        m.appendChild(d);
    });
}

// ADD LINK (STRICT MODE)
function addLink() {
    const n = document.getElementById('ln-name').value;
    const u = document.getElementById('ln-url').value;

    if (n && u) {
        // STRICT CHECK
        if (!u.startsWith('https://')) {
            alert("Please Put Https:// before your shortcut");
            return;
        }
        
        cfg.links.push({n, u}); 
        save(); 
        render(); 
        renderManage();
        
        // Clear inputs
        document.getElementById('ln-name').value = '';
        document.getElementById('ln-url').value = '';
    }
}

function delLink(i) {
    cfg.links.splice(i, 1); save(); render(); renderManage();
}

// SEARCH
document.getElementById('search').addEventListener('keypress', e => {
    if(e.key === 'Enter') {
        let v = e.target.value; if(!v) return;
        if(v.includes('.') && !v.includes(' ')) { window.location.href = v.startsWith('http') ? v : 'https://'+v; return; }
        const urls = {
            google: "https://google.com/search?q=", ddg: "https://duckduckgo.com/?q=",
            bing: "https://bing.com/search?q=", brave: "https://search.brave.com/search?q=",
            startpage: "https://startpage.com/do/search?q=", ecosia: "https://ecosia.org/search?q="
        };
        window.location.href = (urls[cfg.eng] || urls.google) + encodeURIComponent(v);
    }
});
function plh() {
    const t = ["Command", "Search", "Execute", "Find", "Query"];
    document.getElementById('search').placeholder = t[Math.floor(Math.random()*t.length)] + "...";
}

// SYSTEM
document.getElementById('file').addEventListener('change', e => {
    const r = new FileReader();
    r.onload = ev => { localStorage.setItem('v9bg', ev.target.result); loadBg(); };
    r.readAsDataURL(e.target.files[0]);
});
function loadBg() {
    const b = localStorage.getItem('v9bg');
    if(b) document.getElementById('bg').style.backgroundImage = `url(${b})`;
    else document.getElementById('bg').style.backgroundImage = `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564')`;
}

// FAVICON
document.getElementById('fav-up').addEventListener('change', e => {
    const r = new FileReader();
    r.onload = ev => { localStorage.setItem('v9fav', ev.target.result); loadFav(); };
    r.readAsDataURL(e.target.files[0]);
});
function loadFav() {
    const f = localStorage.getItem('v9fav');
    if(f) document.getElementById('favicon').href = f;
}

function wipe() { 
    localStorage.removeItem('v9'); 
    localStorage.removeItem('v9bg'); 
    localStorage.removeItem('v9fav');
    location.reload(); 
}

// WINDOW
const winEl = document.getElementById('win');
const head = document.getElementById('drag');
let drag=false, sx, sy, lx, ly;

function win(s) { if(s) { winEl.classList.add('show'); renderManage(); } else { winEl.classList.remove('show'); save(); } }
function tab(i) {
    document.querySelectorAll('.panel').forEach(e=>e.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));
    document.getElementById('tab-'+i).classList.add('active');
    event.target.classList.add('active');
}

head.onmousedown = e => {
    drag=true; sx=e.clientX; sy=e.clientY;
    const r=winEl.getBoundingClientRect(); lx=r.left; ly=r.top;
    winEl.style.transform='none'; winEl.style.left=lx+'px'; winEl.style.top=ly+'px';
};
window.onmousemove = e => {
    if(!drag) return;
    winEl.style.left = (lx + e.clientX - sx) + 'px';
    winEl.style.top = (ly + e.clientY - sy) + 'px';
};
window.onmouseup = () => drag=false;

init();
