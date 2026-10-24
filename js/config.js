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
  {nome:"Preta",hex:"#161616",foto:""},{nome:"Branca",hex:"#f7f7f7",foto:""},{nome:"Off-white",hex:"#efe8d6",foto:""},{nome:"Bege",hex:"#cdb99a",foto:""},
  {nome:"Cinza mescla",hex:"#b9bcc2",foto:""},{nome:"Cinza chumbo",hex:"#4b4d52",foto:""},{nome:"Marrom",hex:"#5b4a3d",foto:""},{nome:"Caramelo",hex:"#b8742a",foto:""},
  {nome:"Amarela",hex:"#f2b705",foto:""},{nome:"Vermelha",hex:"#d3122a",foto:""},{nome:"Vinho",hex:"#6e1830",foto:""},{nome:"Rosa",hex:"#f08fb5",foto:""},
  {nome:"Lilás",hex:"#c9b6e4",foto:""},{nome:"Azul bebê",hex:"#9fc3e8",foto:""},{nome:"Azul royal",hex:"#1f3fd1",foto:""},{nome:"Azul marinho",hex:"#16213f",foto:""},
  {nome:"Verde bandeira",hex:"#1d5a3a",foto:""},{nome:"Verde militar",hex:"#5a5a3a",foto:""}]
};

/* Tabela de medidas em cm (aparece no site e no menu). Para mudar, edite os números. */
const MEDIDAS={
 colunas:["Peito","Comprimento","Ombros","Manga"],
 linhas:[{tam:"P",v:["52","69","38","14"]},{tam:"M",v:["53","72","40","16,5"]},{tam:"G",v:["55","74","44","18"]}],
 nota:"Medidas aproximadas. Pode haver variação de até 2 cm."
};
