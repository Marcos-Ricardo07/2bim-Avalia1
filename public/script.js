// script.js
// O desenho e gerado no servidor (Pages Function em /api/desenho).
// Esta pagina so faz o login com o Google, envia o numero com o token
// e exibe o SVG devolvido.

const CLIENT_ID = "35737212971-kpnv2nj0767bj00jesbu6ij5kr5va8q8.apps.googleusercontent.com";

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const statusLogin = document.getElementById("status-login");
const erro = document.getElementById("erro");
const area = document.getElementById("desenho");
const botaoBaixar = document.getElementById("baixar");

let idToken = null;
let svgAtual = "";
let numeroAtual = null;

// Le o e-mail do payload do JWT apenas para mostrar na tela.
// Esse valor nunca e enviado ao servidor: quem decide o e-mail e o token.
function emailDoToken(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)).email || null;
  } catch {
    return null;
  }
}

function aoFazerLogin(response) {
  idToken = response.credential;
  const email = emailDoToken(idToken);
  statusLogin.textContent = email
    ? "Login feito como " + email + "."
    : "Login feito.";
  erro.textContent = "";
}

window.onload = () => {
  if (typeof google === "undefined" || !google.accounts) {
    statusLogin.textContent = "Não foi possível carregar o login do Google.";
    return;
  }
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: aoFazerLogin,
  });
  google.accounts.id.renderButton(document.getElementById("botao-google"), {
    theme: "filled_black",
    size: "large",
    text: "signin_with",
  });
};

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  erro.textContent = "";

  const numero = Number(campoNumero.value);
  const headers = { "Content-Type": "application/json" };
  if (idToken) headers.Authorization = "Bearer " + idToken;

  let resp;
  try {
    resp = await fetch("/api/desenho", {
      method: "POST",
      headers,
      body: JSON.stringify({ numero }),
    });
  } catch {
    erro.textContent = "Falha de rede. Tente novamente.";
    return;
  }

  if (resp.status === 400) {
    erro.textContent = "Número inválido. Use um inteiro entre 1 e 100.";
    return;
  }
  if (resp.status === 401) {
    idToken = null;
    statusLogin.textContent = "Você não está logado.";
    erro.textContent = "Não autorizado. Faça login com sua conta Google e tente novamente.";
    return;
  }
  if (resp.status !== 200) {
    erro.textContent = "Erro inesperado (status " + resp.status + "). Tente novamente.";
    return;
  }

  svgAtual = await resp.text();
  numeroAtual = numero;
  area.innerHTML = svgAtual;
  botaoBaixar.hidden = false;
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "desenho-" + numeroAtual + ".svg";
  link.click();
  URL.revokeObjectURL(url);
});
