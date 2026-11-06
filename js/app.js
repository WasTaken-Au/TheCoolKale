(()=>{
const C=window.KALE,P=document.body.dataset.page,$=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rd=(st,k,d)=>{try{return JSON.parse(st.getItem(k))??d}catch{return d}},wr=(st,k,v)=>{try{st.setItem(k,JSON.stringify(v))}catch{}};
const LS=localStorage,SS=sessionStorage;

/* ---- Auth + storage (client-side only; see README to swap in a real backend) ---- */
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
async function hash(pw,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
 return b64(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:150000,salt:Uint8Array.from(atob(salt),c=>c.charCodeAt(0))},k,256))}
const users=()=>rd(LS,'kale:users',{});
const sess=()=>{for(const s of[SS,LS]){const v=rd(s,'kale:session',null);if(v&&(!v.exp||v.exp>Date.now()))return v}return null};
const rec=()=>{const s=sess();return s&&(s.id==='guest'?rd(SS,'kale:guest',null):users()[s.id])};
const save=fn=>{const s=sess(),r=rec();fn(r);if(s.id==='guest')wr(SS,'kale:guest',r);else{const u=users();u[s.id]=r;wr(LS,'kale:users',u)}};
const start=(id,keep)=>wr(keep?LS:SS,'kale:session',{id,exp:keep?Date.now()+30*864e5:0});
const logout=()=>{SS.removeItem('kale:session');LS.removeItem('kale:session');location.href='index.html'};
async function signUp(email,pw){
 if(!/^\S+@\S+\.\S+$/.test(email))throw Error('Enter a valid email address.');
 if(pw.length<8)throw Error('Use at least 8 characters for your password.');
 const u=users();if(u[email])throw Error('An account with this email already exists. Try signing in.');
 const salt=b64(crypto.getRandomValues(new Uint8Array(16)));
 u[email]={salt,hash:await hash(pw,salt),profile:null,progress:{}};wr(LS,'kale:users',u);start(email,true)}
async function signIn(email,pw,keep){
 const u=users()[email];
 if(!u||await hash(pw,u.salt)!==u.hash)throw Error('Email or password is incorrect.');start(email,keep)}

/* ---- Guard ---- */
const s0=sess(),r0=rec();
if(P==='login'){if(s0&&r0){location.replace(r0.profile?'home.html':'startup.html');return}}
else if(!s0||!r0){location.replace('index.html');return}
else if(!r0.profile&&P!=='startup'){location.replace('startup.html');return}

/* ---- Helpers ---- */
const LEAF='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#86c99a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8"/></svg>';
const flat=s=>s.groups.flatMap(g=>g.topics);
const subjOf=id=>C.subjects.find(s=>flat(s).some(t=>t.id===id));
const rich=h=>h.split(/(?:<br>\s*){2,}/).map(p=>'<p>'+p.split('<br>').map(l=>`<span class="ln">${l}</span>`).join('')+'</p>').join('');
const prog=()=>rec().progress,state=id=>{const p=prog()[id];return p?.done?'done':p?'doing':'new'};
const main=$('#main'),still=matchMedia('(prefers-reduced-motion:reduce)').matches;
const lvl=xp=>Math.floor(xp/100)+1,day=o=>new Date(Date.now()-o*864e5).toLocaleDateString('en-CA');
const streakNow=s=>s.last===day(0)||s.last===day(1)?s.streak:0;
function chips(){const s=rec().stats||{xp:0,streak:0},a=$('#chS'),b=$('#chX');if(!a)return;a.textContent='🔥 '+streakNow(s);a.title='Day streak';b.textContent='⭐ Lv '+lvl(s.xp)+' · '+s.xp+' XP'}
function pop(t,el){const b=el?.getBoundingClientRect(),e=document.createElement('span');e.className='pop';e.textContent=t;e.style.left=(b?b.left+b.width/2:innerWidth/2)+'px';e.style.top=(b?b.top:innerHeight/2)+'px';document.body.append(e);setTimeout(()=>e.remove(),1000)}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),2700)}
function confetti(n=150,el){if(still)return;const c=document.createElement('canvas'),r=el?.getBoundingClientRect(),X=r?r.left+r.width/2:innerWidth/2,Y=r?r.top+r.height/2:innerHeight/3,cols=['#86c99a','#f2d65c','#f0847a','#8ec5ff','#fff'];
 c.className='confetti';c.width=innerWidth;c.height=innerHeight;document.body.append(c);const g=c.getContext('2d'),w=el?9:15;
 const ps=Array.from({length:n},()=>({x:X,y:Y,vx:(Math.random()-.5)*w*1.4,vy:-Math.random()*w-3,z:4+Math.random()*5,c:cols[Math.random()*5|0],a:Math.random()*6,v:(Math.random()-.5)*.4}));let f=0;
 (function t(){g.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.a+=p.v;g.save();g.translate(p.x,p.y);g.rotate(p.a);g.fillStyle=p.c;g.globalAlpha=Math.max(0,1-f/150);g.fillRect(-p.z/2,-p.z/4,p.z,p.z/2);g.restore()});++f<150?requestAnimationFrame(t):c.remove()})()}
function countUp(el,to){if(still||!to){el.textContent=to;return}const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/900);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(t0)}
function award(n,el){const r=rec(),s=r.stats||{xp:0,streak:0,last:''},l0=lvl(s.xp);
 if(s.last!==day(0)){s.streak=s.last===day(1)?s.streak+1:1;s.last=day(0)}s.xp+=n;save(x=>x.stats=s);pop('+'+n+' XP',el);chips();
 if(lvl(s.xp)>l0){confetti(120);toast('Level up! You’re now level '+lvl(s.xp))}}
if(P!=='login'){const nav=P==='startup'?'':`<nav aria-label="Main"><a href="home.html"${['home','topics','course'].includes(P)?' aria-current="page"':''}>Learn</a><a href="settings.html"${P==='settings'?' aria-current="page"':''}>Settings</a></nav>`;
 document.body.insertAdjacentHTML('afterbegin',`<header class="bar"><a class="brand" href="home.html">${LEAF}Kale</a>${nav}${P==='startup'?'':'<div class="chips"><span class="chip" id="chS"></span><span class="chip" id="chX"></span></div>'}</header>`);chips()}

/* ---- Pages ---- */
const pages={
login(){
 const f=$('#auth'),msg=$('#msg');let up=false;
 document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{up=t.dataset.m==='up';
  document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',x===t));
  $('#go').textContent=up?'Create account':'Sign in';f.pw.autocomplete=up?'new-password':'current-password';
  $('#keepw').hidden=up;$('#hint').hidden=!up;msg.textContent=''});
 f.onsubmit=async e=>{e.preventDefault();msg.textContent='';const em=f.email.value.trim().toLowerCase();
  try{if(!window.crypto?.subtle)throw Error('Sign-in needs a secure page (https or localhost).');
   up?await signUp(em,f.pw.value):await signIn(em,f.pw.value,f.keep.checked);
   location.href=rec().profile?'home.html':'startup.html'}catch(x){msg.textContent=x.message}};
 $('#guest').onclick=()=>{wr(SS,'kale:guest',{profile:null,progress:{}});start('guest',false);location.href='startup.html'};
},
startup(){
 const secs=[...document.querySelectorAll('[data-step]')],dots=$('.dots');let i=0;const f=$('#wiz'),next=$('#next'),back=$('#back');
 dots.innerHTML=secs.map(()=>'<i></i>').join('');
 $('#conf').innerHTML=C.subjects.slice(1).map((s,n)=>`<label for="c${n}" style="margin:0">${s.name}</label><select id="c${n}" data-s="${s.id}"><option>Not sure yet</option><option>Not confident</option><option>Somewhat confident</option><option>Confident</option></select>`).join('');
 const show=()=>{secs.forEach((s,n)=>s.hidden=n!==i);[...dots.children].forEach((d,n)=>d.classList.toggle('on',n<=i));
  back.style.visibility=i?'visible':'hidden';next.textContent=i===secs.length-1?'Start learning':'Continue';(secs[i].querySelector('input,select')||{focus(){}}).focus()};
 const ok=()=>i===0?f.name.value.trim():i===1?+f.grade.value>=1&&+f.grade.value<=12:i===2?f.fam.value:1;
 back.onclick=()=>{i--;show()};
 f.onsubmit=e=>{e.preventDefault();if(!ok()){$('#err').textContent=['Enter a name to continue.','Enter a grade between 1 and 12.','Pick the option that fits best.'][i];return}
  $('#err').textContent='';
  if(i<secs.length-1){i++;show();return}
  const conf={};document.querySelectorAll('#conf select').forEach(s=>conf[s.dataset.s]=s.value);
  save(r=>r.profile={name:f.name.value.trim(),grade:+f.grade.value,fam:f.fam.value,conf});location.href='home.html'};
 show();
},
home(){
 const r=rec(),p=r.profile,pr=r.progress,st=r.stats||{xp:0,streak:0},lv=lvl(st.xp),dn=Object.values(pr).filter(v=>v.done).length;
 const tiles=`<div class="tiles">${[['Level',lv],['XP',st.xp],['Day streak',streakNow(st)],['Guides done',dn]].map(([l,v])=>`<div class="tile"><b data-count="${v}">0</b><span>${l}</span></div>`).join('')}</div><div class="xpbar"><i data-w="${st.xp%100}%" style="width:0"></i></div><p class="mute" style="font-size:14px">${100-st.xp%100} XP to level ${lv+1}</p>`;
 const cur=Object.entries(pr).filter(([,v])=>!v.done).sort((a,b)=>b[1].t-a[1].t)[0];
 const card=(s,n)=>{const ts=flat(s);if(!ts.length)return`<div class="card lock" aria-disabled="true" style="background-image:url(${s.img})">${s.name}<small>Coming soon</small></div>`;
  const d=ts.filter(t=>state(t.id)==='done').length,sug=s.id==='introduction'&&p.fam!=='I use them often';
  return`<a class="card${n?'':' wide'}" href="topics.html?s=${s.id}" style="--n:${n};background-image:url(${s.img})">${sug?'<span class="pill">Start here</span>':''}${s.name}<small>${d} of ${ts.length} guides done</small><span class="bar2"><i data-w="${d/ts.length*100}%" style="width:0"></i></span></a>`};
 main.innerHTML=`<div class="home"><div><h1>Hi, ${esc(p.name)}</h1><p class="mute">Pick a subject to learn how its rubrics work.</p>${tiles}
 ${cur?`<div class="panel resume"><div><b>Pick up where you left off</b><br><span class="mute">${esc(C.lessons[cur[0]].title)} · slide ${cur[1].i+1} of ${C.lessons[cur[0]].slides.length}</span></div><a class="btn" href="course.html?t=${cur[0]}">Continue</a></div>`:''}
 <div class="grid">${C.subjects.map((s,n)=>card(s,n)).join('')}</div></div>
 <aside class="notice"><b>Notice</b><p>This web app is a product for a Personal Project. It aims to improve rubric understanding for IB Middle Years Programme students.</p></aside></div>`;document.querySelectorAll('[data-count]').forEach(e=>countUp(e,+e.dataset.count));setTimeout(()=>document.querySelectorAll('[data-w]').forEach(e=>e.style.width=e.dataset.w),80);
},
topics(){
 const s=C.subjects.find(x=>x.id===new URLSearchParams(location.search).get('s'));
 if(!s||!flat(s).length){location.replace('home.html');return}
 const label={new:'Not started',doing:'In progress',done:'Done'};let n=0;
 main.innerHTML=`<a class="crumb" href="home.html">← All subjects</a><h1>${s.name}</h1><p class="mute">Work through the guides in order.</p>`+
 s.groups.map(g=>(g.name?`<h2 class="group">${g.name}</h2>`:'')+(g.topics.length?g.topics.map(t=>{const st=state(t.id);
  return`<a class="row" href="course.html?t=${t.id}"><span class="n">${++n}</span>${t.title}<span class="st ${st}">${label[st]}</span></a>`}).join(''):'<p class="mute">Coming soon.</p>')).join('');
},
course(){
 const id=new URLSearchParams(location.search).get('t'),L=C.lessons[id],S=subjOf(id);
 if(!L){location.replace('home.html');return}
 const n=L.slides.length,old=prog()[id]||{},ans=old.a||{},rew=old.w||{};let mx=old.m||0,i=Math.min(old.i||0,n-1);
 const put=(extra={})=>save(r=>r.progress[id]={i,a:ans,w:rew,m:mx,done:!!old.done||!!extra.done,t:Date.now()});
 const nextT=(()=>{const f=flat(S);return f[f.findIndex(t=>t.id===id)+1]})();
 const render=()=>{const sl=L.slides[i],q=sl.o,got=ans[i];
  const need=q&&(sl.c!==undefined?got!==sl.c:got===undefined);
  main.innerHTML=`<div class="player"><div class="ptop"><a href="topics.html?s=${S.id}">← Exit</a><span>${i+1} / ${n}</span></div>
  <div class="seg" aria-hidden="true">${L.slides.map((_,k)=>`<i class="${k<=i?'on':''}"></i>`).join('')}</div>
  <article class="lesson">${i===0?`<h1>${L.title}</h1>`:''}${rich(sl.x)}
  ${q?q.map((o,k)=>`<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')+'<p class="fb" role="status"></p>':''}</article>
  <div class="foot"><button class="btn ghost" id="pb"${i?'':' style="visibility:hidden"'}>Back</button><button class="btn" id="nb"${need?' disabled':''}>${i===n-1?'Finish':'Next'}</button></div></div>`;
  const show=k=>{const o=document.querySelectorAll('.opt')[k],fb=$('.fb'),good=sl.c===undefined||k===sl.c;
   o.classList.add(sl.c===undefined?'ok':good?'ok':'bad');fb.className='fb '+(good?'ok':'bad');fb.textContent=sl.a[k]+(good||sl.c===undefined?'':' Try another answer.')};
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const k=+b.dataset.k;
   document.querySelectorAll('.opt').forEach(x=>x.className='opt');const good=sl.c===undefined||k===sl.c;ans[i]=k;if(good&&!rew[i]){rew[i]=1;award(sl.c===undefined?5:10,b);if(sl.c!==undefined)confetti(40,b)}put();show(k);if(!good)b.classList.add('shake');
   $('#nb').disabled=sl.c!==undefined&&k!==sl.c});
  if(got!==undefined)show(got);
  $('#pb').onclick=()=>{i--;put();render();scrollTo(0,0)};
  $('#nb').onclick=()=>{if(i<n-1){i++;if(i>mx){mx=i;award(3,$('#nb'))}put();render();scrollTo(0,0)}else{const first=!old.done;put({done:true});old.done=true;if(first)award(50);finish(first)}};
 };
 const finish=first=>(confetti(),main.innerHTML=`<div class="done"><h1>Guide complete</h1><p class="mute">${L.title} is done. Nice work.</p>${first?'<p class="bigxp">+50 XP</p>':''}
  ${nextT?`<a class="btn" href="course.html?t=${nextT.id}">Next: ${nextT.title}</a>`:''}<a class="btn ghost" href="topics.html?s=${S.id}">Back to guides</a></div>`);
 render();
},
settings(){
 const r=rec(),p=r.profile,guest=sess().id==='guest',done=Object.values(r.progress).filter(v=>v.done).length;
 main.innerHTML=`<h1>Settings</h1>
 <section class="panel"><h2>Profile</h2><form id="pf"><label>Name<input name="name" value="${esc(p.name)}" required maxlength="30"></label><label>Grade<input name="grade" type="number" min="1" max="12" value="${esc(p.grade)}"></label><button class="btn">Save changes</button> <span id="saved" class="mute" role="status"></span></form></section>
 <section class="panel"><h2>Progress</h2><p class="mute">${done} guide${done===1?'':'s'} completed.</p><button class="btn ghost" id="reset">Reset progress</button></section>
 <section class="panel"><h2>Account</h2><p class="mute">${guest?'You’re in a guest session. Progress is cleared when you close this tab.':esc(sess().id)}</p><button class="btn ghost" id="out">Log out</button> ${guest?'':'<button class="btn danger" id="del">Delete account</button>'}</section>
 <section class="panel"><h2>Feedback</h2><p>As you’ve read in the Notice, this web app was made for a <b>Personal Project</b>. Thank you for using it. I’d appreciate it if you could spend a few minutes filling out this form.</p><a class="btn" href="https://forms.gle/JX6EAGdDJgThnWUDA" target="_blank" rel="noopener">Open the form</a></section>`;
 $('#pf').onsubmit=e=>{e.preventDefault();const f=e.target;save(r=>{r.profile.name=f.name.value.trim();r.profile.grade=+f.grade.value});$('#saved').textContent='Saved.'};
 $('#reset').onclick=()=>{if(confirm('Reset all progress? This can’t be undone.')){save(r=>{r.progress={};delete r.stats});location.reload()}};
 $('#out').onclick=logout;
 const d=$('#del');if(d)d.onclick=()=>{if(confirm('Delete your account and all progress? This can’t be undone.')){const u=users();delete u[sess().id];wr(LS,'kale:users',u);logout()}};
}};
pages[P]();
})();