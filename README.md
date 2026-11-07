# WFCUSTOM – loja de camisetas no atacado

Site estático (HTML, CSS e JavaScript puros). Não precisa de servidor nem de instalação.

## Arquivos
- `index.html` – estrutura, SEO e metadados
- `css/style.css` – todo o visual (cores, modo escuro, responsivo)
- `js/config.js` – **o que você edita**: WhatsApp, preços, mínimo, tamanhos, cores e fotos
- `js/app.js` – lógica (configurador, carrinho, checkout, mensagem do WhatsApp)

## Publicar no GitHub Pages
1. Crie um repositório e envie estes arquivos mantendo as pastas `css/` e `js/`.
2. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. O site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/` em alguns minutos.

## Editar preços e regras (`js/config.js`)
- Preços por peça em `personalizacoes`: sem logo R$ 22, logo na frente R$ 30, frente e costas R$ 36.
- Pedido mínimo: `min: 30` (soma de todas as cores, tamanhos e modelos).
- Instagram: `instagram` (usuário sem @, hoje `wfcustomm`). Aparece no menu dos 3 pontinhos, no rodapé e no SEO.
- Tabela de medidas: bloco `MEDIDAS` (números em cm; aparece no site e no menu).
- WhatsApp: `whats` (55 + DDD + número). Frete: `frete: null` mostra "Frete a combinar".
- Depois de mudar preços, atualize também `lowPrice`/`highPrice` no bloco JSON-LD do `index.html` (só afeta o Google).

## Trocar as fotos (ImgBB)
1. Envie a foto em imgbb.com e copie o **link direto** (`https://i.ibb.co/...`).
2. Cole em `js/config.js`: no campo `foto` de uma cor (aparece quando o cliente escolhe a cor) ou em `fotos` (galeria que amplia ao clicar).
Sem link, o site mostra a ilustração da camiseta na cor escolhida.

## Testar no computador
Abra o `index.html` no navegador, ou rode `python3 -m http.server` na pasta e acesse `http://localhost:8000`.

## O que o site não faz
- Não tem painel com login: a edição é feita no `js/config.js`.
- Não guarda pedidos: eles existem só na conversa do WhatsApp.
- A logo que aparece nas camisetas é um exemplo; a arte do cliente vem pelo WhatsApp.

## Realismo do SVG — como funciona
Cores sem foto usam a camiseta desenhada em 11 camadas fixas: sombra de contato, silhueta, luz principal, oclusão nas axilas e no decote, 6 dobras, textura de malha (só no corpo), ribana canelada, costuras, etiqueta (costas), logo e vinheta. Nada é aleatório. O desenho de cada cor/lado fica em cache (20 itens) e muda no tema escuro (sombra e luz mais fortes). Para ver a diferença, compare Preta e Branca.

## Posição da logo e calibração
`PRODUTO.ancoras` (em `js/config.js`) guarda a posição da logo em frações da camisa (não da imagem), então vale para a ilustração e para qualquer foto. Nas fotos, o site acha a camisa sozinho (fundo liso) e, se não conseguir, usa a foto inteira. Para calibrar: abra a prévia, ajuste `cx`/`cy` (centro) e `w`/`h` (tamanho) em passos de 0,01, salve e recarregue. O calibrador com arraste ainda não foi implementado.

## Cortador de fundo — quando funciona e quando recusa
SVG e PNG/WebP com transparência entram direto. JPEG, WebP e PNG opaco passam pelo cortador (roda em Worker): ele lê a cor das bordas, remove o fundo uniforme (branco, cinza, cor lisa, sombra suave) e suaviza a borda sem halo. Se a borda não tiver um fundo dominante, ele recusa e mantém a imagem original com o aviso "use PNG ou SVG com fundo transparente".

## Testes de validação (rode após cada atualização)
- iPhone SE (DevTools): enviar JPEG de 1,5 MB; a página não pode mexer nem dar zoom.
- Logos: PNG transparente, SVG, JPEG com fundo branco (corta) e JPEG com foto de fundo (recusa).
- Trocar Preta e Branca, tema claro e escuro, e conferir carrinho, checkout e mensagem do WhatsApp.
- Lighthouse (Performance, Acessibilidade) e Memory (50 uploads seguidos).

## AVISO: como trocar as fotos
Abra `js/config.js` e preencha:
1. `heroFoto:"img/hero.jpg"` – foto grande do topo. Vazio = ilustração da camiseta.
2. `fotos:["img/foto-01.jpg","img/foto-02.jpg","img/foto-03.jpg"]` – galeria "Fotos reais". A seção aparece sozinha quando há pelo menos uma foto e cada foto amplia ao clicar.
3. Em cada cor, `foto:` (frente) e `fotoCostas:` (costas). Ex.: `{nome:"Preta",hex:"#161616",foto:"img/preta-frente.jpg",fotoCostas:"img/preta-costas.jpg"}`

Crie a pasta `img/` ao lado do `index.html` e envie a pasta ao GitHub junto com `css/` e `js/` (ou use links diretos do ImgBB, `https://i.ibb.co/...`). Dica: fotos quadradas, fundo liso, até 400 KB. No GitHub Pages maiúsculas e minúsculas importam: `Foto-01.JPG` não é `foto-01.jpg`.

## V10 – upgrade visual
A lógica (carrinho, checkout, WhatsApp, medidas, upload de logo, rotas e reveal) não foi alterada.
- Topo: grade sutil com máscara radial, orb rosa flutuante, "marca" em gradiente rosa→violeta, imagem com brilho pulsante e chips flutuando.
- Faixa marquee logo abaixo do topo e seção `#stats` com contadores (500+, 98%, 24h, 100%). As duas vêm de `v10Band()` no `js/app.js`, chamada em `viewHome()` logo depois do topo.
- Botões em gradiente com brilho deslizante, cards `.pc` com elevação e sombra violeta, borda animada no card em destaque, `.tag` e selo do carrinho em gradiente, botão do WhatsApp pulsando, lupa na galeria, cabeçalho em vidro escuro e rodapé em degradê.
- Todo o CSS novo fica no bloco `/* ===== V10 ===== */` no fim de `css/style.css`. Com `prefers-reduced-motion` tudo para: a faixa vira texto estático e os contadores mostram o valor final.

Para editar: textos da faixa em `V10_FAIXA` e números/rótulos em `V10_STATS` (bloco V10 do `js/app.js`). Os números de clientes, satisfação e prazo são exemplos: confirme que são verdadeiros antes de publicar.
Para desfazer: apague o bloco V10 do CSS e do `app.js` e tire `${v10Band()}` de `viewHome()`.
Se o navegador mostrar a versão antiga, use Ctrl+F5. O `?v=10` no `index.html` já força o carregamento novo.
