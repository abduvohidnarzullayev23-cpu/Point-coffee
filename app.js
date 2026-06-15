// ===== STATE =====
const USERS = {
  vohid: { pass: '1234', name: 'Vohid', role: 'buxgalter', avatar: 'V' },
  jasur: { pass: '5678', name: 'Jasur', role: 'direktor', avatar: 'J' }
};

let currentUser = null;
let tasks = [];
let payments = [];
let documents = [];
let taskFilter = 'all';

const TODAY = new Date(); TODAY.setHours(0,0,0,0);
const TOMORROW = new Date(TODAY); TOMORROW.setDate(TODAY.getDate()+1);

// ===== HELPERS =====
function fmtDisplay(d){ return new Date(d).toLocaleDateString('uz-UZ',{day:'2-digit',month:'2-digit',year:'numeric'}); }
function fmtISO(d){ return new Date(d).toISOString().slice(0,10); }
function nextFriday(){
  const d=new Date(TODAY); const diff=(5-d.getDay()+7)%7||7;
  d.setDate(d.getDate()+diff); return fmtISO(d);
}
function escH(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function taskStatus(dateStr){
  if(!dateStr) return 'none';
  const d=new Date(dateStr); d.setHours(0,0,0,0);
  if(d<TODAY) return 'late';
  if(d.getTime()===TODAY.getTime()) return 'today';
  if(d.getTime()===TOMORROW.getTime()) return 'tmr';
  return 'ok';
}

function dateBadge(s, dateStr){
  const d = dateStr ? new Date(dateStr).toLocaleDateString('uz-UZ',{day:'2-digit',month:'2-digit'}) : '-';
  const map = {
    late: `<span class="badge b-danger"><i class="ti ti-clock"></i> Kechikkan ${d}</span>`,
    today: `<span class="badge b-warning"><i class="ti ti-clock"></i> Bugun ${d}</span>`,
    tmr: `<span class="badge b-info"><i class="ti ti-calendar"></i> Ertaga ${d}</span>`,
    ok: `<span class="badge b-gray"><i class="ti ti-calendar"></i> ${d}</span>`,
    none: `<span class="badge b-gray">Sana yo'q</span>`
  };
  return map[s] || map.none;
}

function catBadge(c){
  const cls = { ijara:'b-info', soliq:'b-danger', hisobot:'b-warning', qaytarish:'b-info', hujjat:'b-gray', maosh:'b-success', sim:'b-gray', boshqa:'b-gray' };
  return `<span class="badge ${cls[c]||'b-gray'}">${escH(c)}</span>`;
}

function priorityBadge(p){
  const map = { high:`<span class="badge b-danger">Muhim</span>`, mid:`<span class="badge b-warning">O'rta</span>`, low:`<span class="badge b-gray">Oddiy</span>` };
  return map[p] || '';
}

// ===== STORAGE =====
function load(){
  try {
    tasks = JSON.parse(localStorage.getItem('pc_tasks')||'null') || getDefaultTasks();
    payments = JSON.parse(localStorage.getItem('pc_payments')||'null') || getDefaultPayments();
    documents = JSON.parse(localStorage.getItem('pc_docs')||'null') || [];
    const theme = localStorage.getItem('pc_theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeBtn(theme);
  } catch(e){ tasks=getDefaultTasks(); payments=getDefaultPayments(); documents=[]; }
}

function save(){
  try {
    localStorage.setItem('pc_tasks', JSON.stringify(tasks));
    localStorage.setItem('pc_payments', JSON.stringify(payments));
    localStorage.setItem('pc_docs', JSON.stringify(documents));
  } catch(e){}
}

function getDefaultTasks(){
  return [
    {id:1, name:"Juma hisoboti — Jasur akaga yuborish", date:nextFriday(), cat:"hisobot", priority:"high", done:false},
    {id:2, name:"Qaytarishlar sverkasi (Otabek aka)", date:nextFriday(), cat:"qaytarish", priority:"high", done:false},
    {id:3, name:"QQS deklaratsiyasi topshirish", date:fmtISO(new Date(TODAY.getFullYear(),TODAY.getMonth(),17)), cat:"soliq", priority:"high", done:false},
    {id:4, name:"INPS to'lovi", date:fmtISO(new Date(TODAY.getFullYear(),TODAY.getMonth(),12)), cat:"soliq", priority:"high", done:false},
    {id:5, name:"Yunusobod — dalolatnoma so'rash", date:fmtISO(new Date(TODAY.getFullYear(),TODAY.getMonth(),10)), cat:"hujjat", priority:"mid", done:false},
    {id:6, name:"Chilonzor ijarasi to'lovi", date:fmtISO(new Date(TODAY.getFullYear(),TODAY.getMonth(),2)), cat:"ijara", priority:"high", done:true},
    {id:7, name:"SIM-kartalar to'lovi", date:fmtISO(new Date(TODAY.getFullYear(),TODAY.getMonth(),3)), cat:"ijara", priority:"mid", done:true},
  ];
}

function getDefaultPayments(){
  const m = TODAY.getMonth(), y = TODAY.getFullYear();
  return [
    {id:1, name:"Yunusobod ijarasi", amount:3200000, date:fmtISO(new Date(y,m,5)), cat:"ijara", status:"paid"},
    {id:2, name:"Chilonzor ijarasi", amount:2800000, date:fmtISO(new Date(y,m,5)), cat:"ijara", status:"paid"},
    {id:3, name:"Sergeli ijarasi", amount:1900000, date:fmtISO(new Date(y,m,7)), cat:"ijara", status:"pending"},
    {id:4, name:"Bektemir ijarasi", amount:1600000, date:fmtISO(new Date(y,m,10)), cat:"ijara", status:"pending"},
    {id:5, name:"SIM-kartalar (4G)", amount:450000, date:fmtISO(new Date(y,m,3)), cat:"sim", status:"paid"},
    {id:6, name:"QQS (iyun)", amount:8400000, date:fmtISO(new Date(y,m,20)), cat:"soliq", status:"pending"},
    {id:7, name:"INPS (iyun)", amount:3200000, date:fmtISO(new Date(y,m,15)), cat:"soliq", status:"pending"},
    {id:8, name:"Xodimlar maoshi", amount:15000000, date:fmtISO(new Date(y,m,25)), cat:"maosh", status:"pending"},
  ];
}

// ===== LOGIN =====
function doLogin(){
  const u = document.getElementById('login-user').value;
  const p = document.getElementById('login-pass').value;
  const err = document.getElementById('login-err');
  if(!u){ err.classList.remove('hidden'); err.textContent="Foydalanuvchini tanlang"; return; }
  if(!USERS[u] || USERS[u].pass !== p){ err.classList.remove('hidden'); return; }
  err.classList.add('hidden');
  currentUser = { key: u, ...USERS[u] };
  document.getElementById('user-avatar').textContent = currentUser.avatar;
  document.getElementById('user-name').textContent = currentUser.name;
  document.getElementById('top-date').textContent = fmtDisplay(TODAY);
  document.getElementById('jasur-date').textContent = fmtDisplay(TODAY);

  if(currentUser.key === 'jasur'){
    document.getElementById('nav-jasur').style.display = 'flex';
  }

  document.getElementById('login-page').classList.remove('active');
  document.getElementById('app-page').classList.add('active');
  renderAll();
  startNotifCheck();
}

function doLogout(){
  currentUser = null;
  document.getElementById('login-pass').value = '';
  document.getElementById('login-user').value = '';
  document.getElementById('app-page').classList.remove('active');
  document.getElementById('login-page').classList.add('active');
}

function togglePass(){
  const inp = document.getElementById('login-pass');
  const ico = document.getElementById('eye-icon');
  if(inp.type==='password'){ inp.type='text'; ico.className='ti ti-eye-off'; }
  else { inp.type='password'; ico.className='ti ti-eye'; }
}

document.getElementById('login-pass').addEventListener('keydown', e=>{ if(e.key==='Enter') doLogin(); });

// ===== NAVIGATION =====
const sectionTitles = { dashboard:'Dashboard', tasks:'Vazifalar', payments:"To'lovlar", documents:'Hujjatlar', jasur:'Jasur paneli' };

function showSection(name, btn){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('sec-'+name).classList.add('active');
  if(btn) btn.classList.add('active');
  document.getElementById('section-title').textContent = sectionTitles[name] || name;
  if(name==='jasur') renderJasur();
  if(window.innerWidth<=600) document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
}

// ===== THEME =====
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur==='dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('pc_theme', next);
  updateThemeBtn(next);
}

function updateThemeBtn(theme){
  const ico = document.getElementById('theme-icon');
  const lbl = document.getElementById('theme-label');
  if(theme==='dark'){ ico.className='ti ti-sun'; lbl.textContent='Kunduzgi rejim'; }
  else { ico.className='ti ti-moon'; lbl.textContent='Tungi rejim'; }
}

// ===== RENDER ALL =====
function renderAll(){
  renderDashboard();
  renderTaskList();
  renderPayments();
  renderDocuments();
}

// ===== DASHBOARD =====
function renderDashboard(){
  const pending = tasks.filter(t=>!t.done);
  const todayT = pending.filter(t=>taskStatus(t.date)==='today').length;
  const lateT = pending.filter(t=>taskStatus(t.date)==='late').length;
  const tmrT = pending.filter(t=>taskStatus(t.date)==='tmr').length;
  const doneT = tasks.filter(t=>t.done).length;

  document.getElementById('d-today').textContent = todayT;
  document.getElementById('d-late').textContent = lateT;
  document.getElementById('d-tmr').textContent = tmrT;
  document.getElementById('d-done').textContent = doneT;

  // Alert banner
  const banner = document.getElementById('alert-banner');
  const alertTxt = document.getElementById('alert-text');
  if(lateT>0||todayT>0){
    banner.classList.remove('hidden');
    let msg = '';
    if(lateT>0) msg += `${lateT} ta vazifaning muddati o'tib ketgan! `;
    if(todayT>0) msg += `${todayT} ta vazifani bugun bajarish kerak.`;
    alertTxt.textContent = msg;
  } else { banner.classList.add('hidden'); }

  // Today tasks panel
  const todayList = document.getElementById('today-tasks-list');
  const todayItems = pending.filter(t=>taskStatus(t.date)==='today');
  if(!todayItems.length){
    todayList.innerHTML = `<div class="empty-state"><i class="ti ti-mood-smile"></i>Bugun vazifa yo'q</div>`;
  } else {
    todayList.innerHTML = todayItems.map(t=>`
      <div class="task-row" style="border-bottom:0.5px solid var(--border)">
        <div class="chk${t.done?' on':''}" onclick="toggleTask(${t.id})"><i class="ti ti-check"></i></div>
        <span class="task-name">${escH(t.name)}</span>
        <div class="task-meta">${catBadge(t.cat)}</div>
      </div>`).join('');
  }

  // Late tasks panel
  const lateList = document.getElementById('late-tasks-list');
  const lateItems = pending.filter(t=>taskStatus(t.date)==='late');
  if(!lateItems.length){
    lateList.innerHTML = `<div class="empty-state"><i class="ti ti-circle-check"></i>Kechikkan vazifa yo'q</div>`;
  } else {
    lateList.innerHTML = lateItems.map(t=>`
      <div class="task-row" style="border-bottom:0.5px solid var(--border)">
        <div class="chk" onclick="toggleTask(${t.id})"><i class="ti ti-check"></i></div>
        <span class="task-name">${escH(t.name)}</span>
        <div class="task-meta">${dateBadge('late',t.date)}</div>
      </div>`).join('');
  }

  // Chart
  renderChart();
}

function renderChart(){
  const bars = document.getElementById('chart-bars');
  const cats = ['ijara','soliq','hisobot','qaytarish','hujjat','boshqa'];
  const maxVal = 5;
  bars.innerHTML = cats.map(cat=>{
    const done = tasks.filter(t=>t.cat===cat&&t.done).length;
    const late = tasks.filter(t=>t.cat===cat&&!t.done&&taskStatus(t.date)==='late').length;
    const dH = Math.max(4, Math.round((done/maxVal)*70));
    const lH = Math.max(late?4:0, Math.round((late/maxVal)*70));
    return `<div class="chart-bar-group" title="${cat}">
      <div class="cb done" style="height:${dH}px" title="${done} bajarildi"></div>
      ${lH ? `<div class="cb late" style="height:${lH}px" title="${late} kechikkan"></div>` : ''}
    </div>`;
  }).join('');
}

// ===== TASKS =====
function addTask(){
  const name = document.getElementById('t-name').value.trim();
  const date = document.getElementById('t-date').value;
  const cat = document.getElementById('t-cat').value;
  const priority = document.getElementById('t-priority').value;
  if(!name) return;
  tasks.push({ id: Date.now(), name, date, cat, priority, done: false });
  save(); renderAll();
  document.getElementById('t-name').value = '';
  document.getElementById('t-date').value = '';
  document.getElementById('t-name').focus();
}

function toggleTask(id){
  const t = tasks.find(x=>x.id===id);
  if(t){ t.done = !t.done; save(); renderAll(); }
}

function deleteTask(id){
  if(!confirm("O'chirishni tasdiqlaysizmi?")) return;
  tasks = tasks.filter(x=>x.id!==id);
  save(); renderAll();
}

function setFilter(f, btn){
  taskFilter = f;
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderTaskList();
}

function renderTaskList(){
  const list = document.getElementById('task-list');
  let ft = tasks;
  if(taskFilter==='today') ft = tasks.filter(t=>taskStatus(t.date)==='today'&&!t.done);
  else if(taskFilter==='late') ft = tasks.filter(t=>taskStatus(t.date)==='late'&&!t.done);
  else if(!['all'].includes(taskFilter)) ft = tasks.filter(t=>t.cat===taskFilter);

  if(!ft.length){ list.innerHTML=`<div class="empty-state"><i class="ti ti-mood-smile"></i>Vazifalar yo'q</div>`; return; }

  const pending = ft.filter(t=>!t.done).sort((a,b)=>{
    const o={late:0,today:1,tmr:2,ok:3,none:4};
    return o[taskStatus(a.date)]-o[taskStatus(b.date)];
  });
  const done = ft.filter(t=>t.done);

  let html = '';
  pending.forEach(t=>{
    const s = taskStatus(t.date);
    html += `<div class="task-item">
      <div class="task-row">
        <div class="chk" onclick="toggleTask(${t.id})"><i class="ti ti-check"></i></div>
        <span class="task-name">${escH(t.name)}</span>
        <div class="task-meta">
          ${priorityBadge(t.priority)}
          ${catBadge(t.cat)}
          ${dateBadge(s,t.date)}
          <button class="btn-danger" onclick="deleteTask(${t.id})"><i class="ti ti-trash"></i></button>
        </div>
      </div>
    </div>`;
  });

  if(done.length){
    html += `<div class="sec-head">Bajarildi (${done.length})</div>`;
    done.forEach(t=>{
      html += `<div class="task-item done-item">
        <div class="task-row">
          <div class="chk on" onclick="toggleTask(${t.id})"><i class="ti ti-check"></i></div>
          <span class="task-name struck">${escH(t.name)}</span>
          <div class="task-meta">
            ${catBadge(t.cat)}
            <button class="btn-danger" onclick="deleteTask(${t.id})"><i class="ti ti-trash"></i></button>
          </div>
        </div>
      </div>`;
    });
  }

  list.innerHTML = html;
}

document.getElementById('t-name').addEventListener('keydown', e=>{ if(e.key==='Enter') addTask(); });

// ===== PAYMENTS =====
function addPayment(){
  const name = document.getElementById('p-name').value.trim();
  const amount = parseInt(document.getElementById('p-amount').value)||0;
  const date = document.getElementById('p-date').value;
  const cat = document.getElementById('p-cat').value;
  if(!name) return;
  payments.push({ id:Date.now(), name, amount, date, cat, status:'pending' });
  save(); renderPayments();
  document.getElementById('p-name').value='';
  document.getElementById('p-amount').value='';
}

function togglePayment(id){
  const p = payments.find(x=>x.id===id);
  if(p){ p.status = p.status==='paid' ? 'pending' : 'paid'; save(); renderPayments(); }
}

function deletePayment(id){
  if(!confirm("O'chirishni tasdiqlaysizmi?")) return;
  payments = payments.filter(x=>x.id!==id);
  save(); renderPayments();
}

function fmtMoney(n){ return Number(n).toLocaleString('uz-UZ')+' so\'m'; }

function renderPayments(){
  const list = document.getElementById('payment-list');
  if(!payments.length){ list.innerHTML=`<div class="empty-state"><i class="ti ti-calendar"></i>To'lovlar yo'q</div>`; return; }

  const sorted = [...payments].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const pending = sorted.filter(p=>p.status==='pending');
  const paid = sorted.filter(p=>p.status==='paid');

  let html = '';
  if(pending.length){
    html += `<div class="sec-head" style="padding:0 14px">Kutilmoqda</div>`;
    pending.forEach(p=>{
      const s = taskStatus(p.date);
      html += `<div class="pay-item">
        <div class="chk" onclick="togglePayment(${p.id})"><i class="ti ti-check"></i></div>
        <div>
          <div class="pay-name">${escH(p.name)}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${fmtDisplay(p.date)}</div>
        </div>
        <div class="task-meta">
          ${catBadge(p.cat)}
          ${dateBadge(s,p.date)}
          <span class="pay-amount">${fmtMoney(p.amount)}</span>
          <button class="btn-danger" onclick="deletePayment(${p.id})"><i class="ti ti-trash"></i></button>
        </div>
      </div>`;
    });
  }
  if(paid.length){
    html += `<div class="sec-head" style="padding:0 14px">To'langan</div>`;
    paid.forEach(p=>{
      html += `<div class="pay-item" style="opacity:.5">
        <div class="chk on" onclick="togglePayment(${p.id})"><i class="ti ti-check"></i></div>
        <div>
          <div class="pay-name" style="text-decoration:line-through">${escH(p.name)}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${fmtDisplay(p.date)}</div>
        </div>
        <div class="task-meta">
          ${catBadge(p.cat)}
          <span class="badge b-success"><i class="ti ti-check"></i> To'langan</span>
          <span class="pay-amount">${fmtMoney(p.amount)}</span>
          <button class="btn-danger" onclick="deletePayment(${p.id})"><i class="ti ti-trash"></i></button>
        </div>
      </div>`;
    });
  }
  list.innerHTML = html;
}

// ===== DOCUMENTS =====
function handleFiles(files){
  Array.from(files).forEach(file=>{
    const name = document.getElementById('d-name').value.trim() || file.name;
    const cat = document.getElementById('d-cat').value;
    documents.push({
      id: Date.now()+Math.random(),
      name, cat,
      filename: file.name,
      size: file.size,
      date: fmtISO(TODAY)
    });
    document.getElementById('d-name').value='';
  });
  save(); renderDocuments();
}

// Drag & drop
const ua = document.getElementById('upload-area');
ua.addEventListener('dragover', e=>{ e.preventDefault(); ua.style.borderColor='var(--info)'; });
ua.addEventListener('dragleave', ()=>{ ua.style.borderColor=''; });
ua.addEventListener('drop', e=>{ e.preventDefault(); ua.style.borderColor=''; handleFiles(e.dataTransfer.files); });

function deleteDoc(id){
  if(!confirm("O'chirishni tasdiqlaysizmi?")) return;
  documents = documents.filter(x=>x.id!==id);
  save(); renderDocuments();
}

function fmtSize(bytes){ if(bytes<1024) return bytes+'B'; if(bytes<1048576) return (bytes/1024).toFixed(1)+'KB'; return (bytes/1048576).toFixed(1)+'MB'; }

function renderDocuments(){
  const list = document.getElementById('doc-list');
  document.getElementById('j-docs').textContent = documents.length;
  if(!documents.length){ list.innerHTML=`<div class="empty-state"><i class="ti ti-files"></i>Hujjatlar yo'q</div>`; return; }
  list.innerHTML = documents.map(d=>`
    <div class="doc-item">
      <div class="doc-icon"><i class="ti ti-file-description"></i></div>
      <div style="flex:1;min-width:0">
        <div class="doc-name">${escH(d.name)}</div>
        <div class="doc-size">${fmtDisplay(d.date)} · ${fmtSize(d.size||0)}</div>
      </div>
      <div class="task-meta">
        ${catBadge(d.cat)}
        <button class="btn-danger" onclick="deleteDoc(${d.id})"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join('');
}

// ===== JASUR PANEL =====
function renderJasur(){
  const pending = tasks.filter(t=>!t.done);
  const lateT = pending.filter(t=>taskStatus(t.date)==='late').length;
  const todayT = pending.filter(t=>taskStatus(t.date)==='today').length;
  const doneT = tasks.filter(t=>t.done).length;

  document.getElementById('j-late').textContent = lateT;
  document.getElementById('j-today').textContent = todayT;
  document.getElementById('j-done').textContent = doneT;
  document.getElementById('j-docs').textContent = documents.length;

  // Pending payments for jasur
  const pendingPays = payments.filter(p=>p.status==='pending').slice(0,5);
  const jp = document.getElementById('jasur-pending');
  if(!pendingPays.length){ jp.innerHTML=`<div class="empty-state"><i class="ti ti-circle-check"></i>Kutilayotgan to'lov yo'q</div>`; }
  else {
    jp.innerHTML = pendingPays.map(p=>`
      <div class="pay-item">
        <div class="doc-icon" style="background:var(--warning-bg);color:var(--warning)"><i class="ti ti-calendar-due"></i></div>
        <div style="flex:1">
          <div class="pay-name">${escH(p.name)}</div>
          <div style="font-size:11px;color:var(--text3)">${fmtDisplay(p.date)}</div>
        </div>
        <div class="task-meta">
          ${catBadge(p.cat)}
          ${dateBadge(taskStatus(p.date),p.date)}
          <span class="pay-amount">${fmtMoney(p.amount)}</span>
        </div>
      </div>`).join('');
  }

  // Vohid tasks for jasur
  const jt = document.getElementById('jasur-tasks');
  const activeTasks = tasks.filter(t=>!t.done).sort((a,b)=>{
    const o={late:0,today:1,tmr:2,ok:3,none:4};
    return o[taskStatus(a.date)]-o[taskStatus(b.date)];
  }).slice(0,8);
  if(!activeTasks.length){ jt.innerHTML=`<div class="empty-state"><i class="ti ti-mood-smile"></i>Barcha vazifalar bajarilgan</div>`; }
  else {
    jt.innerHTML = activeTasks.map(t=>`
      <div class="task-row" style="border-bottom:0.5px solid var(--border)">
        <span class="task-name">${escH(t.name)}</span>
        <div class="task-meta">
          ${priorityBadge(t.priority)}
          ${catBadge(t.cat)}
          ${dateBadge(taskStatus(t.date),t.date)}
        </div>
      </div>`).join('');
  }
}

// ===== NOTIFICATIONS =====
function startNotifCheck(){
  if('Notification' in window && Notification.permission==='default'){
    Notification.requestPermission();
  }
  setInterval(()=>{
    const late = tasks.filter(t=>!t.done&&taskStatus(t.date)==='late').length;
    const today = tasks.filter(t=>!t.done&&taskStatus(t.date)==='today').length;
    if((late>0||today>0) && Notification.permission==='granted'){
      new Notification('Point Coffee — Eslatma', {
        body: `${late} kechikkan, ${today} bugungi vazifa bor`,
      });
    }
  }, 30*60*1000);
}

// ===== INIT =====
load();
document.getElementById('top-date').textContent = fmtDisplay(TODAY);
