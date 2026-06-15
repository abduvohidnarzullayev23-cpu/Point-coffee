// ===== IJARA MODULE =====

const MONTHS_UZ = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

function getDefaultIjaralar(){
  const y = TODAY.getFullYear(), m = TODAY.getMonth();
  return [
    {
      id:1,
      lokatsiya:'Yunusobod',
      firma:'Baxtli Qovoq MCHJ',
      shartnoma_raqam:'SH-2024/01',
      didox: 'registered',
      eijara: 'registered',
      oylik_summa: 3200000,
      tolov_kun: 5,
      shartnoma_boshlanish: '2024-01-01',
      shartnoma_tugash: '2026-12-31',
      oylar: generateOylar(y, m, 'paid', 'paid')
    },
    {
      id:2,
      lokatsiya:'Chilonzor',
      firma:'Green Space LLC',
      shartnoma_raqam:'SH-2024/02',
      didox: 'registered',
      eijara: 'pending',
      oylik_summa: 2800000,
      tolov_kun: 5,
      shartnoma_boshlanish: '2024-03-01',
      shartnoma_tugash: '2026-03-01',
      oylar: generateOylar(y, m, 'paid', 'paid')
    },
    {
      id:3,
      lokatsiya:'Sergeli',
      firma:'Sergeli Bino MCHJ',
      shartnoma_raqam:'SH-2024/03',
      didox: 'not_registered',
      eijara: 'not_registered',
      oylik_summa: 1900000,
      tolov_kun: 7,
      shartnoma_boshlanish: '2024-06-01',
      shartnoma_tugash: '2025-06-01',
      oylar: generateOylar(y, m, 'late', 'missing')
    },
    {
      id:4,
      lokatsiya:'Mirzo Ulug\'bek',
      firma:'MU Plaza MCHJ',
      shartnoma_raqam:'SH-2024/04',
      didox: 'registered',
      eijara: 'registered',
      oylik_summa: 2500000,
      tolov_kun: 10,
      shartnoma_boshlanish: '2024-02-01',
      shartnoma_tugash: '2027-02-01',
      oylar: generateOylar(y, m, 'paid', 'received')
    },
    {
      id:5,
      lokatsiya:'Bektemir',
      firma:'Bektemir Market',
      shartnoma_raqam:'SH-2024/05',
      didox: 'registered',
      eijara: 'pending',
      oylik_summa: 1600000,
      tolov_kun: 10,
      shartnoma_boshlanish: '2024-04-01',
      shartnoma_tugash: '2026-04-01',
      oylar: generateOylar(y, m, 'paid', 'missing')
    },
    {
      id:6,
      lokatsiya:'Shayxontohur',
      firma:'Shayx Invest',
      shartnoma_raqam:'SH-2024/06',
      didox: 'registered',
      eijara: 'registered',
      oylik_summa: 2100000,
      tolov_kun: 15,
      shartnoma_boshlanish: '2024-01-15',
      shartnoma_tugash: '2026-01-15',
      oylar: generateOylar(y, m, 'paid', 'received')
    },
    {
      id:7,
      lokatsiya:'Olmazor',
      firma:'Olmazor Trade',
      shartnoma_raqam:'SH-2024/07',
      didox: 'pending',
      eijara: 'not_registered',
      oylik_summa: 1750000,
      tolov_kun: 20,
      shartnoma_boshlanish: '2024-05-01',
      shartnoma_tugash: '2025-05-01',
      oylar: generateOylar(y, m, 'pending', 'missing')
    },
    {
      id:8,
      lokatsiya:'Yakkasaroy',
      firma:'Yakka Bino',
      shartnoma_raqam:'SH-2024/08',
      didox: 'registered',
      eijara: 'registered',
      oylik_summa: 2300000,
      tolov_kun: 20,
      shartnoma_boshlanish: '2024-07-01',
      shartnoma_tugash: '2027-07-01',
      oylar: generateOylar(y, m, 'pending', 'missing')
    },
  ];
}

function generateOylar(y, curM, tolovStatus, schotStatus){
  const oylar = [];
  for(let i = Math.max(0, curM-4); i <= curM; i++){
    oylar.push({
      yil: y, oy: i,
      tolov_status: i < curM ? (Math.random()>0.15 ? 'paid' : 'late') : tolovStatus,
      schot_status: i < curM ? (Math.random()>0.2 ? 'received' : 'missing') : schotStatus,
    });
  }
  return oylar;
}

let ijaralar = [];
let ijara_view = 'table'; // table | cards
let ijara_filter = 'all';
let selected_ijara = null;

function loadIjaralar(){
  try {
    const s = localStorage.getItem('pc_ijaralar');
    ijaralar = s ? JSON.parse(s) : getDefaultIjaralar();
  } catch(e){ ijaralar = getDefaultIjaralar(); }
}

function saveIjaralar(){
  try { localStorage.setItem('pc_ijaralar', JSON.stringify(ijaralar)); } catch(e){}
}

// ===== BADGES =====
function didoxBadge(s){
  const map = {
    registered: `<span class="badge b-success"><i class="ti ti-check"></i> Didox</span>`,
    pending: `<span class="badge b-warning"><i class="ti ti-clock"></i> Didox kutilmoqda</span>`,
    not_registered: `<span class="badge b-danger"><i class="ti ti-x"></i> Didox yo'q</span>`
  };
  return map[s] || map.not_registered;
}

function eijaraBadge(s){
  const map = {
    registered: `<span class="badge b-success"><i class="ti ti-check"></i> E-ijara</span>`,
    pending: `<span class="badge b-warning"><i class="ti ti-clock"></i> E-ijara kutilmoqda</span>`,
    not_registered: `<span class="badge b-danger"><i class="ti ti-x"></i> E-ijara yo'q</span>`
  };
  return map[s] || map.not_registered;
}

function tolovBadge(s){
  const map = {
    paid: `<span class="badge b-success"><i class="ti ti-check"></i> To'landi</span>`,
    pending: `<span class="badge b-warning"><i class="ti ti-clock"></i> Kutilmoqda</span>`,
    late: `<span class="badge b-danger"><i class="ti ti-alert-circle"></i> Kechikkan</span>`,
  };
  return map[s] || `<span class="badge b-gray">—</span>`;
}

function schotBadge(s){
  const map = {
    received: `<span class="badge b-success"><i class="ti ti-file-check"></i> Olindi</span>`,
    missing: `<span class="badge b-danger"><i class="ti ti-file-x"></i> Yo'q</span>`,
    pending: `<span class="badge b-warning"><i class="ti ti-file-time"></i> Kutilmoqda</span>`,
  };
  return map[s] || `<span class="badge b-gray">—</span>`;
}

function shartnomaDaysLeft(tugash){
  const d = new Date(tugash); d.setHours(0,0,0,0);
  const diff = Math.ceil((d - TODAY)/(1000*60*60*24));
  if(diff < 0) return `<span class="badge b-danger"><i class="ti ti-alert-circle"></i> Muddati o'tgan</span>`;
  if(diff <= 30) return `<span class="badge b-danger"><i class="ti ti-clock"></i> ${diff} kun qoldi</span>`;
  if(diff <= 90) return `<span class="badge b-warning"><i class="ti ti-clock"></i> ${diff} kun qoldi</span>`;
  return `<span class="badge b-gray">${fmtDisplay(tugash)}</span>`;
}

// ===== RENDER IJARA =====
function renderIjara(){
  const container = document.getElementById('sec-ijara');
  if(!container) return;

  // Metrics
  const total = ijaralar.length;
  const curM = TODAY.getMonth();
  const lateCount = ijaralar.filter(i=>{
    const curOy = i.oylar.find(o=>o.oy===curM);
    return curOy && curOy.tolov_status==='late';
  }).length;
  const paidCount = ijaralar.filter(i=>{
    const curOy = i.oylar.find(o=>o.oy===curM);
    return curOy && curOy.tolov_status==='paid';
  }).length;
  const schotMissing = ijaralar.filter(i=>{
    const curOy = i.oylar.find(o=>o.oy===curM);
    return curOy && curOy.schot_status==='missing';
  }).length;

  document.getElementById('i-total').textContent = total;
  document.getElementById('i-paid').textContent = paidCount;
  document.getElementById('i-late').textContent = lateCount;
  document.getElementById('i-schot').textContent = schotMissing;

  // Filter
  let filtered = ijaralar;
  if(ijara_filter==='late') filtered = ijaralar.filter(i=>{ const o=i.oylar.find(x=>x.oy===curM); return o&&o.tolov_status==='late'; });
  else if(ijara_filter==='pending') filtered = ijaralar.filter(i=>{ const o=i.oylar.find(x=>x.oy===curM); return o&&o.tolov_status==='pending'; });
  else if(ijara_filter==='paid') filtered = ijaralar.filter(i=>{ const o=i.oylar.find(x=>x.oy===curM); return o&&o.tolov_status==='paid'; });
  else if(ijara_filter==='no_schot') filtered = ijaralar.filter(i=>{ const o=i.oylar.find(x=>x.oy===curM); return o&&o.schot_status==='missing'; });

  renderIjaraTable(filtered);
}

function renderIjaraTable(list){
  const tbody = document.getElementById('ijara-tbody');
  if(!list.length){
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--text3)">Lokatsiyalar yo'q</td></tr>`;
    return;
  }

  const curM = TODAY.getMonth();
  tbody.innerHTML = list.map(i=>{
    const curOy = i.oylar.find(o=>o.oy===curM) || {};
    const deadline = `${i.tolov_kun}-${MONTHS_UZ[curM].slice(0,3)}`;
    return `<tr onclick="openIjaraDetail(${i.id})" style="cursor:pointer">
      <td>
        <div style="font-weight:500;color:var(--text)">${escH(i.lokatsiya)}</div>
        <div style="font-size:11px;color:var(--text3)">${escH(i.firma)}</div>
      </td>
      <td><span class="badge b-gray">${escH(i.shartnoma_raqam)}</span></td>
      <td>${didoxBadge(i.didox)}</td>
      <td>${eijaraBadge(i.eijara)}</td>
      <td style="font-weight:500">${fmtMoney(i.oylik_summa)}</td>
      <td><span class="badge b-gray"><i class="ti ti-calendar"></i> ${deadline}</span></td>
      <td>${tolovBadge(curOy.tolov_status||'pending')}</td>
      <td>${schotBadge(curOy.schot_status||'missing')}</td>
      <td>${shartnomaDaysLeft(i.shartnoma_tugash)}</td>
    </tr>`;
  }).join('');
}

function setIjaraFilter(f, btn){
  ijara_filter = f;
  document.querySelectorAll('#ijara-filter-bar .fbtn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderIjara();
}

// ===== DETAIL MODAL =====
function openIjaraDetail(id){
  const ijara = ijaralar.find(i=>i.id===id);
  if(!ijara) return;
  selected_ijara = id;

  const modal = document.getElementById('ijara-modal');
  document.getElementById('modal-title').textContent = ijara.lokatsiya + ' — ' + ijara.firma;

  // Oylar tarixi
  let html = `<table style="width:100%;border-collapse:collapse">
    <thead><tr>
      <th style="text-align:left;padding:8px 10px;font-size:11px;color:var(--text2);border-bottom:0.5px solid var(--border)">Oy</th>
      <th style="text-align:left;padding:8px 10px;font-size:11px;color:var(--text2);border-bottom:0.5px solid var(--border)">To'lov</th>
      <th style="text-align:left;padding:8px 10px;font-size:11px;color:var(--text2);border-bottom:0.5px solid var(--border)">Schot-faktura</th>
      <th style="text-align:left;padding:8px 10px;font-size:11px;color:var(--text2);border-bottom:0.5px solid var(--border)">Summa</th>
      <th style="padding:8px 10px;border-bottom:0.5px solid var(--border)"></th>
    </tr></thead><tbody>`;

  ijara.oylar.forEach((o,idx)=>{
    html += `<tr>
      <td style="padding:10px;font-size:13px;color:var(--text)">${MONTHS_UZ[o.oy]} ${o.yil}</td>
      <td style="padding:10px">
        <select onchange="updateOyStatus(${id},${idx},'tolov_status',this.value)" style="font-size:12px;height:30px;padding:0 8px">
          <option value="paid" ${o.tolov_status==='paid'?'selected':''}>To'landi</option>
          <option value="pending" ${o.tolov_status==='pending'?'selected':''}>Kutilmoqda</option>
          <option value="late" ${o.tolov_status==='late'?'selected':''}>Kechikkan</option>
        </select>
      </td>
      <td style="padding:10px">
        <select onchange="updateOyStatus(${id},${idx},'schot_status',this.value)" style="font-size:12px;height:30px;padding:0 8px">
          <option value="received" ${o.schot_status==='received'?'selected':''}>Olindi</option>
          <option value="pending" ${o.schot_status==='pending'?'selected':''}>Kutilmoqda</option>
          <option value="missing" ${o.schot_status==='missing'?'selected':''}>Yo'q</option>
        </select>
      </td>
      <td style="padding:10px;font-size:13px;font-weight:500">${fmtMoney(ijara.oylik_summa)}</td>
      <td style="padding:10px">${tolovBadge(o.tolov_status)}</td>
    </tr>`;
  });
  html += `</tbody></table>`;

  document.getElementById('modal-oylar').innerHTML = html;

  // Info
  document.getElementById('modal-info').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1rem">
      <div class="info-box"><div class="info-label">Shartnoma raqami</div><div class="info-val">${escH(ijara.shartnoma_raqam)}</div></div>
      <div class="info-box"><div class="info-label">Oylik summa</div><div class="info-val">${fmtMoney(ijara.oylik_summa)}</div></div>
      <div class="info-box"><div class="info-label">To'lov kuni</div><div class="info-val">Har oyning ${ijara.tolov_kun}-si</div></div>
      <div class="info-box"><div class="info-label">Shartnoma muddati</div><div class="info-val">${fmtDisplay(ijara.shartnoma_boshlanish)} — ${fmtDisplay(ijara.shartnoma_tugash)}</div></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${didoxBadge(ijara.didox)} ${eijaraBadge(ijara.eijara)} ${shartnomaDaysLeft(ijara.shartnoma_tugash)}
    </div>`;

  modal.classList.add('open');
}

function closeIjaraModal(){
  document.getElementById('ijara-modal').classList.remove('open');
  selected_ijara = null;
}

function updateOyStatus(ijaraId, oyIdx, field, val){
  const ijara = ijaralar.find(i=>i.id===ijaraId);
  if(ijara && ijara.oylar[oyIdx]){
    ijara.oylar[oyIdx][field] = val;
    saveIjaralar();
    renderIjara();
  }
}

// ===== ADD IJARA =====
function addIjara(){
  const lok = document.getElementById('new-lokatsiya').value.trim();
  const firma = document.getElementById('new-firma').value.trim();
  const raqam = document.getElementById('new-shartnoma').value.trim();
  const summa = parseInt(document.getElementById('new-summa').value)||0;
  const kun = parseInt(document.getElementById('new-kun').value)||1;
  const bosh = document.getElementById('new-bosh').value;
  const tug = document.getElementById('new-tug').value;
  const didox = document.getElementById('new-didox').value;
  const eijara = document.getElementById('new-eijara').value;

  if(!lok||!firma||!raqam) return alert("Lokatsiya, firma va shartnoma raqamini kiriting!");

  const y = TODAY.getFullYear(), m = TODAY.getMonth();
  ijaralar.push({
    id: Date.now(),
    lokatsiya: lok, firma, shartnoma_raqam: raqam,
    didox, eijara, oylik_summa: summa, tolov_kun: kun,
    shartnoma_boshlanish: bosh, shartnoma_tugash: tug,
    oylar: [{ yil:y, oy:m, tolov_status:'pending', schot_status:'missing' }]
  });

  saveIjaralar();
  renderIjara();
  closeAddModal();
  clearAddForm();
}

function clearAddForm(){
  ['new-lokatsiya','new-firma','new-shartnoma','new-summa','new-kun','new-bosh','new-tug'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value='';
  });
}

function openAddModal(){ document.getElementById('add-ijara-modal').classList.add('open'); }
function closeAddModal(){ document.getElementById('add-ijara-modal').classList.remove('open'); }

// Close modal on backdrop click
document.addEventListener('click', e=>{
  if(e.target.id==='ijara-modal') closeIjaraModal();
  if(e.target.id==='add-ijara-modal') closeAddModal();
});
