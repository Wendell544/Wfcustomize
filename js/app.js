/* ===== HELPERS ===== */
document.documentElement.classList.add("js");
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const brl=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const P=PRODUTO,pers=id=>P.personalizacoes.find(x=>x.id===id),cor=n=>P.cores.find(c=>c.nome===n);
const lum=h=>{const n=parseInt(h.slice(1),16),f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4};return .2126*f(n>>16)+.7152*f(n>>8&255)+.0722*f(n&255)};
const wa=t=>`https://wa.me/${CONFIG.whats}${t?"?text="+encodeURIComponent(t):""}`;
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

/* ===== ILUSTRAÇÃO (SVG limpo, cor exata) ===== */
const shade=(hex,f)=>{const n=parseInt(hex.slice(1),16),c=v=>Math.max(0,Math.min(255,Math.round(v*f))).toString(16).padStart(2,"0");return"#"+c(n>>16)+c(n>>8&255)+c(n&255)};
const lighten=(hex,amt)=>{const n=parseInt(hex.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;const nr=Math.round(r+(255-r)*amt),ng=Math.round(g+(255-g)*amt),nb=Math.round(b+(255-b)*amt);return"#"+((1<<24)+(nr<<16)+(ng<<8)+nb).toString(16).slice(1)};
const isDark=()=>{const t=document.documentElement.dataset.theme;return t?t==="dark":matchMedia("(prefers-color-scheme:dark)").matches};
const SVG_BOX={x:8,y:44,w:384,h:348};
const SVG_CACHE=new Map();
const r1=n=>Math.round(n*10)/10;
const pd=p=>`M${p[0]}C${p[1]} ${p[2]} ${p[3]}`;
const ancBox=(a,b)=>({x:r1(b.x+(a.cx-a.w/2)*b.w),y:r1(b.y+(a.cy-a.h/2)*b.h),w:r1(a.w*b.w),h:r1(a.h*b.h)});

/* Camisa: 100% limpa. Sem manchas, sem gradientes internos.
   Só: cor plana + contorno + gola + costura sutil + etiqueta (costas) + logo. */
function shirt(hex,side,logo,up){
 const f=side==="f",dk=isDark(),useUp=!!(logo&&up&&LOGO),mx=!!(P.opcoes&&P.opcoes.realismoMaximo),key=[hex,side,logo?1:0,dk?1:0,mx?1:0].join("|");
 if(!useUp&&SVG_CACHE.has(key)){const v=SVG_CACHE.get(key);SVG_CACHE.delete(key);SVG_CACHE.set(key,v);return v}

 const L=lum(hex),light=L>.42,veryDark=L<.10;
 /* Em modo escuro, preto puro some. Levanta ~6% e adiciona rim light. */
 const fill=(dk&&veryDark)?lighten(hex,.06):hex;
 /* Modo escuro + cor escura: contorno CLARO (rim light).
    Restante: contorno escuro (sombra) — dá silhueta em qualquer fundo claro. */
 const outline=(dk&&!light)?lighten(fill,.35):shade(fill,.65);
 const neckFill=shade(fill,.5);
 const outlineW=(dk&&veryDark)?2:1.4;
 const shadowOp=dk?.4:.2;

 const body="M148 44C165 54 235 54 252 44L326 70C340 74 348 80 354 90L392 160C394 166 392 170 387 172L338 196C333 198 329 196 327 192L310 164V372C310 384 302 392 290 392H110C98 392 90 384 90 372V164L73 192C71 196 67 198 62 196L13 172C8 170 6 166 8 160L46 90C52 80 60 74 74 70Z";
 const lower=[[150,45],[168,108],[232,108],[250,45]];
 const upper=[[150,45],[172,66],[228,66],[250,45]];
 const back=[[150,45],[172,74],[228,74],[250,45]];

 const emblem=(x,y,w,h,r,fs)=>`<g opacity=".95"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#lg)"/><rect x="${r1(x+w*.06)}" y="${r1(y+h*.08)}" width="${r1(w*.88)}" height="${r1(h*.84)}" rx="${r1(r*.7)}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="${w>80?2:1}"/><text x="${r1(x+w/2)}" y="${r1(y+h/2+fs*.36)}" font-size="${fs}" font-weight="800" text-anchor="middle" fill="#fff" font-family="Inter,Arial,sans-serif" letter-spacing="1">LOGO</text></g>`;
 const a=P.ancoras[f?"peito":"costas"],bx=ancBox(a,SVG_BOX),cx=r1(bx.x+bx.w/2),cy=r1(bx.y+bx.h/2);
 const lg=!logo?"":`<g transform="rotate(${a.rot||0} ${cx} ${cy})${mx?" matrix(1 0 -.02 1 0 2)":""}">`+(useUp?`<image href="${LOGO}" x="${bx.x}" y="${bx.y}" width="${bx.w}" height="${bx.h}" preserveAspectRatio="xMidYMid meet"/>`:emblem(bx.x,bx.y,bx.w,bx.h,f?6:10,f?12:27))+"</g>";

 /* abertura do pescoço (interior mais escuro) — só na frente */
 const nk=pd(upper)+"C232 108 168 108 150 45Z";
 const neckhole=f?`<path d="${nk}" fill="${neckFill}"/>`:"";
 /* gola: 1 traço (contorno) + 1 traço interno (cor da camisa) */
 const cc=pd(f?lower:back),cw=f?16:14;
 const col=`<path d="${cc}" fill="none" stroke="${outline}" stroke-width="${cw+2}" stroke-linecap="round"/><path d="${cc}" fill="none" stroke="${fill}" stroke-width="${cw-2}" stroke-linecap="round"/>`;
 /* costura de barra: linha quase invisível */
 const sc=light?"#000":"#fff";
 const st=`<g fill="none" stroke="${sc}" stroke-linecap="round" stroke-opacity=".10" stroke-width="1"><path d="M95 378H305M381 163L333 186M19 163L67 186"/></g>`;
 const etq=f?"":`<rect x="185" y="76" width="30" height="14" rx="2" fill="#f0f0f0" opacity=".85"/>`;

 const defs=`<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9333ea"/><stop offset="1" stop-color="#ec4899"/></linearGradient><filter id="bm" x="-20%" y="-150%" width="140%" height="400%"><feGaussianBlur stdDeviation="6"/></filter></defs>`;

 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420">${defs}<ellipse cx="200" cy="398" rx="150" ry="7" fill="#000" opacity="${shadowOp}" filter="url(#bm)"/><path d="${body}" fill="${fill}"/><path d="${body}" fill="none" stroke="${outline}" stroke-opacity=".7" stroke-width="${outlineW}"/>${neckhole}${col}${st}${etq}${lg}</svg>`;
 const uri="data:image/svg+xml,"+encodeURIComponent(svg);
 if(!useUp){SVG_CACHE.set(key,uri);if(SVG_CACHE.size>20)SVG_CACHE.delete(SVG_CACHE.keys().next().value)}
 return uri}

/* ===== RENDER ===== */
const seg=(k,arr)=>`<div class="seg" role="group" aria-label="${k==="tam"?"Tamanho":"Modelo"}">${arr.map(v=>`<button type="button" data-act="${k}" data-v="${esc(v)}" aria-pressed="${sel[k]===v}">${esc(v)}</button>`).join("")}</div>`;
const hx=(n,i)=>(cor(n)||P.cores[i%P.cores.length]).hex;
function viewHome(){const mn=Math.min(...P.personalizacoes.map(x=>x.preco));
return `<section class="hero"><div class="w"><div class="hero-grid"><div><span class="eyebrow">Atacado de camisetas</span><h1>Camiseta boa, em quantidade. Do jeito da sua <em>marca</em>.</h1><p class="lead">Algodão 100% em ${P.cores.length} cores, com ou sem logo. Monte o pedido em minutos e finalize no WhatsApp.</p><div class="cta"><button class="btn" data-act="scroll">Montar pedido</button><button class="btn ghost" data-act="goto" data-t="valores">Ver valores</button></div><ul class="trust"><li>Mínimo ${P.min} peças</li><li>${P.cores.length} cores</li><li>Frete combinado no WhatsApp</li></ul></div><div class="hero-art" aria-hidden="true"><img alt="" width="400" height="420" src="${shirt(hx("Preta",0),"f",true)}"></div></div><div class="facts"><div><b>${brl(mn)}</b><span>por peça, a partir de</span></div><div><b>100%</b><span>algodão</span></div><div><b>P · M · G</b><span>masculina e feminina</span></div><div><b>${P.min}+</b><span>peças por pedido</span></div></div></div></section>
<section class="rv" id="como"><div class="w"><div class="sechd"><div class="kicker">Como funciona</div><h2>Três passos</h2></div><ol class="how"><li><span class="n">01</span><h3>Monte o pedido</h3><p class="mut">Escolha cor, tamanho, modelo e personalização. Pedidos maiores têm desconto.</p></li><li><span class="n">02</span><h3>Envie sua logo</h3><p class="mut">Veja a prévia aqui e envie o arquivo original pelo WhatsApp junto do pedido.</p></li><li><span class="n">03</span><h3>Feche pelo WhatsApp</h3><p class="mut">A mensagem sai pronta. O pedido só é enviado quando você confirmar no WhatsApp.</p></li></ol></div></section><section class="rv" id="valores"><div class="w"><div class="sechd"><div class="kicker">Valores</div><h2>Preço por peça</h2><p>Mínimo de ${P.min} peças por pedido, somando todas as cores, tamanhos e modelos.</p></div><div class="prices">${P.personalizacoes.map((x,i)=>`<article class="pc${i===1?" hl":""}">${i===1?'<span class="tag">Recomendado</span>':""}<h3>${esc(x.nome)}</h3><p class="mut sm">${esc(x.desc)}</p><div class="pr">${brl(x.preco)} <small>por peça</small></div><button class="btn ghost full" data-act="pickpers" data-v="${x.id}">Escolher</button></article>`).join("")}</div></div></section>
<section class="rv" id="monte"><div class="w"><div class="cfg"><div class="gal"><div class="stage"><div class="main-img-wrap" id="pv"></div>${P.fotos.length?`<div class="thumbs">${P.fotos.map((f,i)=>`<button type="button" data-act="thumb" data-i="${i}" aria-label="Ampliar foto ${i+1}"><img loading="lazy" decoding="async" src="${esc(f)}" alt="${esc(P.nome)}, foto ${i+1}"></button>`).join("")}</div>`:""}</div></div>
<div class="panel"><h2 style="margin-bottom:var(--s5)">${esc(P.nome)}</h2>
<fieldset><legend><span class="n">1</span>Cor<em id="cn"></em></legend><div class="sw">${P.cores.map(x=>`<button type="button" data-act="cor" data-v="${esc(x.nome)}" aria-pressed="${x.nome===sel.cor}"><i style="background:${x.hex}"></i>${esc(x.nome)}</button>`).join("")}</div></fieldset>
<fieldset><legend><span class="n">2</span>Tamanho</legend>${seg("tam",P.tamanhos)}<p class="meas" id="meas" aria-live="polite"></p></fieldset>
<fieldset><legend><span class="n">3</span>Modelo</legend>${seg("gen",P.generos)}</fieldset>
<fieldset><legend><span class="n">4</span>Personalização</legend><div class="opts">${P.personalizacoes.map(x=>`<div class="opt"><input type="radio" name="pers" id="p_${x.id}" value="${x.id}" ${x.id===sel.pers?"checked":""}><label for="p_${x.id}"><span>${esc(x.nome)}<span class="d">${esc(x.desc)}</span></span><b>${brl(x.preco)}</b></label></div>`).join("")}</div><div class="logo-up" id="lu" hidden><label for="logo-file">Sua logo (opcional)</label><div class="lu-row"><input id="logo-file" type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" aria-describedby="lun"><button type="button" class="btn ghost sm" id="lx" data-act="logox" hidden>Remover logo</button></div><p class="mut sm" id="lun">Prévia aproximada. Envie o arquivo original pelo WhatsApp com o pedido. PNG, SVG ou JPG, até 2 MB.</p></div></fieldset>
<fieldset><legend><span class="n">5</span>Quantidade</legend><div class="qty"><button type="button" data-act="qd" data-d="-1" aria-label="Diminuir quantidade">−</button><input id="pq" type="number" min="1" inputmode="numeric" value="${sel.q}" aria-label="Quantidade"><button type="button" data-act="qd" data-d="1" aria-label="Aumentar quantidade">+</button></div></fieldset>
<div class="buy"><div class="p" id="pp"></div><button class="btn" id="add" data-act="add">Adicionar ao pedido</button></div>
<div class="res" id="rs" aria-live="polite"></div></div></div></div></section>${medidasHtml()}${faqHtml()}${depoHtml()}`}
let side="f";
const BBOX=new Map();
function bboxFor(src){if(BBOX.has(src))return BBOX.get(src);
 const p=new Promise(res=>{const im=new Image();im.crossOrigin="anonymous";
  im.onload=()=>{let r=null;try{const S=200,c=document.createElement("canvas");c.width=c.height=S;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0,S,S);
   const d=x.getImageData(0,0,S,S).data;let a=S,b=S,e=-1,g=-1;
   for(let y=0;y<S;y++)for(let w=0;w<S;w++){const i=(y*S+w)*4;if(Math.abs(d[i]-d[0])+Math.abs(d[i+1]-d[1])+Math.abs(d[i+2]-d[2])>25){if(w<a)a=w;if(w>e)e=w;if(y<b)b=y;if(y>g)g=y}}
   if(e>a&&g>b&&(e-a)*(g-b)>S*S*.05)r={u0:a/S,v0:b/S,u1:(e+1)/S,v1:(g+1)/S};c.width=c.height=0}catch(_){r=null}
   res(r)};
  im.onerror=()=>res(null);im.src=src});
 BBOX.set(src,p);return p}
function posOverlay(el,k,bb,ar){const a=P.ancoras[k],b=bb||{u0:0,v0:0,u1:1,v1:1},cw=b.u1-b.u0,ch=b.v1-b.v0,
 kx=ar>1?ar:1,ky=ar<1?1/ar:1,ox=ar>1?(ar-1)/2:0,oy=ar<1?(1/ar-1)/2:0,w=a.w*cw*kx,h=a.h*ch*ky,
 x=(b.u0+a.cx*cw)*kx-ox-w/2,y=(b.v0+a.cy*ch)*ky-oy-h/2,pc=v=>(v*100).toFixed(2)+"%";
 Object.assign(el.style,{left:pc(x),top:pc(y),width:pc(w),height:pc(h)});
 el.style.transform=`rotate(${a.rot||0}deg)`+(P.opcoes&&P.opcoes.realismoMaximo?" perspective(800px) rotateY(-3deg)":"")}
async function ajustarOverlays(w){for(const ph of $$(".ph",w)){const ov=$(".logo-overlay",ph);if(!ov)continue;const im=$("img.real",ph);
 try{await im.decode()}catch(e){}
 const ar=im.naturalWidth&&im.naturalHeight?im.naturalWidth/im.naturalHeight:1,bb=await bboxFor(im.currentSrc||im.src);
 if(!ov.isConnected)return;posOverlay(ov,ph.dataset.k,bb,ar);ov.style.visibility="visible"}}
function preloadAdjacentes(){const n=P.cores.length,i=P.cores.findIndex(x=>x.nome===sel.cor),
 go=()=>[-1,1].forEach(d=>{const c=P.cores[(i+d+n)%n];[c.foto,c.fotoCostas].filter(Boolean).forEach(s=>{const im=new Image();im.decoding="async";im.src=s;im.decode().catch(()=>{})})});
 "requestIdleCallback" in window?requestIdleCallback(go):go()}
function paintPreview(){const c=cor(sel.cor),w=$("#pv");if(!w)return;$("#cn").textContent=c.nome;
 const fc=sel.pers==="frente_costas",hl=!!LOGO&&sel.pers!=="nenhuma",bl=lum(c.hex)>.45?"multiply":"normal";
 const ov=()=>hl?`<img class="logo-overlay" alt="" src="${esc(LOGO)}" style="visibility:hidden;mix-blend-mode:${bl}">`:"";
 const ph=(src,alt,k)=>`<div class="ph" data-k="${k}"><img class="real" decoding="async" width="800" height="800" src="${esc(src)}" alt="${esc(alt)}">${ov()}</div>`;
 const svg=(s,alt,logo)=>`<img decoding="async" src="${shirt(c.hex,s,logo,hl)}" alt="${esc(alt)}" width="400" height="420">`;
 const cap=t=>fc?`<figcaption>${t}</figcaption>`:"";
 const front=`<figure>${c.foto?ph(c.foto,`Camiseta ${c.nome}, frente`,"peito"):svg("f",`Camiseta ${c.nome}, frente`,sel.pers==="peito"||fc)}${cap("FRENTE")}</figure>`;
 const back=`<figure>${c.fotoCostas?ph(c.fotoCostas,`Camiseta ${c.nome}, costas`,"costas"):svg("b",`Camiseta ${c.nome}, costas`,true)}${cap("COSTAS")}</figure>`;
 w.innerHTML=front+(fc?back:"");ajustarOverlays(w);preloadAdjacentes()}
function paintPrice(){const p=pers(sel.pers),q=Math.max(0,sel.q);$("#pp").innerHTML=`${brl(q*p.preco)}<small>${brl(p.preco)} por peça × ${q}</small>`;$("#add").disabled=q<1;if(sel.pers==="nenhuma"&&LOGO){LOGO=null;const i=$("#logo-file");if(i)i.value=""}if($("#lu")){$("#lu").hidden=sel.pers==="nenhuma";$("#lx").hidden=!LOGO}}
function paintSummary(){const e=$("#rs");if(!e)return;const q=nq(cart),f=faltam(cart),ok=!f;
 e.innerHTML=`<h3>Seu pedido</h3>${cart.length?`<ul>${cart.map(i=>`<li><span>${i.q}× ${esc(desc(i))}</span><b>${brl(sub(i))}</b></li>`).join("")}</ul>`:'<p class="mut sm" style="margin:0 0 var(--s3)">Nenhuma peça adicionada.</p>'}<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${P.min}" aria-valuenow="${Math.min(q,P.min)}"><i style="transform:scaleX(${Math.min(1,q/P.min)})"></i></div><div class="pg ${ok?"ok":"pend"}"><span>${q}/${P.min} — ${ok?"mínimo atingido":"faltam "+f}</span><span>${brl(resumo(cart).total)}</span></div><p class="inc" role="status">${incentivo(cart)}</p><a class="btn full" href="#carrinho">Ver carrinho</a>`}
function viewCart(){if(!cart.length)return `<section><div class="w empty"><h2>Carrinho vazio</h2><p class="mut">Adicione camisetas para continuar.</p><a class="btn" href="#inicio">Montar pedido</a></div></section>`;const f=faltam(cart);
return `<section><div class="w"><h2 style="margin-bottom:var(--s5)">Carrinho</h2><div class="two"><div>${cart.map((i,n)=>`<div class="line"><div class="i"><b><span class="dot" style="background:${cor(i.cor).hex}"></span>${esc(i.cor)}</b> · ${esc(i.tam)} · ${esc(i.gen)}<div class="mut sm">${esc(pers(i.pers).nome)} · ${brl(unit(i))} por peça</div></div><div class="qty"><button data-act="cd" data-i="${n}" data-d="-1" aria-label="Diminuir">−</button><input data-ci="${n}" type="number" min="1" inputmode="numeric" value="${i.q}" aria-label="Quantidade"><button data-act="cd" data-i="${n}" data-d="1" aria-label="Aumentar">+</button></div><b>${brl(sub(i))}</b><button class="rm" data-act="rm" data-i="${n}" aria-label="Remover ${esc(desc(i))}">Remover</button></div>`).join("")}<p style="margin-top:var(--s4)"><a href="#inicio" class="btn ghost" style="color:var(--primary)">Adicionar mais peças</a></p></div>
<div class="panel" aria-live="polite"><div class="tot"><span>Peças</span><b>${nq(cart)}</b></div>${subRows(cart)}<div class="tot"><span>Frete</span><b>${fmtFrete()}</b></div><div class="pg ${f?"pend":"ok"}"><span>${nq(cart)}/${P.min} — ${f?"faltam "+f:"mínimo atingido"}</span></div>${f?`<p class="warn" role="alert">Mínimo ${P.min} peças. Faltam ${f}.</p>`:""}<p class="inc" role="status">${incentivo(cart)}</p><button class="btn full" data-act="gocheck" ${f?"disabled aria-disabled='true'":""}>Finalizar pedido</button></div></div></div></section>`}
const FIELDS=[["nome","Nome completo","text","name"],["tel","Telefone com DDD","tel","tel"],["cep","CEP","text","postal-code"],["uf","Estado (UF)","text","address-level1"],["cidade","Cidade","text","address-level2"],["bairro","Bairro","text","off"],["rua","Rua ou avenida","text","street-address"],["num","Número","text","off"],["comp","Complemento (opcional)","text","off"],["ref","Ponto de referência (opcional)","text","off"]];
function viewCheckout(){if(!cart.length||faltam(cart))return `<section><div class="w empty"><h2>Pedido incompleto</h2><p class="mut">${cart.length?`Faltam ${faltam(cart)} peças para o mínimo de ${P.min}.`:"Seu carrinho está vazio."}</p><a class="btn" href="#carrinho">Voltar</a></div></section>`;
return `<section><div class="w"><h2 style="margin-bottom:var(--s5)">Finalizar pedido</h2><div class="two"><form id="ck" class="panel" novalidate><div class="fg">${FIELDS.map(([k,l,t,a])=>`<div class="fld"><label for="f_${k}">${l}</label><input id="f_${k}" name="${k}" type="${t}" autocomplete="${a}" aria-describedby="e_${k}" ${k==="tel"||k==="cep"?'inputmode="numeric"':""}><div class="err" id="e_${k}" role="alert"></div></div>`).join("")}</div><div class="fld" style="margin-top:var(--s3)"><label for="f_obs">Observações</label><textarea id="f_obs"></textarea></div><button class="btn full" type="submit" style="margin-top:var(--s4)">Finalizar pelo WhatsApp</button><p class="mut sm">O WhatsApp abre com a mensagem pronta. O pedido só é enviado quando você confirmar lá.</p></form>
<div class="panel"><h3 style="margin-bottom:var(--s3)">Resumo</h3>${cart.map(i=>`<div class="tot"><span>${i.q}× ${esc(desc(i))}</span><b>${brl(sub(i))}</b></div>`).join("")}<div class="tot"><span>Peças</span><b>${nq(cart)}</b></div>${subRows(cart)}<div class="tot"><span>Frete</span><b>${fmtFrete()}</b></div>${CONFIG.frete==null?"":`<div class="tot g"><span>Total</span><span>${brl(resumo(cart).total+CONFIG.frete)}</span></div>`}</div></div></div></section>`}
const viewInfo=()=>`<section><div class="w page"><h2 style="margin-bottom:var(--s4)">Entregas</h2><p>O frete é combinado com a loja pelo WhatsApp, depois do envio do pedido.</p><p>Forma de pagamento também é combinada na conversa. O site não processa pagamentos.</p><p>Para personalizar, envie a logo pelo WhatsApp junto do pedido.</p></div></section>`;
const viewPriv=()=>`<section><div class="w page"><h2 style="margin-bottom:var(--s4)">Privacidade</h2><p>Coletamos apenas nome, telefone e endereço de entrega, para montar a mensagem do pedido (LGPD).</p><p>Os dados do formulário não são guardados em servidor. O carrinho fica salvo apenas no seu navegador.</p><p>Depois do envio, a conversa segue as regras do WhatsApp. Para pedir exclusão de dados, fale com a loja.</p></div></section>`;
function route(){const h=location.hash.slice(1)||"inicio",a=$("#app");document.title=({carrinho:"Carrinho",checkout:"Finalizar pedido",entregas:"Entregas",privacidade:"Privacidade"}[h]||"Camisetas no atacado")+" · WFCUSTOM";
 a.innerHTML=h==="carrinho"?viewCart():h==="checkout"?viewCheckout():h==="entregas"?viewInfo():h==="privacidade"?viewPriv():viewHome();
 const cur=h==="carrinho"||h==="checkout"?"carrinho":(h==="entregas"||h==="privacidade")?"":"inicio";$$("[data-nav]").forEach(n=>n.dataset.nav===cur?n.setAttribute("aria-current","page"):n.removeAttribute("aria-current"));
 if(!["carrinho","checkout","entregas","privacidade"].includes(h)){paintPreview();paintPrice();paintSummary();paintMeas()}window.scrollTo(0,0);if(pend){const e=document.getElementById(pend);pend=null;e&&e.scrollIntoView({behavior:"auto"})}barPaint();reveal()}

/* ===== VALIDAÇÃO / WHATSAPP ===== */
const maskTel=v=>{v=v.replace(/\D/g,"").slice(0,11);return v.length>10?`(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`:v.length>6?`(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`:v.length>2?`(${v.slice(0,2)}) ${v.slice(2)}`:v};
const maskCep=v=>{v=v.replace(/\D/g,"").slice(0,8);return v.length>5?v.slice(0,5)+"-"+v.slice(5):v};
function check(k){const el=$("#f_"+k),v=el.value.trim(),opt=/opcional/.test(FIELDS.find(f=>f[0]===k)[1]);let m="";
 if(!opt&&!v)m="Campo obrigatório.";else if(k==="tel"&&!/^\d{10,11}$/.test(v.replace(/\D/g,"")))m="Informe DDD e número.";else if(k==="cep"&&v.replace(/\D/g,"").length!==8)m="CEP com 8 dígitos.";else if(k==="uf"&&!/^[A-Za-z]{2}$/.test(v))m="Use a sigla, ex.: PB.";
 $("#e_"+k).textContent=m;m?el.setAttribute("aria-invalid","true"):el.removeAttribute("aria-invalid");return !m}
function msg(v){const r=resumo(cart),L=["*NOVO PEDIDO – "+CONFIG.nome+"*","","*DADOS DO CLIENTE*","Nome: "+v.nome,"Telefone: "+v.tel,"","*ENDEREÇO DE ENTREGA*","CEP: "+v.cep,"Estado: "+v.uf,"Cidade: "+v.cidade,"Bairro: "+v.bairro,"Rua: "+v.rua,"Número: "+v.num,"Complemento: "+(v.comp||"-"),"Referência: "+(v.ref||"-"),"","*ITENS* ("+P.nome+" – "+P.id+")"];
 cart.forEach((i,n)=>L.push(`${n+1}) ${i.q} un. – ${i.cor}, ${i.tam}, ${i.gen}`,`   Personalização: ${pers(i.pers).nome}`,`   ${brl(unit(i))} × ${i.q} = ${brl(sub(i))}`));
 L.push("","*RESUMO*","Total de peças: "+r.q,"Subtotal: "+brl(r.subtotal));
 if(r.pct)L.push(`Desconto (${r.pct}%): -${brl(r.desconto)}`);
 L.push("Frete: "+(CONFIG.frete==null?"A combinar":brl(CONFIG.frete)));
 L.push(CONFIG.frete==null?"Total dos produtos: "+brl(r.total):"Valor total: "+brl(r.total+CONFIG.frete));
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
 $("#drawer").innerHTML=`<div class="dh"><span class="brand"><span><b>WF</b>CUSTOM</span></span><button class="x" type="button" data-act="menux" aria-label="Fechar menu">×</button></div><ul class="dl"><li><a href="${IGURL()}" target="_blank" rel="noopener">${ic("ig")}Instagram<small>@${esc(IG())}</small></a></li>${go("shirt","monte","Montar pedido")}${go("tag","valores","Valores")}${go("ruler","medidas","Tabela de medidas")}<li><a href="#entregas">${ic("truck")}Entregas</a></li><li><a href="#privacidade">${ic("shield")}Privacidade</a></li><li><a href="${wa("Quero fazer um orçamento de camisetas.")}" target="_blank" rel="noopener">${ic("chat")}Pedir orçamento</a></li><li><a href="${wa("Tenho uma dúvida sobre as camisetas.")}" target="_blank" rel="noopener">${ic("chat")}Tirar dúvida</a></li><li><a href="${wa("Quero ver as cores disponíveis.")}" target="_blank" rel="noopener">${ic("chat")}Ver cores</a></li></ul><div class="di"><b>${esc(CONFIG.nome)}</b><br>Camisetas no atacado · mínimo ${P.min} peças<br>WhatsApp ${fmtTel(CONFIG.whats)}</div>`}
let lastF=null,pend=null;
function openMenu(){lastF=document.activeElement;$("#drawer").classList.add("on");$("#scrim").classList.add("on");$("#drawer").setAttribute("aria-hidden","false");$("#menuBtn").setAttribute("aria-expanded","true");document.documentElement.classList.add("lock");$("#app").inert=true;$("#drawer .x").focus()}
function closeMenu(){const d=$("#drawer");if(!d.classList.contains("on"))return;d.classList.remove("on");$("#scrim").classList.remove("on");d.setAttribute("aria-hidden","true");$("#menuBtn").setAttribute("aria-expanded","false");document.documentElement.classList.remove("lock");$("#app").inert=false;lastF&&lastF.focus&&lastF.focus({preventScroll:true})}
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
 else if(a==="side"){side=t.dataset.v;paintPreview()}
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

/* ===== DESCONTO E INCENTIVO ===== */
const pctDesconto=q=>{const t=PRODUTO.descontos.filter(d=>q>=d.min).pop();return t?t.pct:0};
const proximoTier=q=>PRODUTO.descontos.find(d=>d.min>q);
const resumo=c=>{const q=nq(c),s=total(c),p=pctDesconto(q),d=s*p/100;return{q,subtotal:s,pct:p,desconto:d,total:s-d}};
const plural=(n,w)=>`${n} ${w}${n>1?"s":""}`;
const incentivo=c=>{const q=nq(c),f=faltam(c),t=proximoTier(q),top=PRODUTO.descontos[PRODUTO.descontos.length-1];
 if(f)return `Faltam ${plural(f,"peça")} para o mínimo de ${P.min}.`;
 if(t)return `Faltam ${plural(t.min-q,"peça")} para ${t.pct}% de desconto no pedido todo.`;
 return top.pct?`Você está no maior desconto (${top.pct}%).`:""};
const subRows=c=>{const r=resumo(c);return `<div class="tot"><span>Subtotal</span><b>${brl(r.subtotal)}</b></div>${r.pct?`<div class="tot ok"><span>Desconto (${r.pct}%)</span><b>-${brl(r.desconto)}</b></div><div class="tot"><span>Total dos produtos</span><b>${brl(r.total)}</b></div>`:""}`};
/* ===== LOGO (só prévia; não é salva) ===== */
let LOGO=null,logoBusy=false,dbT;const LOGO_MAX=2*1024*1024,LOGO_TIPOS=["image/png","image/svg+xml","image/jpeg","image/webp"];
const readUrl=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
function cutCore(d,W,H){
 const N=W*H,MIN_BG=.02,MIN_ILHA=.0008;
 const f=v=>{v/=255;return v>.04045?Math.pow((v+.055)/1.055,2.4):v/12.92},q=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;
 const lab=i=>{const R=f(d[i]),G=f(d[i+1]),B=f(d[i+2]),X=q((.4124*R+.3576*G+.1805*B)/.95047),Y=q(.2126*R+.7152*G+.0722*B),Z=q((.0193*R+.1192*G+.9505*B)/1.08883);return[116*Y-16,500*(X-Y),200*(Y-Z)]};
 const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
 const S=[],add=(x,y)=>{const i=(y*W+x)*4;S.push({l:lab(i),r:d[i],g:d[i+1],b:d[i+2]})};
 for(let x=0;x<W;x+=8){add(x,0);add(x,H-1)}for(let y=0;y<H;y+=8){add(0,y);add(W-1,y)}
 const C=[];
 for(const s of S){let c=C.find(k=>dist(k.l,s.l)<12);if(!c){c={l:s.l.slice(),sl:[0,0,0],n:0,r:0,g:0,b:0,m:[]};C.push(c)}
  c.m.push(s);c.n++;c.r+=s.r;c.g+=s.g;c.b+=s.b;for(let j=0;j<3;j++)c.sl[j]+=s.l[j];c.l=c.sl.map(v=>v/c.n)}
 C.sort((x,y)=>y.n-x.n);const top=C[0],tot=S.length;
 if(top.n/tot<.55||(C[1]&&C[1].n/tot>.25))return null;
 const sd=Math.sqrt(top.m.reduce((s,t)=>s+dist(t.l,top.l)**2,0)/top.n),sdL=Math.sqrt(top.m.reduce((s,t)=>s+(t.l[0]-top.l[0])**2,0)/top.n);
 if(sdL>18)return null;
 const bgRGB=[top.r/top.n,top.g/top.n,top.b/top.n],E=new Float32Array(N);
 for(let p=0;p<N;p++)E[p]=dist(lab(p*4),top.l);
 let tol=2.2*sd+20,A=null,rem=0;
 for(let pass=0;pass<3;pass++){
  A=new Uint8Array(N).fill(255);const st=new Int32Array(N);let sp=0;rem=0;
  const push=p=>{if(A[p]&&E[p]<=tol){A[p]=0;st[sp++]=p;rem++}};
  for(let x=0;x<W;x++){push(x);push((H-1)*W+x)}for(let y=0;y<H;y++){push(y*W);push(y*W+W-1)}
  while(sp){const p=st[--sp],x=p%W;if(x>0)push(p-1);if(x<W-1)push(p+1);if(p>=W)push(p-W);if(p<N-W)push(p+W)}
  if(rem/N>=MIN_BG)break;tol*=1.25}
 if(rem/N<MIN_BG)return null;
 const qa=new Int32Array(N),min=Math.max(4,Math.round(N*MIN_ILHA));
 const lbl=(m,v)=>{const L=new Int32Array(N),ar=[0];let id=0;
  for(let s=0;s<N;s++){if(L[s]||m[s]!==v)continue;id++;let h=0,t=0;qa[t++]=s;L[s]=id;
   while(h<t){const p=qa[h++],x=p%W;
    if(x>0&&!L[p-1]&&m[p-1]===v){L[p-1]=id;qa[t++]=p-1}
    if(x<W-1&&!L[p+1]&&m[p+1]===v){L[p+1]=id;qa[t++]=p+1}
    if(p>=W&&!L[p-W]&&m[p-W]===v){L[p-W]=id;qa[t++]=p-W}
    if(p<N-W&&!L[p+W]&&m[p+W]===v){L[p+W]=id;qa[t++]=p+W}}
   ar.push(t)}return{L,ar}};
 const cc=(val,nv)=>{const{L,ar}=lbl(A,val);for(let p=0;p<N;p++)if(L[p]&&ar[L[p]]<min)A[p]=nv};
 cc(255,0);cc(0,255);
 const K=new Uint8Array(N),F=new Uint8Array(N);for(let p=0;p<N;p++)if(A[p]){if(E[p]<=tol)K[p]=1;else F[p]=1}
 const hk=lbl(K,1),hf=lbl(F,1),own=new Int32Array(hk.ar.length);
 for(let p=0;p<N;p++){const i=hk.L[p];if(!i||own[i])continue;const x=p%W;own[i]=(x>0&&hf.L[p-1])||(x<W-1&&hf.L[p+1])||(p>=W&&hf.L[p-W])||(p<N-W&&hf.L[p+W])||0}
 for(let p=0;p<N;p++){const i=hk.L[p];if(i&&own[i]&&hk.ar[i]>=.2*hf.ar[own[i]])A[p]=0}
 const A0=A.slice(),maxD=Math.max(tol*1.6,30),D=new Uint8Array(N),nb=(p,fn)=>{const x=p%W;return(x>0&&fn(p-1))||(x<W-1&&fn(p+1))||(p>=W&&fn(p-W))||(p<N-W&&fn(p+W))};
 for(let p=0;p<N;p++)if(A0[p]&&nb(p,k=>!A0[k]))D[p]=1;
 for(let p=0;p<N;p++)if(A0[p]&&!D[p]&&nb(p,k=>D[k]===1))D[p]=2;
 for(let p=0;p<N;p++)if(A0[p]&&!D[p]&&nb(p,k=>D[k]===2))D[p]=3;
 const thr=Math.max(maxD*2,50);
 for(let p=0;p<N;p++){if(!D[p])continue;const x=p%W,y=(p-x)/W,i=p*4;let bi=-1,bd=99,al=Math.min(1,E[p]/maxD);
  for(let dy=-4;dy<=4;dy++){const yy=y+dy;if(yy<0||yy>=H)continue;for(let dx=-4;dx<=4;dx++){const xx=x+dx;if(xx<0||xx>=W)continue;const q=yy*W+xx,e=dx*dx+dy*dy;if(A0[q]&&E[q]>=thr&&e<bd){bd=e;bi=q*4}}}
  if(bi>=0){const vr=d[bi]-bgRGB[0],vg=d[bi+1]-bgRGB[1],vb=d[bi+2]-bgRGB[2],n2=vr*vr+vg*vg+vb*vb;
   if(n2>400){al=Math.max(0,Math.min(1,((d[i]-bgRGB[0])*vr+(d[i+1]-bgRGB[1])*vg+(d[i+2]-bgRGB[2])*vb)/n2));d[i]=d[bi];d[i+1]=d[bi+1];d[i+2]=d[bi+2]}}
  else if(al<1){const a=Math.max(al,.02);d[i]=(d[i]-(1-a)*bgRGB[0])/a;d[i+1]=(d[i+1]-(1-a)*bgRGB[1])/a;d[i+2]=(d[i+2]-(1-a)*bgRGB[2])/a}
  A[p]=Math.round(255*al)}
 const T=new Float32Array(N),U=new Float32Array(N);for(let p=0;p<N;p++)T[p]=A[p];
 for(let it=0;it<1;it++){
  for(let y=0;y<H;y++){const o=y*W;for(let x=0;x<W;x++){const p=o+x;U[p]=(T[x>0?p-1:p]+2*T[p]+T[x<W-1?p+1:p])/4}}
  for(let y=0;y<H;y++){const o=y*W;for(let x=0;x<W;x++){const p=o+x;T[p]=(U[y>0?p-W:p]+2*U[p]+U[y<H-1?p+W:p])/4}}}
 let x0=W,y0=H,x1=-1,y1=-1;
 for(let p=0;p<N;p++){const al=A0[p]?(D[p]?Math.round(T[p]):255):0;d[p*4+3]=al;if(al>0){const x=p%W,y=(p-x)/W;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
 if(x1<0)return null;
 x0=Math.max(0,x0-4);y0=Math.max(0,y0-4);x1=Math.min(W-1,x1+4);y1=Math.min(H-1,y1+4);
 return{x0,y0,w:x1-x0+1,h:y1-y0+1,pct:rem/N}}
function cutWorker(buf,W,H){return new Promise((ok,no)=>{
 if(!window.Worker){toast("Navegador antigo: processamento mais lento.");try{const r=cutCore(new Uint8ClampedArray(buf),W,H);ok(r&&{...r,buf})}catch(e){no(e)}return}
 const url=URL.createObjectURL(new Blob([`const cutCore=${cutCore};onmessage=e=>{const{buf,W,H}=e.data,r=cutCore(new Uint8ClampedArray(buf),W,H);postMessage({r,buf},[buf])}`],{type:"text/javascript"}));
 const w=new Worker(url),fim=()=>{clearTimeout(tm);w.terminate();URL.revokeObjectURL(url)},tm=setTimeout(()=>{fim();no(new Error("tempo esgotado"))},15000);
 w.onmessage=e=>{fim();ok(e.data.r&&{...e.data.r,buf:e.data.buf})};w.onerror=e=>{fim();no(e)};
 w.postMessage({buf,W,H},[buf])})}
async function prepararLogo(f){
 const url=await readUrl(f);
 if(f.type==="image/svg+xml")return{url,msg:"Logo carregada"};
 const im=new Image();im.src=url;await im.decode();let c=null;
 try{const k=Math.min(1,1000/Math.max(im.naturalWidth,im.naturalHeight)),W=Math.max(1,Math.round(im.naturalWidth*k)),H=Math.max(1,Math.round(im.naturalHeight*k));
  c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0,W,H);
  const d=x.getImageData(0,0,W,H).data,pts=[0,W-1,(H-1)*W,W*H-1];for(let i=0;i<100;i++)pts.push(Math.floor(Math.random()*W*H));
  if(pts.filter(p=>d[p*4+3]<200).length>pts.length*.05)return{url,msg:"Logo carregada"};
  const r=await cutWorker(d.buffer,W,H);
  if(!r)return{url,msg:"Fundo complexo. Use PNG ou SVG com fundo transparente."};
  const id=x.createImageData(W,H);id.data.set(new Uint8ClampedArray(r.buf));x.putImageData(id,0,0);
  const o=document.createElement("canvas");o.width=r.w;o.height=r.h;o.getContext("2d").drawImage(c,r.x0,r.y0,r.w,r.h,0,0,r.w,r.h);
  const blob=await new Promise(ok=>o.toBlob(ok,"image/png"));o.width=o.height=0;
  return{url:await readUrl(blob),msg:"Fundo removido"}}
 finally{if(c)c.width=c.height=0}}
async function handleLogoFile(f){const inp=$("#logo-file");if(!f||logoBusy)return;
 const bad=m=>{toast(m);if(inp)inp.value=""};
 if(!LOGO_TIPOS.includes(f.type))return bad("Use PNG, SVG ou JPG.");
 if(f.size>LOGO_MAX)return bad("Imagem muito grande. Máximo 2 MB.");
 logoBusy=true;document.body.classList.add("is-processing");const y=scrollY;
 try{let r;try{r=await prepararLogo(f)}catch(e){r={url:await readUrl(f),msg:"Não consegui separar o fundo. Use PNG ou SVG com fundo transparente."}}
  const im=new Image();im.src=r.url;await im.decode().catch(()=>{});
  LOGO=r.url;paintPreview();paintPrice();toast(r.msg)}
 catch(e){bad("Não foi possível processar a imagem.")}
 finally{logoBusy=false;document.body.classList.remove("is-processing");{const de=document.documentElement,sb=de.style.scrollBehavior;de.style.scrollBehavior="auto";scrollTo(0,y);de.style.scrollBehavior=sb}}}
function logoRemove(){LOGO=null;const inp=$("#logo-file");if(inp)inp.value="";paintPreview();paintPrice();toast("Logo removida da prévia")}
/* ===== FAQ E DEPOIMENTOS ===== */
const depoHtml=()=>DEPOIMENTOS.length?`<section class="rv" id="depoimentos"><div class="w"><div class="sechd"><div class="kicker">Quem compra</div><h2>O que dizem</h2></div><div class="depo">${DEPOIMENTOS.map(d=>`<article><b>${esc(d.nome)}</b><div class="mut sm">${esc([d.empresa,d.cidade].filter(Boolean).join(" · "))}</div><p>${esc(d.texto)}</p></article>`).join("")}</div></div></section>`:"";
const faqHtml=()=>{const lista=PRODUTO.descontos.filter(d=>d.pct>0).map(d=>`${d.min} peças (${d.pct}%)`).join(", ");
 const itens=[["Qual o pedido mínimo?",`${P.min} peças, somando todas as cores, tamanhos e modelos.`],["Posso misturar cores, tamanhos e modelos?","Sim. Cada combinação vira uma linha no pedido."],["Como funciona o desconto por volume?",`Sobre o total do pedido: ${lista}.`],["Quanto custa a personalização?",PRODUTO.personalizacoes.map(x=>`${x.nome}: ${brl(x.preco)}`).join(". ")+"."],["Como envio a logo?","Veja a prévia nesta página e envie o arquivo original (PNG, SVG ou JPG) pelo WhatsApp junto do pedido."],["Quem define frete e pagamento?","Os dois são combinados pelo WhatsApp depois do envio do pedido."],["Meu pedido já foi enviado ao finalizar?","Só depois que você confirmar o envio no WhatsApp."]];
 return `<section class="rv" id="faq"><div class="w"><div class="sechd"><div class="kicker">Dúvidas</div><h2>Perguntas frequentes</h2></div><div class="faq">${itens.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div></div></section>`};
document.addEventListener("change",e=>{if(e.target.id==="logo-file"){const f=e.target.files[0];clearTimeout(dbT);dbT=setTimeout(()=>handleLogoFile(f),200)}});
document.addEventListener("click",e=>{if(e.target.closest('[data-act="logox"]'))logoRemove()});

/* ===== INIT ===== */
let rq=0;addEventListener("scroll",()=>{if(rq)return;rq=requestAnimationFrame(()=>{rq=0;$$(".rv:not(.in)").forEach(e=>{if(e.getBoundingClientRect().top<innerHeight)e.classList.add("in")})})},{passive:true});
P.cores.slice(0,2).forEach(c=>{if(c.foto){const l=document.createElement("link");l.rel="preload";l.as="image";l.href=c.foto;document.head.appendChild(l)}});
$("#fab").href=wa("Olá! Vim pelo site e gostaria de falar sobre as camisetas no atacado.");
buildDrawer();document.body.insertAdjacentHTML("beforeend",'<div class="sr" id="live" aria-live="polite"></div>');
$("#fi").innerHTML=`<b>${esc(CONFIG.nome)}</b> · Camisetas no atacado<br>WhatsApp ${fmtTel(CONFIG.whats)}`;
$("#fl").innerHTML=`<a href="#entregas">Entregas</a> · <a href="#privacidade">Privacidade</a> · <a href="${IGURL()}" target="_blank" rel="noopener">Instagram @${esc(IG())}</a>`;
window.addEventListener("hashchange",route);save();route();