
let data={
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
    {id:1,typeId:1,naam:"Almelo"},
    {id:2,typeId:1,naam:"Alphen aan den Rijn"},
    {id:3,typeId:1,naam:"Amersfoort"},
    {id:4,typeId:2,naam:"JBOV"},
    {id:5,typeId:2,naam:"JBB"},
    {id:6,typeId:2,naam:"Leger des Heils"},
    {id:7,typeId:3,naam:"Veilig Thuis Twente"},
    {id:8,typeId:4,naam:"GGD Twente"}
  ],
  contactpersonen:[
    {id:1,organisatieId:1,naam:"Jan Jansen",functie:"Jeugdconsulent",mobiel:"06-12345678",vast:"0546-123456",email:"jan.jansen@almelo.nl",opmerkingen:"Werkt ma-do",moeders:[1]},
    {id:2,organisatieId:1,naam:"Harry Nak",functie:"Contractmanager",mobiel:"0612457896",vast:"",email:"",opmerkingen:"di-do",moeders:[1,2]},
    {id:3,organisatieId:4,naam:"Nico de Groot",functie:"Jeugdbeschermer",mobiel:"06-12365478",vast:"",email:"",opmerkingen:"Alleen mailen",moeders:[1]},
    {id:4,organisatieId:7,naam:"Petra de Vries",functie:"Adviseur Veilig Thuis",mobiel:"06-87654321",vast:"",email:"p.devries@example.nl",opmerkingen:"",moeders:[2]}
  ],
  moeders:[
    {id:1,naam:"Maria Jansen",opmerkingen:"Voorkeur telefonisch contact.",actief:true,kinderen:[1,2]},
    {id:2,naam:"Anne de Vries",opmerkingen:"Eerst via contactpersoon afstemmen.",actief:true,kinderen:[3]},
    {id:3,naam:"Moeder Oud",opmerkingen:"Niet meer actief.",actief:false,kinderen:[4]}
  ],
  kinderen:[
    {id:1,naam:"Lisa Jansen",moederId:1},
    {id:2,naam:"Milan Jansen",moederId:1},
    {id:3,naam:"Saar de Vries",moederId:2},
    {id:4,naam:"Oud Kind",moederId:3}
  ]
};

let state={query:"",screen:"home",id:null,inlineSearch:"",showInactive:false,drawer:null,modal:null};
const app=document.getElementById("app");

function typeOrg(id){return data.typeOrganisaties.find(t=>t.id===Number(id))}
function organisatie(id){return data.organisaties.find(o=>o.id===Number(id))}
function contact(id){return data.contactpersonen.find(c=>c.id===Number(id))}
function moeder(id){return data.moeders.find(m=>m.id===Number(id))}
function contactsForMother(id){return data.contactpersonen.filter(c=>c.moeders.includes(id))}
function countContactsOrg(oid){return data.contactpersonen.filter(c=>c.organisatieId===oid).length}
function countOrgsByType(tid){return data.organisaties.filter(o=>o.typeId===tid && countContactsOrg(o.id)>0).length}
function activeMothers(){return data.moeders.filter(m=>m.actief)}
function activeChildren(){const ids=activeMothers().map(m=>m.id);return data.kinderen.filter(k=>ids.includes(k.moederId))}
function nextId(arr){return Math.max(0,...arr.map(x=>x.id))+1}

function setScreen(s,id=null){state.screen=s;state.id=id;state.query="";state.inlineSearch="";state.drawer=null;state.modal=null;render()}
function setQuery(v){state.query=v;render()}
function setInlineSearch(v){state.inlineSearch=v;render()}
function toggleInactive(){state.showInactive=!state.showInactive;render()}
function openDrawer(type,id=null,context={}){state.drawer={type,id,context};render()}
function closeDrawer(){state.drawer=null;state.modal=null;render()}
function openModal(type,context={}){state.modal={type,context};render()}
function closeModal(){state.modal=null;render()}

function saveTypeOrganisatie(){
  const naam=document.getElementById("typeNaam").value.trim();
  if(!naam)return alert("Vul een naam in.");
  const newItem={id:nextId(data.typeOrganisaties),naam};
  data.typeOrganisaties.push(newItem);
  if(state.modal?.context?.selectAfterCreate){state.modal.context.selectAfterCreate(newItem.id)}
  closeModal()
}
function saveOrganisatie(){
  const typeId=Number(document.getElementById("orgType").value);
  const naam=document.getElementById("orgNaam").value.trim();
  if(!naam)return alert("Vul een naam organisatie in.");
  const newItem={id:nextId(data.organisaties),typeId,naam};
  data.organisaties.push(newItem);
  if(state.modal?.context?.selectAfterCreate){state.modal.context.selectAfterCreate(newItem.id)}
  closeModal()
}
function saveMother(){
  const naam=document.getElementById("moederNaam").value.trim();
  const opmerkingen=document.getElementById("moederOpmerkingen").value.trim();
  if(!naam)return alert("Vul een naam in.");
  const id=nextId(data.moeders);
  data.moeders.push({id,naam,opmerkingen,actief:true,kinderen:[]});
  state.drawer=null;
  setScreen("moeder",id)
}
function saveChild(){
  const naam=document.getElementById("kindNaam").value.trim();
  const moederId=Number(document.getElementById("kindMoeder").value);
  if(!naam)return alert("Vul een naam in.");
  const id=nextId(data.kinderen);
  data.kinderen.push({id,naam,moederId});
  const m=moeder(moederId);
  if(!m.kinderen.includes(id))m.kinderen.push(id);
  closeDrawer()
}
function saveContact(){
  const moederId=Number(document.getElementById("contactMoederId")?.value||0);
  const organisatieId=Number(document.getElementById("contactOrganisatie").value);
  const naam=document.getElementById("contactNaam").value.trim();
  const functie=document.getElementById("contactFunctie").value.trim();
  const mobiel=document.getElementById("contactMobiel").value.trim();
  const vast=document.getElementById("contactVast").value.trim();
  const email=document.getElementById("contactEmail").value.trim();
  const opmerkingen=document.getElementById("contactOpmerkingen").value.trim();
  if(!naam)return alert("Vul een naam in.");
  const id=nextId(data.contactpersonen);
  const moeders=moederId?[moederId]:[];
  data.contactpersonen.push({id,organisatieId,naam,functie,mobiel,vast,email,opmerkingen,moeders});
  closeDrawer()
}
function linkContactToMother(contactId,moederId){
  const c=contact(contactId);
  if(!c.moeders.includes(moederId))c.moeders.push(moederId);
  closeDrawer()
}

function shell(content){
  return `<div class="app"><aside class="sidebar">
    <div class="brand">${HAS_LOGO?'<img src="./logo.png" alt="Logo">':''}<div><div class="brand-title">Contacten</div><div class="brand-org">Het Twentse Geluk</div></div></div>
    <div class="search"><input value="${escapeHtml(state.query)}" oninput="setQuery(this.value)" placeholder="Zoeken..." /></div>
    <nav class="nav">
      <button class="${state.screen==='home'?'active':''}" onclick="setScreen('home')">Home</button>
      <button class="${['organisaties','typeOrganisatie','organisatie'].includes(state.screen)?'active':''}" onclick="setScreen('organisaties')">Organisaties</button>
      <button class="${['contactpersonen','contact'].includes(state.screen)?'active':''}" onclick="setScreen('contactpersonen')">Contactpersonen</button>
      <button class="${['moeders','moeder'].includes(state.screen)?'active':''}" onclick="setScreen('moeders')">Moeders</button>
      <button class="${['kinderen','kind'].includes(state.screen)?'active':''}" onclick="setScreen('kinderen')">Kinderen</button>
    </nav>
  </aside><main class="main">${content}</main></div>${state.drawer?drawer():''}${state.modal?modal():''}`
}

const HAS_LOGO = true;

function home(){
  return `<div class="hero"><h2>Contacten</h2></div>
  <div class="home-actions">
    <button class="home-action" onclick="openDrawer('mother')">Nieuwe moeder</button>
    <button class="home-action" onclick="openDrawer('child')">Nieuw kind</button>
    <button class="home-action" onclick="openDrawer('contact')">Nieuw contactpersoon</button>
    <button class="home-action" onclick="openModal('organisatie')">Nieuwe organisatie</button>
  </div>`
}

function organisatiesScreen(){
  const rows=data.typeOrganisaties.filter(t=>countOrgsByType(t.id)>0);
  return `<div class="toolbar"><h2>Organisaties</h2><div class="toolbar-actions"><button class="btn btn-primary" onclick="openModal('organisatie')">Nieuwe organisatie</button><button class="btn btn-primary" onclick="openModal('typeOrganisatie')">Nieuw type organisatie</button></div></div>
  <div class="type-grid">${rows.map(t=>`<button class="type-card" onclick="setScreen('typeOrganisatie',${t.id})"><strong>${t.naam}</strong><span>${countOrgsByType(t.id)} organisaties</span></button>`).join("")}</div>`
}

function typeOrganisatieScreen(id){
  const t=typeOrg(id),q=state.inlineSearch.toLowerCase();
  const rows=data.organisaties.filter(o=>o.typeId===id && countContactsOrg(o.id)>0).filter(o=>!q||o.naam.toLowerCase().includes(q));
  return `<button class="back" onclick="setScreen('organisaties')">← Terug naar organisaties</button>
  <div class="toolbar"><h2>${t.naam}</h2><button class="btn btn-primary" onclick="openDrawer('contact',{},{typeId:${id}})">Nieuwe contactpersoon</button></div>
  <div class="inline-search"><input value="${escapeHtml(state.inlineSearch)}" oninput="setInlineSearch(this.value)" placeholder="Zoek organisatie..." /></div>
  <div class="cards">${rows.map(o=>`<button class="compact-row" onclick="setScreen('organisatie',${o.id})"><div><strong>${o.naam}</strong></div><div><span>${countContactsOrg(o.id)} ${countContactsOrg(o.id)===1?"contactpersoon":"contactpersonen"}</span></div><div class="chev">›</div></button>`).join("")}</div>`
}

function organisatieScreen(id){
  const o=organisatie(id),t=typeOrg(o.typeId),cs=data.contactpersonen.filter(c=>c.organisatieId===id);
  return `<button class="back" onclick="setScreen('typeOrganisatie',${o.typeId})">← Terug naar ${t.naam}</button>
  <div class="hero"><h2>${o.naam}</h2><p>Type organisatie: <strong>${t.naam}</strong></p></div>
  <div class="toolbar"><h2>Contactpersonen</h2><div class="toolbar-actions"><button class="btn btn-secondary">Bewerken</button><button class="btn btn-danger">Verwijderen</button><button class="btn btn-primary" onclick="openDrawer('contact',null,{organisatieId:${o.id}})">Nieuwe contactpersoon</button></div></div>
  <div class="cards">${cs.map(contactRow).join("")}</div>`
}

function contactpersonenScreen(){
  const q=state.inlineSearch.toLowerCase();
  const results=q?data.contactpersonen.filter(c=>{
    const o=organisatie(c.organisatieId),t=typeOrg(o?.typeId);
    return [c.naam,c.functie,c.mobiel,c.vast,c.email,c.opmerkingen,o?.naam,t?.naam].some(v=>(v||"").toLowerCase().includes(q))
  }):[];
  return `<div class="toolbar"><h2>Contactpersonen</h2><button class="btn btn-primary" onclick="openDrawer('contact')">Nieuwe contactpersoon</button></div>
  <div class="inline-search"><input value="${escapeHtml(state.inlineSearch)}" oninput="setInlineSearch(this.value)" placeholder="Zoek op naam, organisatie, type of functie..." /></div>
  <div class="cards">${q?(results.map(contactRow).join("")||`<div class="empty-action">Geen contactpersonen gevonden.</div>`):`<button class="empty-action">Typ om contactpersonen te zoeken.</button>`}</div>`
}

function contactRow(c){
  const o=organisatie(c.organisatieId),t=typeOrg(o?.typeId);
  return `<button class="compact-row" onclick="setScreen('contact',${c.id})"><div><strong>${c.naam}</strong></div><div><span>${t?.naam||""} | ${o?.naam||""} | ${c.functie||""}</span></div><div class="chev">›</div></button>`
}

function contactScreen(id){
  const c=contact(id),o=organisatie(c.organisatieId),t=typeOrg(o.typeId),ms=data.moeders.filter(m=>c.moeders.includes(m.id));
  return `<button class="back" onclick="setScreen('contactpersonen')">← Terug</button>
  <div class="hero"><h2>${c.naam}</h2><p>${c.functie||""}</p></div>
  <div class="grid"><div class="panel">
    ${detailRow("Type organisatie",t.naam)}${detailRow("Organisatie",o.naam)}${detailRow("Mobiel",c.mobiel||"—")}${detailRow("Telefoon",c.vast||"—")}${detailRow("E-mail",c.email||"—")}${detailRow("Opmerkingen",c.opmerkingen||"—")}
    <div class="form-actions"><button class="btn btn-secondary">Bewerken</button><button class="btn btn-danger">Verwijderen</button></div>
  </div><div class="panel"><h3>Moeders</h3><div class="chips">${ms.map(m=>`<button onclick="setScreen('moeder',${m.id})">${m.naam}</button>`).join("")||`<p class="muted">Geen gekoppelde moeders.</p>`}</div></div></div>`
}

function moedersScreen(){
  const source=state.showInactive?data.moeders:activeMothers(),q=state.inlineSearch.toLowerCase();
  const rows=source.filter(m=>!q||[m.naam,m.opmerkingen].some(v=>(v||"").toLowerCase().includes(q)));
  return `<div class="toolbar"><h2>Moeders</h2><div class="toolbar-actions"><button class="btn btn-secondary" onclick="toggleInactive()">${state.showInactive?"Alleen actieve moeders":"Alle moeders tonen"}</button><button class="btn btn-primary" onclick="openDrawer('mother')">Nieuwe moeder</button></div></div>
  <div class="inline-search"><input value="${escapeHtml(state.inlineSearch)}" oninput="setInlineSearch(this.value)" placeholder="Zoek moeder..." /></div>
  <div class="cards">${rows.map(m=>`<button class="compact-row" onclick="setScreen('moeder',${m.id})"><div><strong>${m.naam}</strong></div><div><span>${m.actief?"Actief":"Inactief"}</span></div><div class="chev">›</div></button>`).join("")}</div>`
}

function moederScreen(id){
  const m=moeder(id),cs=contactsForMother(id),ks=data.kinderen.filter(k=>m.kinderen.includes(k.id));
  return `<button class="back" onclick="setScreen('moeders')">← Terug naar moeders</button>
  <div class="profile profile-split"><div><h2>${m.naam}</h2><p>${m.opmerkingen||""}</p></div><div><div class="side-list-title">Kinderen</div><div class="simple-list">${ks.map(k=>`<button class="simple-item" onclick="setScreen('kind',${k.id})">${k.naam}</button>`).join("")}<button class="link-button" onclick="openDrawer('child',null,{moederId:${m.id}})">Nieuw kind</button></div></div></div>
  <div class="panel"><h3>Contactpersonen</h3><div class="cards">${cs.map(contactRow).join("")}</div><div class="section-actions"><button class="btn btn-primary" onclick="openDrawer('linkContact',null,{moederId:${m.id}})">Contactpersoon toevoegen</button></div></div>
  <div class="form-actions"><button class="btn btn-secondary">Bewerken</button><button class="btn btn-secondary">Inactief maken</button></div>`
}

function kinderenScreen(){
  const q=state.inlineSearch.toLowerCase();
  const rows=activeChildren().filter(k=>!q||[k.naam,moeder(k.moederId)?.naam].some(v=>(v||"").toLowerCase().includes(q)));
  return `<div class="toolbar"><h2>Kinderen</h2><button class="btn btn-primary" onclick="openDrawer('child')">Nieuw kind</button></div>
  <div class="inline-search"><input value="${escapeHtml(state.inlineSearch)}" oninput="setInlineSearch(this.value)" placeholder="Zoek kind of moeder..." /></div>
  <div class="cards">${rows.map(k=>`<button class="compact-row" onclick="setScreen('kind',${k.id})"><div><strong>${k.naam}</strong></div><div><span>${moeder(k.moederId).naam}</span></div><div class="chev">›</div></button>`).join("")}</div>`
}

function kindScreen(id){
  const k=data.kinderen.find(x=>x.id===id),m=moeder(k.moederId),sib=data.kinderen.filter(x=>x.moederId===k.moederId&&x.id!==k.id),cs=contactsForMother(m.id);
  return `<button class="back" onclick="setScreen('kinderen')">← Terug naar kinderen</button>
  <div class="profile profile-split"><div><h2>${k.naam}</h2><p><strong>${m.naam}</strong></p><p>${m.opmerkingen||""}</p></div><div><div class="side-list-title">Broertjes / zusjes</div><div class="simple-list">${sib.map(s=>`<button class="simple-item" onclick="setScreen('kind',${s.id})">${s.naam}</button>`).join("")}</div></div></div>
  <div class="panel"><h3>Contactpersonen</h3><div class="cards">${cs.map(contactRow).join("")}</div></div>`
}

function searchScreen(){
  const q=state.query.toLowerCase();
  const orgs=data.organisaties.filter(o=>[o.naam,typeOrg(o.typeId)?.naam].some(v=>(v||"").toLowerCase().includes(q)));
  const cs=data.contactpersonen.filter(c=>[c.naam,c.functie,c.mobiel,c.vast,c.email,c.opmerkingen,organisatie(c.organisatieId)?.naam,typeOrg(organisatie(c.organisatieId)?.typeId)?.naam].some(v=>(v||"").toLowerCase().includes(q)));
  const ms=data.moeders.filter(m=>[m.naam,m.opmerkingen].some(v=>(v||"").toLowerCase().includes(q)));
  const ks=activeChildren().filter(k=>[k.naam,moeder(k.moederId)?.naam].some(v=>(v||"").toLowerCase().includes(q)));
  return `<div class="hero"><h2>Resultaten voor “${escapeHtml(state.query)}”</h2></div>
  ${searchGroup("Organisaties",orgs.map(o=>`<button class="simple-item" onclick="setScreen('organisatie',${o.id})">${o.naam}</button>`))}
  ${searchGroup("Contactpersonen",cs.map(contactRow))}
  ${searchGroup("Moeders",ms.map(m=>`<button class="simple-item" onclick="setScreen('moeder',${m.id})">${m.naam}</button>`))}
  ${searchGroup("Kinderen",ks.map(k=>`<button class="simple-item" onclick="setScreen('kind',${k.id})">${k.naam}</button>`))}`
}

function drawer(){
  const d=state.drawer;
  if(d.type==="mother") return drawerMother();
  if(d.type==="child") return drawerChild();
  if(d.type==="contact") return drawerContact();
  if(d.type==="linkContact") return drawerLinkContact();
}
function drawerMother(){
  return `<div class="drawer-backdrop"><aside class="drawer"><h2>Nieuwe moeder</h2>
    <div class="form-group"><label>Naam</label><input id="moederNaam" autofocus></div>
    <div class="form-group"><label>Opmerkingen</label><textarea id="moederOpmerkingen"></textarea></div>
    <div class="form-actions"><button class="btn btn-secondary" onclick="closeDrawer()">Annuleren</button><button class="btn btn-primary" onclick="saveMother()">Opslaan</button></div>
  </aside></div>`
}
function drawerChild(){
  const moederId=state.drawer.context?.moederId||data.moeders[0]?.id;
  return `<div class="drawer-backdrop"><aside class="drawer"><h2>Nieuw kind</h2>
    <div class="form-group"><label>Naam</label><input id="kindNaam" autofocus></div>
    <div class="form-group"><label>Moeder</label><select id="kindMoeder">${activeMothers().map(m=>`<option value="${m.id}" ${m.id===moederId?"selected":""}>${m.naam}</option>`).join("")}</select></div>
    <div class="form-actions"><button class="btn btn-secondary" onclick="closeDrawer()">Annuleren</button><button class="btn btn-primary" onclick="saveChild()">Opslaan</button></div>
  </aside></div>`
}
function drawerContact(){
  const ctx=state.drawer.context||{};
  const orgId=ctx.organisatieId||data.organisaties[0]?.id;
  const org=organisatie(orgId);
  const typeId=org?.typeId||ctx.typeId||data.typeOrganisaties[0]?.id;
  const orgs=data.organisaties.filter(o=>o.typeId===Number(typeId));
  return `<div class="drawer-backdrop"><aside class="drawer"><h2>Nieuwe contactpersoon</h2>
    ${ctx.moederId?`<input type="hidden" id="contactMoederId" value="${ctx.moederId}">`:``}
    <div class="form-group"><label>Type organisatie</label><div class="form-row"><select id="contactType" onchange="renderContactOrgOptions()">${data.typeOrganisaties.map(t=>`<option value="${t.id}" ${t.id===typeId?"selected":""}>${t.naam}</option>`).join("")}</select><button class="btn btn-secondary" onclick="openModal('typeOrganisatieForContact')">Nieuw</button></div></div>
    <div class="form-group"><label>Organisatie</label><div class="form-row"><select id="contactOrganisatie">${orgs.map(o=>`<option value="${o.id}" ${o.id===orgId?"selected":""}>${o.naam}</option>`).join("")}</select><button class="btn btn-secondary" onclick="openModal('organisatieForContact')">Nieuw</button></div></div>
    <div class="form-group"><label>Naam</label><input id="contactNaam"></div>
    <div class="form-group"><label>Functie</label><input id="contactFunctie"></div>
    <div class="form-group"><label>Mobiel</label><input id="contactMobiel"></div>
    <div class="form-group"><label>Telefoon</label><input id="contactVast"></div>
    <div class="form-group"><label>E-mail</label><input id="contactEmail"></div>
    <div class="form-group"><label>Opmerkingen</label><textarea id="contactOpmerkingen"></textarea></div>
    <div class="form-actions"><button class="btn btn-secondary" onclick="closeDrawer()">Annuleren</button><button class="btn btn-primary" onclick="saveContact()">Opslaan</button></div>
  </aside></div>`
}
function renderContactOrgOptions(){
  const typeId=Number(document.getElementById("contactType").value);
  const select=document.getElementById("contactOrganisatie");
  select.innerHTML=data.organisaties.filter(o=>o.typeId===typeId).map(o=>`<option value="${o.id}">${o.naam}</option>`).join("");
}
function drawerLinkContact(){
  const moederId=state.drawer.context.moederId;
  const typeId=state.drawer.context.typeId||data.typeOrganisaties[0].id;
  const orgs=data.organisaties.filter(o=>o.typeId===typeId);
  const orgId=state.drawer.context.organisatieId||orgs[0]?.id;
  const contacts=data.contactpersonen.filter(c=>c.organisatieId===orgId && !c.moeders.includes(moederId));
  return `<div class="drawer-backdrop"><aside class="drawer"><h2>Contactpersoon toevoegen</h2>
    <div class="form-group"><label>Type organisatie</label><div class="form-row"><select onchange="state.drawer.context.typeId=Number(this.value);state.drawer.context.organisatieId=null;render()">${data.typeOrganisaties.map(t=>`<option value="${t.id}" ${t.id===typeId?"selected":""}>${t.naam}</option>`).join("")}</select><button class="btn btn-secondary" onclick="openModal('typeOrganisatieForLink')">Nieuw</button></div></div>
    <div class="form-group"><label>Organisatie</label><div class="form-row"><select onchange="state.drawer.context.organisatieId=Number(this.value);render()">${orgs.map(o=>`<option value="${o.id}" ${o.id===orgId?"selected":""}>${o.naam}</option>`).join("")}</select><button class="btn btn-secondary" onclick="openModal('organisatieForLink')">Nieuw</button></div></div>
    <h3>Bekende contactpersonen</h3>
    <div class="cards">${contacts.map(c=>`<button class="compact-row" onclick="linkContactToMother(${c.id},${moederId})"><div><strong>${c.naam}</strong></div><div><span>${contactMeta(c)}</span></div><div class="chev">›</div></button>`).join("")}</div>
    <div class="section-actions"><button class="btn btn-primary" onclick="openDrawer('contact',null,{moederId:${moederId},organisatieId:${orgId}})">Nieuwe contactpersoon</button></div>
    <div class="form-actions"><button class="btn btn-secondary" onclick="closeDrawer()">Sluiten</button></div>
  </aside></div>`
}
function contactMeta(c){const o=organisatie(c.organisatieId),t=typeOrg(o?.typeId);return `${t?.naam||""} | ${o?.naam||""} | ${c.functie||""}`}

function modal(){
  const type=state.modal.type;
  if(type.includes("typeOrganisatie")){
    return `<div class="modal-backdrop"><div class="modal"><h2>Nieuw type organisatie</h2>
      <div class="form-group"><label>Naam</label><input id="typeNaam" autofocus></div>
      <div class="form-actions"><button class="btn btn-secondary" onclick="closeModal()">Annuleren</button><button class="btn btn-primary" onclick="saveTypeOrganisatie()">Opslaan</button></div>
    </div></div>`
  }
  if(type.includes("organisatie")){
    const currentType=Number(document.getElementById("contactType")?.value||state.drawer?.context?.typeId||data.typeOrganisaties[0].id);
    return `<div class="modal-backdrop"><div class="modal"><h2>Nieuwe organisatie</h2>
      <div class="form-group"><label>Type organisatie</label><select id="orgType">${data.typeOrganisaties.map(t=>`<option value="${t.id}" ${t.id===currentType?"selected":""}>${t.naam}</option>`).join("")}</select></div>
      <div class="form-group"><label>Naam organisatie</label><input id="orgNaam" autofocus></div>
      <div class="form-actions"><button class="btn btn-secondary" onclick="closeModal()">Annuleren</button><button class="btn btn-primary" onclick="saveOrganisatie()">Opslaan</button></div>
    </div></div>`
  }
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
