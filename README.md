# Desenho Assinado

Página que recebe um número inteiro entre 1 e 100 e devolve uma figura em SVG, assinada com um e-mail.

A figura é a tabuada modular no círculo: 240 pontos igualmente espaçados numa circunferência, com cada ponto `i` ligado ao ponto `(k * i) mod 240`, em que `k = número + 1`. O número 1 produz uma cardioide, o 2 uma nefroide, e cada valor gera uma figura diferente.

## Funcionamento

O desenho é gerado no servidor, por uma Cloudflare Pages Function. O usuário faz login com o Google na página e envia apenas o número; o token de login vai no cabeçalho `Authorization`. A função `functions/api/desenho.js` verifica o token no Google e usa o e-mail contido nele para assinar o desenho, gerado por `gerarDesenho(numero, email)` de `lib/desenho.js`. O e-mail nunca é informado pelo cliente.

A rota `POST /api/desenho` responde `200` com o SVG, `400` para número inválido, `401` para token ausente ou inválido e `405` para outros métodos.

```
public/                 front-end (somente)
  index.html            botão de login do Google e campo número
  style.css             aparência da página
  script.js             faz o login, chama /api/desenho e exibe o SVG
  privacidade.html      política de privacidade
functions/api/
  desenho.js            Pages Function: valida número e token, devolve o SVG
lib/
  desenho.js            gera o SVG (função pura, sem DOM)
```

## Publicação no Cloudflare Pages

Framework preset: `None`. Build command: vazio. Build output directory: `public`.

## Identificação (preencha após o fork)

Nome: Marcos Vinicius Fagundes Ricardo
RA: 2026107783
URL: https://desenho-assinado-marcos.pages.dev