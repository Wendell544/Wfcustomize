/* ===== HELPERS ===== */
document.documentElement.classList.add("js");
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const brl=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const P=PRODUTO,pers=id=>P.personalizacoes.find(x=>x.id===id),cor=n=>P.cores.find(c=>c.nome===n);
const lum=h=>{const n=parseInt(h.slice(1),16),f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4};return .2126*f(n>>16)+.7152*f(n>>8&255)+.0722*f(n&255)};
const wa=t=>`https://wa.me/${CONFIG.whats}${t?"?text="+encodeURIComponent(t):""}`;
/* funções puras de cálculo */
const nq=c=>c.reduce((a,i)=>a+i.q,0),unit=i=>pers(i.pers).preco,sub=i=>i.q*unit(i),total=c=>c.reduce((a,i)=>a+sub(i),0),faltam=c=>Math.max(0,P.min-nq(c));
const fmtFrete=()=>CONFIG.frete==null?"Frete a combinar":brl(CONFIG.frete);
const desc=i=>`${i.cor} · ${i.tam} · ${i.gen} · ${pers(i.pers).nome}`;

/* ===== ESTADO ===== */
const sel={cor:P.cores[0].nome,tam:P.tamanhos[0],gen:P.generos[0],pers:P.personalizacoes[0].id,q:1};
const MIGRA={costas:"frente_costas",frentecostas:"frente_costas",frente:"peito"};
let cart=[];
try{cart=(JSON.parse(localStorage.getItem("wf_cart")||"[]")||[]).map(i=>{const p=i.pers||MIGRA[i.p]||i.p;return{cor:i.cor,tam:i.tam,gen:i.gen,pers:MIGRA[p]||p,q:+i.q||1}}).filter(i=>pers(i.pers)&&cor(i.cor))}catch(e){cart=[]}
function save(pulse){try{localStorage.setItem("wf_cart",JSON.stringify(cart))}catch(e){}const b=$("#cnt");b.textContent=nq(cart);if(pulse){b.classList.remove("pulse");void b.offsetWidth;b.classList.add("pulse")}barPaint()}
const CURRENT=()=>location.hash.slice(1)||"inicio",IS_HOME=()=>!["carrinho","checkout","entregas","privacidade"].includes(CURRENT());
function barPaint(){const b=$("#mbar"),on=cart.length>0&&IS_HOME();b.classList.toggle("on",on);document.body.classList.toggle("hasbar",on);if(on){$("#mb1").textContent=`${nq(cart)}/${P.min} peças`;$("#mb2").textContent=faltam(cart)?`faltam ${faltam(cart)} · ${brl(total(cart))}`:`mínimo atingido · ${brl(total(cart))}`}}
function reveal(){const els=$$(".rv:not(.in)");if(!("IntersectionObserver" in window)){els.forEach(e=>e.classList.add("in"));return}const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting||x.boundingClientRect.bottom<0){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.05});els.forEach(e=>io.observe(e))}
function openWa(u){const a=document.createElement("a");a.href=u;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()}
let tt;function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),2400)}

/* ===== ILUSTRAÇÃO ===== */
const shade=(hex,f)=>{const n=parseInt(hex.slice(1),16),c=v=>Math.max(0,Math.min(255,Math.round(v*f))).toString(16).padStart(2,"0");return"#"+c(n>>16)+c(n>>8&255)+c(n&255)};
function shirt(hex,side,logo){
 const f=side==="f",light=lum(hex)>.45,lc=light?["#7e22ce","#db2777"]:["#ffffff","#f5d0fe"],lt=light?"#ffffff":"#4a1d6e";
 const body="M148 44C165 54 235 54 252 44L326 70C340 74 348 80 354 90L392 160C394 166 392 170 387 172L338 196C333 198 329 196 327 192L310 164V372C310 384 302 392 290 392H110C98 392 90 384 90 372V164L73 192C71 196 67 198 62 196L13 172C8 170 6 166 8 160L46 90C52 80 60 74 74 70Z";
 const lower="M150 45C168 108 232 108 250 45",upper="M150 45C172 66 228 66 250 45",back="M150 45C172 74 228 74 250 45";
 const emblem=(x,y,w,h,r,fs)=>`<g opacity=".95"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#lg)"/><rect x="${x+w*.06}" y="${y+h*.08}" width="${w*.88}" height="${h*.84}" rx="${r*.7}" fill="none" stroke="${lt}" stroke-opacity=".55" stroke-width="${w>80?2:1}"/><text x="${x+w/2}" y="${y+h/2+fs*.36}" font-size="${fs}" font-weight="800" text-anchor="middle" fill="${lt}" font-family="Inter,Arial,sans-serif" letter-spacing="1">LOGO</text></g>`;
 const lg=!logo?"":f?emblem(214,116,50,38,6,12):emblem(138,100,124,100,10,27);
 const neckhole=f?`<path d="${upper}L250 45C232 108 168 108 150 45Z" fill="${hex}"/><path d="${upper}L250 45C232 108 168 108 150 45Z" fill="#000" opacity=".32"/>`:"";
 const col=f?`<path d="${upper}" fill="none" stroke="${hex}" stroke-width="9" stroke-linecap="round"/><path d="${upper}" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="9" stroke-linecap="round"/><path d="${lower}" fill="none" stroke="${hex}" stroke-width="15" stroke-linecap="round"/><path d="${lower}" fill="none" stroke="#000" stroke-opacity=".13" stroke-width="15" stroke-linecap="round" stroke-dasharray="1.4 3"/><path d="${lower}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2" transform="translate(0 -5)"/>`
  :`<path d="${back}" fill="none" stroke="${hex}" stroke-width="13" stroke-linecap="round"/><path d="${back}" fill="none" stroke="#000" stroke-opacity=".13" stroke-width="13" stroke-linecap="round" stroke-dasharray="1.4 3"/><rect x="187" y="78" width="26" height="15" rx="2" fill="#fff" opacity=".88"/><path d="M191 83H209M191 87H204" stroke="#999" stroke-width="1.3"/>`;
 return "data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lc[0]}"/><stop offset="1" stop-color="${lc[1]}"/></linearGradient><linearGradient id="h" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".2" stop-color="#000" stop-opacity=".02"/><stop offset=".5" stop-color="#fff" stop-opacity=".05"/><stop offset=".8" stop-color="#000" stop-opacity=".02"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient><radialGradient id="r" cx=".5" cy=".38" r=".45"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><pattern id="t" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0L4 4M4 0L0 4" stroke="#000" stroke-opacity=".04"/></pattern><clipPath id="c"><path d="${body}"/></clipPath></defs>
<ellipse cx="200" cy="404" rx="135" ry="9" fill="#000" opacity=".16"/><path d="${body}" fill="${hex}"/>
<g clip-path="url(#c)">${neckhole}<rect width="400" height="420" fill="url(#t)"/>${lg}
<rect width="400" height="420" fill="url(#h)"/><rect width="400" height="420" fill="url(#v)"/><rect width="400" height="420" fill="url(#r)"/>
<g fill="none" stroke-linecap="round"><path d="M96 182C124 204 138 238 148 276" stroke="#000" stroke-opacity=".09" stroke-width="9"/><path d="M304 182C276 204 262 238 252 276" stroke="#000" stroke-opacity=".09" stroke-width="9"/><path d="M120 310C150 326 178 322 206 346" stroke="#000" stroke-opacity=".08" stroke-width="8"/><path d="M290 300C262 316 244 312 226 338" stroke="#000" stroke-opacity=".07" stroke-width="7"/><path d="M168 230C186 246 214 244 232 228" stroke="#fff" stroke-opacity=".1" stroke-width="6"/><path d="M345 100L368 150M55 100L32 150" stroke="#000" stroke-opacity=".1" stroke-width="7"/><path d="M330 112L352 148M70 112L48 148" stroke="#fff" stroke-opacity=".1" stroke-width="3"/></g></g>
<path d="${body}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="2"/>
<g fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.6"><path d="M326 70C322 110 316 140 310 164M74 70C78 110 84 140 90 164"/></g>
<g fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.3" stroke-dasharray="4 3"><path d="M381 163L333 186M19 163L67 186M95 378H305"/><path d="M322 76C318 112 313 140 307 164M78 76C82 112 87 140 93 164"/></g>
${col}${f?"":""}</svg>`)}

/* ===== RENDER ===== */
const seg=(k,arr)=>`<div class="seg" role="group" aria-label="${k==="tam"?"Tamanho":"Modelo"}">${arr.map(v=>`<button type="button" data-act="${k}" data-v="${esc(v)}" aria-pressed="${sel[k]===v}">${esc(v)}</button>`).join("")}</div>`;
const hx=(n,i)=>(cor(n)||P.cores[i%P.cores.length]).hex;
function viewHome(){const mn=Math.min(...P.personalizacoes.map(x=>x.preco));
return `<div class="hero"><div class="blob b1"></div><div class="blob b2"></div><div class="w"><div class="hero-grid"><div><span class="eyebrow">Atacado de camisetas</span><h1>Camisetas premium no atacado, <em>com a sua logo</em></h1><p>100% algodão em ${P.cores.length} cores. Misture tamanhos e modelos no mesmo pedido e feche pelo WhatsApp.</p><div class="cta"><button class="btn wh" data-act="scroll">Montar pedido</button><a class="btn ghost" href="${wa("Olá! Vim pelo site e gostaria de falar sobre as camisetas no atacado.")}" target="_blank" rel="noopener">Falar no WhatsApp</a></div>
<ul class="trust"><li>Mínimo ${P.min} peças</li><li>${P.cores.length} cores</li><li>Frete combinado no WhatsApp</li><li>Logo na frente ou frente e costas</li></ul></div>
<div class="hero-art" aria-hidden="true"><img class="s1" alt="" width="400" height="420" src="${shirt(hx("Vinho",10),"f",false)}"><img class="s3" alt="" width="400" height="420" src="${shirt(hx("Amarela",8),"b",true)}"><img class="s2" alt="" width="400" height="420" src="${shirt(hx("Azul royal",14),"f",true)}"><span class="chip c1">Mínimo ${P.min} peças</span><span class="chip c2">A partir de ${brl(mn)}</span></div></div>
<div class="facts"><div><b>${brl(mn)}</b><span>por peça, a partir de</span></div><div><b>100%</b><span>algodão</span></div><div><b>P · M · G</b><span>masculina e feminina</span></div><div><b>${P.min}+</b><span>peças por pedido</span></div></div></div></div>
<section class="rv" id="valores"><div class="w"><div class="sechd"><div class="kicker">Valores</div><h2>Preço por peça</h2><p>Mínimo de ${P.min} peças por pedido, somando todas as cores, tamanhos e modelos.</p></div><div class="prices">${P.personalizacoes.map(x=>{const hx2="#7c3aed",im=(s,l,alt)=>`<img alt="${alt}" width="400" height="420" src="${shirt(hx2,s,l)}">`;return `<div class="pc"><div class="pimgs">${x.id==="nenhuma"?im("f",false,"Camiseta lisa"):x.id==="peito"?im("f",true,"Camiseta com logo no peito"):im("f",true,"Camiseta com logo na frente")+im("b",true,"Camiseta com logo nas costas")}</div><div><h3>${esc(x.nome)}</h3><div class="mut sm">${esc(x.desc)}</div></div><div class="pr">${brl(x.preco)} <small>por peça</small></div><button class="btn full" data-act="pickpers" data-v="${x.id}">Escolher</button></div>`}).join("")}</div></div></section>
<section class="rv" id="monte"><div class="w"><div class="cfg"><div class="gal"><div class="stage"><div class="main-img-wrap" id="pv"></div>${P.fotos.length?`<div class="thumbs">${P.fotos.map((f,i)=>`<button type="button" data-act="thumb" data-i="${i}" aria-label="Ampliar foto ${i+1}"><img loading="lazy" decoding="async" src="${esc(f)}" alt="${esc(P.nome)}, foto ${i+1}"></button>`).join("")}</div>`:""}</div></div>
<div class="panel"><h2 style="margin-bottom:var(--s5)">${esc(P.nome)}</h2>
<fieldset><legend><span class="n">1</span>Cor<em id="cn"></em></legend><div class="sw">${P.cores.map(x=>`<button type="button" data-act="cor" data-v="${esc(x.nome)}" aria-pressed="${x.nome===sel.cor}"><i style="background:${x.hex}"></i>${esc(x.nome)}</button>`).join("")}</div></fieldset>
<fieldset><legend><span class="n">2</span>Tamanho</legend>${seg("tam",P.tamanhos)}<p class="meas" id="meas" aria-live="polite"></p></fieldset>
<fieldset><legend><span class="n">3</span>Modelo</legend>${seg("gen",P.generos)}</fieldset>
<fieldset><legend><span class="n">4</span>Personalização</legend><div class="opts">${P.personalizacoes.map(x=>`<div class="opt"><input type="radio" name="pers" id="p_${x.id}" value="${x.id}" ${x.id===sel.pers?"checked":""}><label for="p_${x.id}"><span>${esc(x.nome)}<span class="d">${esc(x.desc)}</span></span><b>${brl(x.preco)}</b></label></div>`).join("")}</div></fieldset>
<fieldset><legend><span class="n">5</span>Quantidade</legend><div class="qty"><button type="button" data-act="qd" data-d="-1" aria-label="Diminuir quantidade">−</button><input id="pq" type="number" min="1" inputmode="numeric" value="${sel.q}" aria-label="Quantidade"><button type="button" data-act="qd" data-d="1" aria-label="Aumentar quantidade">+</button></div></fieldset>
<div class="buy"><div class="p" id="pp"></div><button class="btn" id="add" data-act="add">Adicionar ao pedido</button></div>
<div class="res" id="rs" aria-live="polite"></div></div></div></div></section>${medidasHtml()}`}
function paintPreview(){const c=cor(sel.cor),w=$("#pv");if(!w)return;$("#cn").textContent=c.nome;
 const im=(src,alt,cap,real)=>`<figure><img ${real?'class="real" ':""}decoding="async" src="${src}" alt="${esc(alt)}" width="400" height="440">${cap?`<figcaption>${cap}</figcaption>`:""}</figure>`;
 if(c.foto)w.innerHTML=im(c.foto,`Camiseta ${c.nome}, foto real`,"",true);
 else if(sel.pers==="frente_costas")w.innerHTML=im(shirt(c.hex,"f",true),`Camiseta ${c.nome}, frente com logo`,"FRENTE")+im(shirt(c.hex,"b",true),`Camiseta ${c.nome}, costas com logo`,"COSTAS");
 else w.innerHTML=im(shirt(c.hex,"f",sel.pers==="peito"),`Camiseta ${c.nome}${sel.pers==="peito"?", logo no peito esquerdo":", lisa"}`,"")}
function paintPrice(){const p=pers(sel.pers),q=Math.max(0,sel.q);$("#pp").innerHTML=`${brl(q*p.preco)}<small>${brl(p.preco)} por peça × ${q}</small>`;$("#add").disabled=q<1}
function paintSummary(){const e=$("#rs");if(!e)return;const q=nq(cart),f=faltam(cart),ok=!f;
 e.innerHTML=`<h3>Seu pedido</h3>${cart.length?`<ul>${cart.map(i=>`<li><span>${i.q}× ${esc(desc(i))}</span><b>${brl(sub(i))}</b></li>`).join("")}</ul>`:'<p class="mut sm" style="margin:0 0 var(--s3)">Nenhuma peça adicionada.</p>'}<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${P.min}" aria-valuenow="${Math.min(q,P.min)}"><i style="transform:scaleX(${Math.min(1,q/P.min)})"></i></div><div class="pg ${ok?"ok":"pend"}"><span>${q}/${P.min} — ${ok?"mínimo atingido":"faltam "+f}</span><span>${brl(total(cart))}</span></div><a class="btn full" href="#carrinho">Ver carrinho</a>`}
function viewCart(){if(!cart.length)return `<section><div class="w empty"><h2>Carrinho vazio</h2><p class="mut">Adicione camisetas para continuar.</p><a class="btn" href="#inicio">Montar pedido</a></div></section>`;const f=faltam(cart);
return `<section><div class="w"><h2 style="margin-bottom:var(--s5)">Carrinho</h2><div class="two"><div>${cart.map((i,n)=>`<div class="line"><div class="i"><b><span class="dot" style="background:${cor(i.cor).hex}"></span>${esc(i.cor)}</b> · ${esc(i.tam)} · ${esc(i.gen)}<div class="mut sm">${esc(pers(i.pers).nome)} · ${brl(unit(i))} por peça</div></div><div class="qty"><button data-act="cd" data-i="${n}" data-d="-1" aria-label="Diminuir">−</button><input data-ci="${n}" type="number" min="1" inputmode="numeric" value="${i.q}" aria-label="Quantidade"><button data-act="cd" data-i="${n}" data-d="1" aria-label="Aumentar">+</button></div><b>${brl(sub(i))}</b><button class="rm" data-act="rm" data-i="${n}" aria-label="Remover ${esc(desc(i))}">Remover</button></div>`).join("")}<p style="margin-top:var(--s4)"><a href="#inicio" class="btn ghost" style="color:var(--primary)">Adicionar mais peças</a></p></div>
<div class="panel" aria-live="polite"><div class="tot"><span>Peças</span><b>${nq(cart)}</b></div><div class="tot"><span>Subtotal</span><b>${brl(total(cart))}</b></div><div class="tot"><span>Frete</span><b>${fmtFrete()}</b></div><div class="pg ${f?"pend":"ok"}"><span>${nq(cart)}/${P.min} — ${f?"faltam "+f:"mínimo atingido"}</span></div>${f?`<p class="warn" role="alert">Mínimo ${P.min} peças. Faltam ${f}.</p>`:""}<button class="btn full" data-act="gocheck" ${f?"disabled aria-disabled='true'":""}>Finalizar pedido</button></div></div></div></section>`}
const FIELDS=[["nome","Nome completo","text","name"],["tel","Telefone com DDD","tel","tel"],["cep","CEP","text","postal-code"],["uf","Estado (UF)","text","address-level1"],["cidade","Cidade","text","address-level2"],["bairro","Bairro","text","off"],["rua","Rua ou avenida","text","street-address"],["num","Número","text","off"],["comp","Complemento (opcional)","text","off"],["ref","Ponto de referência (opcional)","text","off"]];
function viewCheckout(){if(!cart.length||faltam(cart))return `<section><div class="w empty"><h2>Pedido incompleto</h2><p class="mut">${cart.length?`Faltam ${faltam(cart)} peças para o mínimo de ${P.min}.`:"Seu carrinho está vazio."}</p><a class="btn" href="#carrinho">Voltar</a></div></section>`;
return `<section><div class="w"><h2 style="margin-bottom:var(--s5)">Finalizar pedido</h2><div class="two"><form id="ck" class="panel" novalidate><div class="fg">${FIELDS.map(([k,l,t,a])=>`<div class="fld"><label for="f_${k}">${l}</label><input id="f_${k}" name="${k}" type="${t}" autocomplete="${a}" aria-describedby="e_${k}" ${k==="tel"||k==="cep"?'inputmode="numeric"':""}><div class="err" id="e_${k}" role="alert"></div></div>`).join("")}</div><div class="fld" style="margin-top:var(--s3)"><label for="f_obs">Observações</label><textarea id="f_obs"></textarea></div><button class="btn full" type="submit" style="margin-top:var(--s4)">Finalizar pelo WhatsApp</button><p class="mut sm">O WhatsApp abre com a mensagem pronta. O pedido só é enviado quando você confirmar lá.</p></form>
<div class="panel"><h3 style="margin-bottom:var(--s3)">Resumo</h3>${cart.map(i=>`<div class="tot"><span>${i.q}× ${esc(desc(i))}</span><b>${brl(sub(i))}</b></div>`).join("")}<div class="tot"><span>Peças</span><b>${nq(cart)}</b></div><div class="tot"><span>Subtotal</span><b>${brl(total(cart))}</b></div><div class="tot"><span>Frete</span><b>${fmtFrete()}</b></div>${CONFIG.frete==null?"":`<div class="tot g"><span>Total</span><span>${brl(total(cart)+CONFIG.frete)}</span></div>`}</div></div></div></section>`}
const viewInfo=()=>`<section><div class="w page"><h2 style="margin-bottom:var(--s4)">Entregas</h2><p>O frete é combinado com a loja pelo WhatsApp, depois do envio do pedido.</p><p>Forma de pagamento também é combinada na conversa. O site não processa pagamentos.</p><p>Para personalizar, envie a logo pelo WhatsApp junto do pedido.</p></div></section>`;
const viewPriv=()=>`<section><div class="w page"><h2 style="margin-bottom:var(--s4)">Privacidade</h2><p>Coletamos apenas nome, telefone e endereço de entrega, para montar a mensagem do pedido (LGPD).</p><p>Os dados do formulário não são guardados em servidor. O carrinho fica salvo apenas no seu navegador.</p><p>Depois do envio, a conversa segue as regras do WhatsApp. Para pedir exclusão de dados, fale com a loja.</p></div></section>`;
function route(){const h=location.hash.slice(1)||"inicio",a=$("#app");
 a.innerHTML=h==="carrinho"?viewCart():h==="checkout"?viewCheckout():h==="entregas"?viewInfo():h==="privacidade"?viewPriv():viewHome();
 const cur=h==="carrinho"||h==="checkout"?"carrinho":(h==="entregas"||h==="privacidade")?"":"inicio";$$("[data-nav]").forEach(n=>n.dataset.nav===cur?n.setAttribute("aria-current","page"):n.removeAttribute("aria-current"));
 if(!["carrinho","checkout","entregas","privacidade"].includes(h)){paintPreview();paintPrice();paintSummary();paintMeas()}window.scrollTo(0,0);if(pend){const e=document.getElementById(pend);pend=null;e&&e.scrollIntoView({behavior:"auto"})}barPaint();reveal()}

/* ===== VALIDAÇÃO / WHATSAPP ===== */
const maskTel=v=>{v=v.replace(/\D/g,"").slice(0,11);return v.length>10?`(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`:v.length>6?`(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`:v.length>2?`(${v.slice(0,2)}) ${v.slice(2)}`:v};
const maskCep=v=>{v=v.replace(/\D/g,"").slice(0,8);return v.length>5?v.slice(0,5)+"-"+v.slice(5):v};
function check(k){const el=$("#f_"+k),v=el.value.trim(),opt=/opcional/.test(FIELDS.find(f=>f[0]===k)[1]);let m="";
 if(!opt&&!v)m="Campo obrigatório.";else if(k==="tel"&&!/^\d{10,11}$/.test(v.replace(/\D/g,"")))m="Informe DDD e número.";else if(k==="cep"&&v.replace(/\D/g,"").length!==8)m="CEP com 8 dígitos.";else if(k==="uf"&&!/^[A-Za-z]{2}$/.test(v))m="Use a sigla, ex.: PB.";
 $("#e_"+k).textContent=m;m?el.setAttribute("aria-invalid","true"):el.removeAttribute("aria-invalid");return !m}
function msg(v){const L=["*NOVO PEDIDO – "+CONFIG.nome+"*","","*DADOS DO CLIENTE*","Nome: "+v.nome,"Telefone: "+v.tel,"","*ENDEREÇO DE ENTREGA*","CEP: "+v.cep,"Estado: "+v.uf,"Cidade: "+v.cidade,"Bairro: "+v.bairro,"Rua: "+v.rua,"Número: "+v.num,"Complemento: "+(v.comp||"-"),"Referência: "+(v.ref||"-"),"","*ITENS* ("+P.nome+" – "+P.id+")"];
 cart.forEach((i,n)=>L.push(`${n+1}) ${i.q} un. – ${i.cor}, ${i.tam}, ${i.gen}`,`   Personalização: ${pers(i.pers).nome}`,`   ${brl(unit(i))} × ${i.q} = ${brl(sub(i))}`));
 L.push("","*RESUMO*","Total de peças: "+nq(cart),"Subtotal: "+brl(total(cart)),"Frete: "+(CONFIG.frete==null?"A combinar":brl(CONFIG.frete)));
 if(CONFIG.frete!=null)L.push("Valor total: "+brl(total(cart)+CONFIG.frete));
 if(cart.some(i=>i.pers!=="nenhuma"))L.push("","*LOGO*","Vou enviar a logo por aqui.");
 L.push("","*OBSERVAÇÕES*",v.obs||"-","","Olá! Gostaria de confirmar a disponibilidade dos produtos, o valor do frete e as condições de pagamento deste pedido.");return L.join("\n")}

/* ===== MEDIDAS / MENU ===== */
const IG=()=>String(CONFIG.instagram).replace(/^@/,""),IGURL=()=>`https://www.instagram.com/${IG()}/`;
const fmtTel=n=>{const d=String(n).replace(/\D/g,"").replace(/^55/,"");return d.length===11?`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`:d};
const medidasHtml=()=>`<section class="rv" id="medidas"><div class="w"><div class="sechd"><div class="kicker">Tamanhos</div><h2>Tabela de medidas (cm)</h2><p>Tamanhos disponíveis: ${P.tamanhos.map(esc).join(" · ")}.</p></div><div class="tbl-wrap" role="region" aria-label="Tabela de medidas em centímetros" tabindex="0"><table class="tbl"><thead><tr><th scope="col">Tamanho</th>${MEDIDAS.colunas.map(c=>`<th scope="col">${esc(c)}</th>`).join("")}</tr></thead><tbody>${MEDIDAS.linhas.map(r=>`<tr data-tam="${esc(r.tam)}"><th scope="row">${esc(r.tam)}</th>${r.v.map(v=>`<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="mut sm" style="margin-top:var(--s3)">*${esc(MEDIDAS.nota)}</p></div></section>`;
function paintMeas(){const m=$("#meas"),r=MEDIDAS.linhas.find(x=>x.tam===sel.tam);
 if(m)m.innerHTML=r?`<b>${esc(r.tam)}</b> · ${MEDIDAS.colunas.map((c,i)=>`${esc(c)} ${esc(r.v[i])}`).join(" · ")} cm · <button type="button" class="lnk" data-act="goto" data-t="medidas">tabela completa</button>`:"";
 $$("#medidas tbody tr").forEach(tr=>tr.classList.toggle("sel",tr.dataset.tam===sel.tam))}
const IC={ig:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>',shirt:'<path d="M8 3 3 6l2 4 3-1v12h8V9l3 1 2-4-5-3c-1 2-2 3-4 3S9 5 8 3z"/>',tag:'<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1"/>',ruler:'<path d="M3 16 16 3l5 5L8 21z"/><path d="M7.5 12.5l2 2M10.5 9.5l2 2M13.5 6.5l2 2"/>',truck:'<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',chat:'<path d="M4 5h16v11H9l-5 4z"/>'};
function buildDrawer(){const ic=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`,go=(k,t,l)=>`<li><button type="button" data-act="goto" data-t="${t}">${ic(k)}${l}</button></li>`;
 $("#drawer").innerHTML=`<div class="dh"><span class="brand"><span><b>WF</b>CUSTOM</span></span><button class="x" type="button" data-act="menux" aria-label="Fechar menu">×</button></div><ul class="dl"><li><a href="${IGURL()}" target="_blank" rel="noopener">${ic("ig")}Instagram<small>@${esc(IG())}</small></a></li>${go("shirt","monte","Montar pedido")}${go("tag","valores","Valores")}${go("ruler","medidas","Tabela de medidas")}<li><a href="#entregas">${ic("truck")}Entregas</a></li><li><a href="#privacidade">${ic("shield")}Privacidade</a></li><li><a href="${wa("Olá! Vim pelo site e gostaria de falar sobre as camisetas no atacado.")}" target="_blank" rel="noopener">${ic("chat")}Fale conosco<small>WhatsApp</small></a></li></ul><div class="di"><b>${esc(CONFIG.nome)}</b><br>Camisetas no atacado · mínimo ${P.min} peças<br>WhatsApp ${fmtTel(CONFIG.whats)}</div>`}
let lastF=null,pend=null;
function openMenu(){lastF=document.activeElement;$("#drawer").classList.add("on");$("#scrim").classList.add("on");$("#drawer").setAttribute("aria-hidden","false");$("#menuBtn").setAttribute("aria-expanded","true");document.documentElement.classList.add("lock");$("#drawer .x").focus()}
function closeMenu(){const d=$("#drawer");if(!d.classList.contains("on"))return;d.classList.remove("on");$("#scrim").classList.remove("on");d.setAttribute("aria-hidden","true");$("#menuBtn").setAttribute("aria-expanded","false");document.documentElement.classList.remove("lock");lastF&&lastF.focus&&lastF.focus({preventScroll:true})}
function gotoSec(id){if(IS_HOME()){const e=document.getElementById(id);e&&e.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"})}else{pend=id;location.hash="inicio"}}

/* ===== EVENTOS (delegação) ===== */
document.addEventListener("click",e=>{const t=e.target.closest("[data-act]");if(!t)return;const a=t.dataset.act,i=+t.dataset.i,d=+t.dataset.d;
 if(a==="cor"||a==="tam"||a==="gen"){sel[a]=t.dataset.v;$$(`[data-act="${a}"]`).forEach(b=>b.setAttribute("aria-pressed",b===t));paintPreview();paintMeas()}
 else if(a==="qd"){const q=$("#pq");sel.q=Math.min(9999,Math.max(1,(parseInt(q.value)||0)+d));q.value=sel.q;paintPrice()}
 else if(a==="add"){const n=Math.min(9999,parseInt($("#pq").value)||0);if(n<1)return;const k=cart.find(x=>x.cor===sel.cor&&x.tam===sel.tam&&x.gen===sel.gen&&x.pers===sel.pers);k?k.q+=n:cart.push({cor:sel.cor,tam:sel.tam,gen:sel.gen,pers:sel.pers,q:n});save(true);paintSummary();toast(`${n}× ${sel.cor} ${sel.tam} adicionada${n>1?"s":""} ao pedido`);t.classList.remove("bounce");void t.offsetWidth;t.classList.add("bounce")}
 else if(a==="cd"){cart[i].q=Math.min(9999,Math.max(1,cart[i].q+d));save();route()}
 else if(a==="rm"){cart.splice(i,1);save();route();toast("Linha removida")}
 else if(a==="gocheck"){if(!faltam(cart))location.hash="checkout"}
 else if(a==="scroll")$("#monte").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});
 else if(a==="thumb"){$("#lbi").src=P.fotos[i];$("#lbi").alt=P.nome+", foto "+(i+1);$("#lb").classList.add("on");$("#lb button").focus()}
 else if(a==="pickpers"){sel.pers=t.dataset.v;const r=$("#p_"+sel.pers);if(r)r.checked=true;paintPreview();paintPrice();$("#monte").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"})}
 else if(a==="lbx")$("#lb").classList.remove("on")
 else if(a==="goto")gotoSec(t.dataset.t)
 else if(a==="menu")openMenu()
 else if(a==="menux")closeMenu()});
document.addEventListener("click",e=>{if(e.target.closest("#drawer a,#drawer [data-act='goto']"))closeMenu()},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("#lb").classList.remove("on");closeMenu()}
 if(e.key==="Tab"&&$("#drawer").classList.contains("on")){const f=$$("#drawer a,#drawer button"),x=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===x){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();x.focus()}}});
document.addEventListener("click",e=>{if(e.target.id==="lb")$("#lb").classList.remove("on")});
document.addEventListener("change",e=>{const t=e.target;if(t.name==="pers"){sel.pers=t.value;paintPreview();paintPrice()}else if(t.dataset.ci!==undefined){cart[+t.dataset.ci].q=Math.min(9999,Math.max(1,parseInt(t.value)||1));save();route()}});
document.addEventListener("input",e=>{const t=e.target;if(t.id==="pq"){sel.q=parseInt(t.value)||0;paintPrice()}else if(t.id==="f_tel")t.value=maskTel(t.value);else if(t.id==="f_cep")t.value=maskCep(t.value);else if(t.id==="f_uf")t.value=t.value.toUpperCase().replace(/[^A-Z]/g,"").slice(0,2)});
document.addEventListener("focusout",e=>{const t=e.target;if(t.id&&t.id.startsWith("f_")&&t.id!=="f_obs")check(t.id.slice(2))});
document.addEventListener("submit",e=>{if(e.target.id!=="ck")return;e.preventDefault();const v={};let ok=true,first=null;FIELDS.forEach(([k])=>{v[k]=$("#f_"+k).value.trim();if(!check(k)){ok=false;first=first||$("#f_"+k)}});v.obs=$("#f_obs").value.trim();
 if(!ok){first.focus();return}if(!cart.length||faltam(cart)){location.hash="carrinho";return}
 openWa(wa(msg(v)));toast("Abrindo o WhatsApp...")});

/* ===== INIT ===== */
let rq=0;addEventListener("scroll",()=>{if(rq)return;rq=requestAnimationFrame(()=>{rq=0;$$(".rv:not(.in)").forEach(e=>{if(e.getBoundingClientRect().top<innerHeight)e.classList.add("in")})})},{passive:true});
$("#fab").href=wa("Olá! Vim pelo site e gostaria de falar sobre as camisetas no atacado.");
buildDrawer();
$("#fi").innerHTML=`<b>${esc(CONFIG.nome)}</b> · Camisetas no atacado<br>WhatsApp ${fmtTel(CONFIG.whats)}`;
$("#fl").innerHTML=`<a href="#entregas">Entregas</a> · <a href="#privacidade">Privacidade</a> · <a href="${IGURL()}" target="_blank" rel="noopener">Instagram @${esc(IG())}</a>`;
window.addEventListener("hashchange",route);save();route();
