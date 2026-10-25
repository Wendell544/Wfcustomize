/* ===== CONFIG ===== */
const CONFIG={nome:"WFCUSTOM",whats:"5583999667578",instagram:"wfcustomm" /* usuário do Instagram, sem @ */,frete:null /* null = "Frete a combinar"; ou número, ex.: 25 */};
const PRODUTO={
 id:"CAM-001",nome:"Camiseta básica 100% algodão",min:30,
 tamanhos:["P","M","G"],generos:["Masculina","Feminina"],
 /* preço da camiseta em cada personalização (R$ por peça) */
 personalizacoes:[
  {id:"nenhuma",nome:"Sem logo",desc:"Camiseta lisa",preco:22},
  {id:"peito",nome:"Logo no peito",desc:"Pequena, lado esquerdo da frente",preco:30},
  {id:"frente_costas",nome:"Frente e costas",desc:"Logo na frente e nas costas, juntas",preco:36}],
 /* galeria extra: links diretos (ex.: ImgBB). Clique na miniatura para ampliar. */
 fotos:[/* "https://i.ibb.co/XXXX/foto1.jpg" */],
 /* "foto": link direto da foto real da cor; quando preenchido, substitui a ilustração */
 cores:[
  {nome:"Preta",hex:"#161616",foto:"",fotoCostas:""},{nome:"Branca",hex:"#f7f7f7",foto:"",fotoCostas:""},{nome:"Off-white",hex:"#efe8d6",foto:"",fotoCostas:""},{nome:"Bege",hex:"#cdb99a",foto:"",fotoCostas:""},
  {nome:"Cinza mescla",hex:"#b9bcc2",foto:"",fotoCostas:""},{nome:"Cinza chumbo",hex:"#4b4d52",foto:"",fotoCostas:""},{nome:"Marrom",hex:"#5b4a3d",foto:"",fotoCostas:""},{nome:"Caramelo",hex:"#b8742a",foto:"",fotoCostas:""},
  {nome:"Amarela",hex:"#f2b705",foto:"",fotoCostas:""},{nome:"Vermelha",hex:"#d3122a",foto:"",fotoCostas:""},{nome:"Vinho",hex:"#6e1830",foto:"",fotoCostas:""},{nome:"Rosa",hex:"#f08fb5",foto:"",fotoCostas:""},
  {nome:"Lilás",hex:"#c9b6e4",foto:"",fotoCostas:""},{nome:"Azul bebê",hex:"#9fc3e8",foto:"",fotoCostas:""},{nome:"Azul royal",hex:"#1f3fd1",foto:"",fotoCostas:""},{nome:"Azul marinho",hex:"#16213f",foto:"",fotoCostas:""},
  {nome:"Verde bandeira",hex:"#1d5a3a",foto:"",fotoCostas:""},{nome:"Verde militar",hex:"#5a5a3a",foto:"",fotoCostas:""}]
};

/* Tabela de medidas em cm (aparece no site e no menu). Para mudar, edite os números. */
const MEDIDAS={
 colunas:["Peito","Comprimento","Ombros","Manga"],
 linhas:[{tam:"P",v:["52","69","38","14"]},{tam:"M",v:["53","72","40","16,5"]},{tam:"G",v:["55","74","44","18"]}],
 nota:"Medidas aproximadas. Pode haver variação de até 2 cm."
};

/* Desconto por volume: sobre o total do pedido (não por linha). Confirme os percentuais antes de publicar. */
PRODUTO.descontos=[{min:30,pct:0},{min:50,pct:5},{min:100,pct:10},{min:200,pct:15}];
/* Depoimentos reais: preencha quando tiver. Lista vazia = a seção não aparece. */
const DEPOIMENTOS=[];
/* Logo sobre a camiseta (foto ou ilustração): âncoras anatômicas.
   Todas as frações são da LARGURA/ALTURA DA CAMISA (não do quadro da imagem); a camisa é localizada na foto automaticamente.
   cx, cy = centro (0 = borda esquerda/topo da camisa, 1 = direita/base); w, h = tamanho; rot = giro em graus. */
PRODUTO.ancoras={
 peito:{cx:0.62,cy:0.32,w:0.14,h:0.14,rot:0},  /* peitoral esquerdo de quem veste (lado direito da imagem). Usado na frente de "Logo no peito" e "Frente e costas" */
 frente:{cx:0.50,cy:0.30,w:0.34,h:0.34,rot:0}, /* estampa grande centralizada na frente (reserva; nenhuma opção usa hoje) */
 costas:{cx:0.50,cy:0.38,w:0.42,h:0.42,rot:0}  /* parte alta das costas. cy 0.38 (e não 0.24): com 0.24 uma logo quadrada encosta na gola */
};
/* realismoMaximo: true aplica leve perspectiva/cisalhamento na logo para imitar a curvatura do peito. Padrão: desligado. */
PRODUTO.opcoes={realismoMaximo:false};
