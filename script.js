(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIGURAÇÃO DO SITE
     Preencha os dados abaixo. Campos vazios não aparecem no site.
     ------------------------------------------------------------------ */
  var SITE = {
    // Data de fundação: ano, mês (1 a 12), dia
    fundacao: { ano: 1988, mes: 7, dia: 15 },

    contatos: {
      whatsapp: "(11) 91347-1420",   // ex.: "(11) 90000-0000"
      email: "",      // ex.: "contato@exemplo.org"
      instagram: "",  // ex.: "@nomedaong"
      endereco: "Sede Jardim Colonial - Rua José Rodrigues Santarém, 400, ao lado da UBS Jardim Colonial"
    }
  };

  var root = document.documentElement;
  root.classList.add("js");

  /* ----------------------------- Anos de atuação ----------------------------- */
  function calcularAnos(f) {
    var hoje = new Date();
    var anos = hoje.getFullYear() - f.ano;
    var fezAniversario =
      hoje.getMonth() + 1 > f.mes ||
      (hoje.getMonth() + 1 === f.mes && hoje.getDate() >= f.dia);
    return fezAniversario ? anos : anos - 1;
  }

  var anos = calcularAnos(SITE.fundacao);
  Array.prototype.forEach.call(document.querySelectorAll("[data-anos]"), function (el) {
    el.textContent = String(anos);
  });
  var selo = document.querySelector(".hero-year");
  if (selo) {
    selo.setAttribute(
      "aria-label",
      "Fundada em 15 de julho de " + SITE.fundacao.ano + ", com " + anos + " anos de atuação"
    );
  }

  /* --------------------------------- Tema --------------------------------- */
  var themeBtn = document.getElementById("theme-toggle");
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function lerTema() {
    try { return localStorage.getItem("tema"); } catch (e) { return null; }
  }

  function salvarTema(valor) {
    try { localStorage.setItem("tema", valor); } catch (e) { /* sem armazenamento */ }
  }

  function temaAtual() {
    var explicito = root.getAttribute("data-theme");
    if (explicito === "dark" || explicito === "light") return explicito;
    return media && media.matches ? "dark" : "light";
  }

  function atualizarBotaoTema() {
    if (!themeBtn) return;
    themeBtn.textContent = temaAtual() === "dark" ? "Claro" : "Escuro";
  }

  var salvo = lerTema();
  if (salvo === "dark" || salvo === "light") root.setAttribute("data-theme", salvo);
  atualizarBotaoTema();

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var proximo = temaAtual() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", proximo);
      salvarTema(proximo);
      atualizarBotaoTema();
    });
  }

  if (media && media.addEventListener) {
    media.addEventListener("change", atualizarBotaoTema);
  }

  /* ------------------------------ Menu no celular ------------------------------ */
  var header = document.querySelector(".site-header");
  var menuBtn = document.getElementById("menu-toggle");
  var menu = document.getElementById("menu");

  function definirMenu(aberto) {
    if (!header || !menuBtn) return;
    header.classList.toggle("menu-open", aberto);
    menuBtn.setAttribute("aria-expanded", aberto ? "true" : "false");
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      definirMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (e) {
      if (e.target && e.target.tagName === "A") definirMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") definirMenu(false);
    });
  }

  /* ------------------------------ Imagem ampliada ------------------------------ */
  var caixa = document.getElementById("lightbox");
  var caixaImg = document.getElementById("lightbox-img");
  var caixaFechar = document.getElementById("lightbox-close");
  var caixaAnterior = document.getElementById("lightbox-prev");
  var caixaProxima = document.getElementById("lightbox-next");
  var caixaContador = document.getElementById("lightbox-count");
  var caixaPalco = document.getElementById("lightbox-stage");

  if (caixa && caixaImg && typeof caixa.showModal === "function") {
    var grupo = [];      // links das fotos da galeria aberta
    var atual = 0;       // posição da foto exibida
    var temporizador = null;
    var reduzMovimento =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Fotos dentro de um elemento com data-galeria formam um grupo navegável.
    // Uma imagem fora de galeria abre sozinha, sem setas.
    function fotosDoGrupo(link) {
      var galeria = link.closest("[data-galeria]");
      if (!galeria) return [link];
      return Array.prototype.slice.call(galeria.querySelectorAll(".shot"));
    }

    function posicao(i) {
      return (i + grupo.length) % grupo.length;
    }

    function preCarregar(i) {
      var link = grupo[posicao(i)];
      if (link) new Image().src = link.getAttribute("href");
    }

    function exibir(i) {
      var link = grupo[i];
      var miniatura = link.querySelector("img");

      caixaImg.onload = function () { caixaImg.classList.remove("is-changing"); };
      caixaImg.src = link.getAttribute("href");
      caixaImg.alt = miniatura ? miniatura.alt : "";

      if (caixaContador) caixaContador.textContent = (i + 1) + " de " + grupo.length;

      // Garante que a foto reapareça mesmo se o evento de carga não disparar
      setTimeout(function () { caixaImg.classList.remove("is-changing"); }, 500);

      if (grupo.length > 1) {
        preCarregar(i + 1);
        preCarregar(i - 1);
      }
    }

    // delta = 1 avança, delta = -1 volta. Na última foto volta para a primeira, e vice-versa.
    function mover(delta) {
      if (grupo.length < 2) return;
      atual = posicao(atual + delta);

      if (reduzMovimento) {
        exibir(atual);
        return;
      }

      caixaImg.classList.add("is-changing");
      clearTimeout(temporizador);
      temporizador = setTimeout(function () { exibir(atual); }, 160);
    }

    function abrir(link) {
      grupo = fotosDoGrupo(link);
      atual = grupo.indexOf(link);
      var varias = grupo.length > 1;

      if (caixaAnterior) caixaAnterior.hidden = !varias;
      if (caixaProxima) caixaProxima.hidden = !varias;
      if (caixaContador) caixaContador.hidden = !varias;

      caixaImg.classList.remove("is-changing");
      exibir(atual);
      caixa.showModal();
    }

    Array.prototype.forEach.call(document.querySelectorAll(".shot"), function (link) {
      link.addEventListener("click", function (e) {
        if (!link.querySelector("img")) return;
        e.preventDefault();
        abrir(link);
      });
    });

    if (caixaAnterior) caixaAnterior.addEventListener("click", function () { mover(-1); });
    if (caixaProxima) caixaProxima.addEventListener("click", function () { mover(1); });
    if (caixaFechar) caixaFechar.addEventListener("click", function () { caixa.close(); });

    // Setas do teclado trocam de foto. A tecla Esc já fecha o visualizador.
    document.addEventListener("keydown", function (e) {
      if (!caixa.open) return;
      if (e.key === "ArrowRight") { e.preventDefault(); mover(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); mover(-1); }
    });

    // No celular, deslizar o dedo para o lado também troca de foto
    if (caixaPalco) {
      var inicioX = null;

      caixaPalco.addEventListener("touchstart", function (e) {
        inicioX = e.changedTouches[0].clientX;
      }, { passive: true });

      caixaPalco.addEventListener("touchend", function (e) {
        if (inicioX === null) return;
        var deslocamento = e.changedTouches[0].clientX - inicioX;
        inicioX = null;
        if (Math.abs(deslocamento) > 50) mover(deslocamento < 0 ? 1 : -1);
      }, { passive: true });
    }

    // Clique no fundo escuro, fora da caixa, também fecha
    caixa.addEventListener("click", function (e) {
      if (e.target !== caixa) return;
      var r = caixa.getBoundingClientRect();
      var fora = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (fora) caixa.close();
    });

    caixa.addEventListener("close", function () {
      clearTimeout(temporizador);
      caixaImg.classList.remove("is-changing");
    });
  }

  /* --------------------------------- Contato --------------------------------- */
  var lista = document.getElementById("contact-list");
  var vazio = document.getElementById("contact-empty");

  function apenasDigitos(txt) {
    return txt.replace(/\D/g, "");
  }

  function criarItem(rotulo, valor, link, copiavel) {
    var li = document.createElement("li");

    var r = document.createElement("span");
    r.className = "contact-label";
    r.textContent = rotulo;
    li.appendChild(r);

    var v;
    if (link) {
      v = document.createElement("a");
      v.href = link;
      v.target = "_blank";
      v.rel = "noopener noreferrer";
    } else {
      v = document.createElement("span");
    }
    v.className = "contact-value";
    v.textContent = valor;
    li.appendChild(v);

    if (copiavel) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "contact-copy";
      b.textContent = "Copiar";
      b.addEventListener("click", function () { copiar(valor, v, b); });
      li.appendChild(b);
    }

    return li;
  }

  function selecionar(el) {
    try {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* sem seleção */ }
  }

  function copiar(texto, alvo, botao) {
    function feito() {
      botao.textContent = "Copiado";
      setTimeout(function () { botao.textContent = "Copiar"; }, 1800);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(feito, function () { selecionar(alvo); });
    } else {
      selecionar(alvo);
    }
  }

  if (lista) {
    var c = SITE.contatos;
    var itens = [];

    if (c.whatsapp) {
      var digitos = apenasDigitos(c.whatsapp);
      var numero = digitos.indexOf("55") === 0 && digitos.length > 11 ? digitos : "55" + digitos;
      itens.push(criarItem("WhatsApp", c.whatsapp, "https://wa.me/" + numero, false));
    }
    if (c.email) {
      itens.push(criarItem("E-mail", c.email, "", true));
    }
    if (c.instagram) {
      var usuario = c.instagram.replace(/^@/, "");
      itens.push(criarItem("Instagram", "@" + usuario, "https://www.instagram.com/" + encodeURIComponent(usuario), false));
    }
    if (c.endereco) {
      itens.push(criarItem("Endereço", c.endereco, "", false));
    }

    itens.forEach(function (li) { lista.appendChild(li); });
    if (vazio) vazio.hidden = itens.length > 0;
  }
})();
