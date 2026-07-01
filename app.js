
const data={
  typeOrganisaties:[
    {id:1,naam:"Gemeente"},
    {id:2,naam:"Jeugdbescherming"},
    {id:3,naam:"Veilig Thuis"},
    {id:4,naam:"GGD"},
    {id:5,naam:"Politie"},
    {id:6,naam:"Onderwijs"},
    {id:7,naam:"Zorgaanbieder"}
  ],
  organisaties:[
    {id:1,typeId:1,naam:"Almelo",regio:"Samen14",actief:true},
    {id:2,typeId:1,naam:"Alphen aan den Rijn",regio:"Holland Rijnland",actief:true},
    {id:3,typeId:1,naam:"Amersfoort",regio:"Regio Amersfoort",actief:true},
    {id:4,typeId:2,naam:"JBOV",regio:"Overijssel",actief:true},
    {id:5,typeId:2,naam:"JBB",regio:"Brabant",actief:true},
    {id:6,typeId:2,naam:"Leger des Heils",regio:"Landelijk",actief:true},
    {id:7,typeId:3,naam:"Veilig Thuis Twente",regio:"Twente",actief:true},
    {id:8,typeId:4,naam:"GGD Twente",regio:"Twente",actief:true}
  ],
  contactpersonen:[
    {id:1,organisatieId:1,naam:"Jan Jansen",functie:"Jeugdconsulent",mobiel:"06-12345678",vast:"0546-123456",email:"jan.jansen@almelo.nl",opmerkingen:"Werkt ma-do",moeders:[1]},
    {id:2,organisatieId:1,naam:"Harry Nak",functie:"Contractmanager",mobiel:"0612457896",vast:"",email:"",opmerkingen:"di-do",moeders:[1,2]},
    {id:3,organisatieId:4,naam:"Nico de Groot",functie:"Jeugdbeschermer",mobiel:"06-12365478",vast:"",email:"",opmerkingen:"Alleen mailen",moeders:[1]},
    {id:4,organisatieId:7,naam:"Petra de Vries",functie:"Adviseur Veilig Thuis",mobiel:"06-87654321",vast:"",email:"p.devries@example.nl",opmerkingen:"",moeders:[2]}
  ],
  moeders:[
    {id:1,naam:"Familie Jansen",opmerkingen:"Voorkeur telefonisch contact.",actief:true,kinderen:[1,2]},
    {id:2,naam:"Familie De Vries",opmerkingen:"Eerst via contactpersoon afstemmen.",actief:true,kinderen:[3]},
    {id:3,naam:"Familie Oud",opmerkingen:"Niet meer actief.",actief:false,kinderen:[4]}
  ],
  kinderen:[
    {id:1,naam:"Lisa Jansen",moederId:1},
    {id:2,naam:"Milan Jansen",moederId:1},
    {id:3,naam:"Saar de Vries",moederId:2},
    {id:4,naam:"Oud Kind",moederId:3}
  ]
};

let state={query:"",screen:"home",id:null,inlineSearch:"",showInactive:false};
const app=document.getElementById("app");

function typeOrg(id){return data.typeOrganisaties.find(t=>t.id===id)}
function organisatie(id){return data.organisaties.find(o=>o.id===id)}
function contact(id){return data.contactpersonen.find(c=>c.id===id)}
function moeder(id){return data.moeders.find(m=>m.id===id)}
function contactsForMother(id){return data.contactpersonen.filter(c=>c.moeders.includes(id))}
function countContactsOrg(oid){return data.contactpersonen.filter(c=>c.organisatieId===oid).length}
function countOrgsByType(tid){return data.organisaties.filter(o=>o.typeId===tid && countContactsOrg(o.id)>0).length}
function activeMothers(){return data.moeders.filter(m=>m.actief)}
function activeChildren(){const ids=activeMothers().map(m=>m.id);return data.kinderen.filter(k=>ids.includes(k.moederId))}

function setScreen(s,id=null){state.screen=s;state.id=id;state.query="";state.inlineSearch="";render()}
function setQuery(v){state.query=v;render()}
function setInlineSearch(v){state.inlineSearch=v;render()}
function toggleInactive(){state.showInactive=!state.showInactive;render()}

function shell(content){
  return `<div class="app"><aside class="sidebar">
    <div class="brand"><div class="brand-title">Contacten</div><div class="brand-org">Het Twentse Geluk</div></div>
    <div class="search"><input value="${escapeHtml(state.query)}" oninput="setQuery(this.value)" placeholder="Zoeken..." /></div>
    <nav class="nav">
      <button class="${state.screen==='home'?'active':''}" onclick="setScreen('home')">Home</button>
      <button class="${state.screen==='organisaties'||state.screen==='typeOrganisatie'||state.screen==='organisatie'?'active':''}" onclick="setScreen('organisaties')">Organisaties</button>
      <button class="${state.screen==='contactpersonen'||state.screen==='contact'?'active':''}" onclick="setScreen('contactpersonen')">Contactpersonen</button>
      <button class="${state.screen==='moeders'||state.screen==='moeder'?'active':''}" onclick="setScreen('moeders')">Moeders</button>
      <button class="${state.screen==='kinderen'||state.screen==='kind'?'active':''}" onclick="setScreen('kinderen')">Kinderen</button>
    </nav>
  </aside><main class="main">${content}</main></div>`
}

function home(){
  return `<div class="hero"><h2>Contacten</h2></div>
  <div class="home-actions">
    <button class="home-action">Nieuwe moeder</button>
    <button class="home-action">Nieuw kind</button>
    <button class="home-action">Nieuw contactpersoon</button>
    <button class="home-action">Nieuwe organisatie</button>
  </div>`
}

function organisatiesScreen(){
  const rows=data.typeOrganisaties.filter(t=>countOrgsByType(t.id)>0);
  return `<div class="toolbar"><h2>Organisaties</h2><div class="toolbar-actions"><button class="btn btn-primary">Nieuwe organisatie</button><button class="btn btn-secondary">Nieuw type organisatie</button></div></div>
  <div class="type-grid">${rows.map(t=>`<button class="type-card" onclick="setScreen('typeOrganisatie',${t.id})"><strong>${t.naam}</strong><span>${countOrgsByType(t.id)} organisaties</span></button>`).join("")}</div>`
}

function typeOrganisatieScreen(id){
  const t=typeOrg(id),q=state.inlineSearch.toLowerCase();
  const rows=data.organisaties.filter(o=>o.typeId===id && countContactsOrg(o.id)>0).filter(o=>!q||o.naam.toLowerCase().includes(q));
  return `<button class="back" onclick="setScreen('organisaties')">← Terug naar organisaties</button>
  <div class="toolbar"><h2>${t.naam}</h2><button class="btn btn-primary">Nieuwe contactpersoon</button></div>
  <div class="inline-search"><input value="${escapeHtml(state.inlineSearch)}" oninput="setInlineSearch(this.value)" placeholder="Zoek organisatie..." /></div>
  <div class="cards">${rows.map(o=>`<button class="compact-row" onclick="setScreen('organisatie',${o.id})"><div><strong>${o.naam}</strong></div><div><span>${countContactsOrg(o.id)} ${countContactsOrg(o.id)===1?"contactpersoon":"contactpersonen"}</span></div><div class="chev">›</div></button>`).join("")||`<div class="empty">Geen organisaties gevonden.</div>`}</div>`
}

function organisatieScreen(id){
  const o=organisatie(id),t=typeOrg(o.typeId),cs=data.contactpersonen.filter(c=>c.organisatieId===id);
  return `<button class="back" onclick="setScreen('typeOrganisatie',${o.typeId})">← Terug naar ${t.naam}</button>
  <div class="hero"><h2>${o.naam}</h2><p>Type organisatie: <strong>${t.naam}</strong>${o.regio?`<br>Regio: <strong>${o.regio}</strong>`:""}</p></div>
  <div class="toolbar"><h2>Contactpersonen</h2><button class="btn btn-primary">Nieuwe contactpersoon</button></div>
  <div class="cards">${cs.map(contactRow).join("")||`<div class="empty">Geen contactpersonen gevonden.</div>`}</div>`
}

function contactpersonenScreen(){
  const q=state.inlineSearch.toLowerCase();
  const results=q?data.contactpersonen.filter(c=>{
    const o=organisatie(c.organisatieId),t=typeOrg(o?.typeId);
    return [c.naam,c.functie,c.mobiel,c.vast,c.email,c.opmerkingen,o?.naam,t?.naam].some(v=>(v||"").toLowerCase().includes(q))
  }):[];
  return `<div class="toolbar"><h2>Contactpersonen</h2><button class="btn btn-primary">Nieuwe contactpersoon</button></div>
  <div class="inline-search"><input value="${escapeHtml(state.inlineSearch)}" oninput="setInlineSearch(this.value)" placeholder="Zoek op naam, organisatie, type of functie..." /></div>
  <div class="cards">${q?(results.map(contactRow).join("")||`<div class="empty">Geen contactpersonen gevonden.</div>`):`<div class="empty">Typ om contactpersonen te zoeken.</div>`}</div>`
}

function contactRow(c){return `<button class="compact-row" onclick="setScreen('contact',${c.id})"><div><strong>${c.naam}</strong></div><div><span>${c.functie||"Geen functie"}</span></div><div class="chev">›</div></button>`}

function contactScreen(id){
  const c=contact(id),o=organisatie(c.organisatieId),t=typeOrg(o.typeId),ms=data.moeders.filter(m=>c.moeders.includes(m.id));
  return `<button class="back" onclick="setScreen('contactpersonen')">← Terug</button>
  <div class="hero"><h2>${c.naam}</h2><p>${c.functie||""}</p></div>
  <div class="grid"><div class="panel">
    ${detailRow("Type organisatie",t.naam)}${detailRow("Organisatie",o.naam)}${detailRow("Mobiel",c.mobiel||"—")}${detailRow("Vast",c.vast||"—")}${detailRow("E-mail",c.email||"—")}${detailRow("Opmerkingen",c.opmerkingen||"—")}
  </div><div class="panel"><h3>Moeders</h3><div class="chips">${ms.map(m=>`<button onclick="setScreen('moeder',${m.id})">${m.naam}</button>`).join("")||`<p class="muted">Geen gekoppelde moeders.</p>`}</div></div></div>`
}

function moedersScreen(){
  const source=state.showInactive?data.moeders:activeMothers(),q=state.inlineSearch.toLowerCase();
  const rows=source.filter(m=>!q||[m.naam,m.opmerkingen].some(v=>(v||"").toLowerCase().includes(q)));
  return `<div class="toolbar"><h2>Moeders</h2><div class="toolbar-actions"><button class="btn btn-secondary" onclick="toggleInactive()">${state.showInactive?"Alleen actieve moeders":"Alle moeders tonen"}</button><button class="btn btn-primary">Nieuwe moeder</button></div></div>
  <div class="inline-search"><input value="${escapeHtml(state.inlineSearch)}" oninput="setInlineSearch(this.value)" placeholder="Zoek moeder..." /></div>
  <div class="cards">${rows.map(m=>`<button class="compact-row" onclick="setScreen('moeder',${m.id})"><div><strong>${m.naam}</strong></div><div><span>${m.actief?"Actief":"Inactief"}</span></div><div class="chev">›</div></button>`).join("")||`<div class="empty">Geen moeders gevonden.</div>`}</div>`
}

function moederScreen(id){
  const m=moeder(id),cs=contactsForMother(id),ks=data.kinderen.filter(k=>m.kinderen.includes(k.id));
  return `<button class="back" onclick="setScreen('moeders')">← Terug naar moeders</button>
  <div class="profile profile-split"><div><h2>${m.naam}</h2><p>${m.opmerkingen||"Geen opmerkingen"}</p></div><div><div class="side-list-title">Kinderen</div><div class="simple-list">${ks.map(k=>`<button class="simple-item" onclick="setScreen('kind',${k.id})">${k.naam}</button>`).join("")||`<span class="muted">Geen kinderen.</span>`}</div></div></div>
  <div class="panel"><h3>Contactpersonen</h3><div class="cards">${cs.map(contactRow).join("")||`<div class="empty">Geen contactpersonen gekoppeld.</div>`}</div></div>`
}

function kinderenScreen(){
  const q=state.inlineSearch.toLowerCase();
  const rows=activeChildren().filter(k=>!q||[k.naam,moeder(k.moederId)?.naam].some(v=>(v||"").toLowerCase().includes(q)));
  return `<div class="toolbar"><h2>Kinderen</h2><button class="btn btn-primary">Nieuw kind</button></div>
  <div class="inline-search"><input value="${escapeHtml(state.inlineSearch)}" oninput="setInlineSearch(this.value)" placeholder="Zoek kind of moeder..." /></div>
  <div class="cards">${rows.map(k=>`<button class="compact-row" onclick="setScreen('kind',${k.id})"><div><strong>${k.naam}</strong></div><div><span>${moeder(k.moederId).naam}</span></div><div class="chev">›</div></button>`).join("")||`<div class="empty">Geen kinderen gevonden.</div>`}</div>`
}

function kindScreen(id){
  const k=data.kinderen.find(x=>x.id===id),m=moeder(k.moederId),sib=data.kinderen.filter(x=>x.moederId===k.moederId&&x.id!==k.id),cs=contactsForMother(m.id);
  return `<button class="back" onclick="setScreen('kinderen')">← Terug naar kinderen</button>
  <div class="profile profile-split"><div><h2>${k.naam}</h2><p><strong>${m.naam}</strong></p><p>${m.opmerkingen||"Geen opmerkingen"}</p></div><div><div class="side-list-title">Broertjes / zusjes</div><div class="simple-list">${sib.map(s=>`<button class="simple-item" onclick="setScreen('kind',${s.id})">${s.naam}</button>`).join("")||`<span class="muted">Geen broertjes of zusjes.</span>`}</div></div></div>
  <div class="panel"><h3>Contactpersonen</h3><div class="cards">${cs.map(contactRow).join("")||`<div class="empty">Geen contactpersonen gekoppeld.</div>`}</div></div>`
}

function searchScreen(){
  const q=state.query.toLowerCase();
  const orgs=data.organisaties.filter(o=>[o.naam,o.regio,typeOrg(o.typeId)?.naam].some(v=>(v||"").toLowerCase().includes(q)));
  const cs=data.contactpersonen.filter(c=>[c.naam,c.functie,c.mobiel,c.vast,c.email,c.opmerkingen,organisatie(c.organisatieId)?.naam,typeOrg(organisatie(c.organisatieId)?.typeId)?.naam].some(v=>(v||"").toLowerCase().includes(q)));
  const ms=data.moeders.filter(m=>[m.naam,m.opmerkingen].some(v=>(v||"").toLowerCase().includes(q)));
  const ks=activeChildren().filter(k=>[k.naam,moeder(k.moederId)?.naam].some(v=>(v||"").toLowerCase().includes(q)));
  return `<div class="hero"><h2>Resultaten voor “${escapeHtml(state.query)}”</h2></div>
  ${searchGroup("Organisaties",orgs.map(o=>`<button class="simple-item" onclick="setScreen('organisatie',${o.id})">${o.naam}</button>`))}
  ${searchGroup("Contactpersonen",cs.map(contactRow))}
  ${searchGroup("Moeders",ms.map(m=>`<button class="simple-item" onclick="setScreen('moeder',${m.id})">${m.naam}</button>`))}
  ${searchGroup("Kinderen",ks.map(k=>`<button class="simple-item" onclick="setScreen('kind',${k.id})">${k.naam}</button>`))}`
}

function searchGroup(t,rows){return `<section class="panel"><h3>${t}</h3><div class="cards">${rows.length?rows.join(""):`<p class="muted">Geen resultaten.</p>`}</div></section>`}
function detailRow(l,v){return `<div class="row"><label>${l}</label><strong>${v}</strong></div>`}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]))}

function render(){
  let c="";
  if(state.query)c=searchScreen();
  else if(state.screen==="home")c=home();
  else if(state.screen==="organisaties")c=organisatiesScreen();
  else if(state.screen==="typeOrganisatie")c=typeOrganisatieScreen(state.id);
  else if(state.screen==="organisatie")c=organisatieScreen(state.id);
  else if(state.screen==="contactpersonen")c=contactpersonenScreen();
  else if(state.screen==="contact")c=contactScreen(state.id);
  else if(state.screen==="moeders")c=moedersScreen();
  else if(state.screen==="moeder")c=moederScreen(state.id);
  else if(state.screen==="kinderen")c=kinderenScreen();
  else if(state.screen==="kind")c=kindScreen(state.id);
  app.innerHTML=shell(c)
}
render();
