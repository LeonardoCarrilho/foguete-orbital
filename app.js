// Foguete Orbital — jogo original de desviar obstáculos, feito com divs e JavaScript puro.
const jogo = document.querySelector("#jogo");
const foguete = document.querySelector("#foguete");
const tela = document.querySelector("#tela");
const elPontos = document.querySelector("#pontos");
const elRecorde = document.querySelector("#recorde");

const GRAVIDADE = 0.35, IMPULSO = -6.5, VELOCIDADE = 2.6, ABERTURA = 0.32, INTERVALO = 220;
let y, vy, campos, pontos, quadro, rodando = false, ultimo = 0;
let recorde = 0;
try { recorde = Number(localStorage.getItem("recorde-foguete")) || 0; } catch {}
elRecorde.textContent = recorde;

const tamanho = () => jogo.getBoundingClientRect();

function criarCampo() {
  const { width, height } = tamanho();
  const abertura = height * ABERTURA;
  const topo = 40 + Math.random() * (height - abertura - 80);
  const cima = document.createElement("div");
  const baixo = document.createElement("div");
  cima.className = baixo.className = "campo";
  cima.style.top = "-12px"; cima.style.height = topo + 12 + "px";
  baixo.style.top = topo + abertura + "px"; baixo.style.height = height - topo - abertura + 12 + "px";
  jogo.append(cima, baixo);
  campos.push({ x: width, cima, baixo, contou: false });
}

function iniciar() {
  campos?.forEach((c) => { c.cima.remove(); c.baixo.remove(); });
  campos = []; pontos = 0; quadro = 0; vy = 0; y = tamanho().height / 2;
  elPontos.textContent = 0;
  tela.classList.remove("visivel");
  rodando = true;
  ultimo = performance.now();
  requestAnimationFrame(loop);
}

function fim() {
  rodando = false;
  if (pontos > recorde) {
    recorde = pontos;
    try { localStorage.setItem("recorde-foguete", recorde); } catch {}
    elRecorde.textContent = recorde;
  }
  tela.innerHTML = `<h1>Fim de jogo</h1><p>Você fez <b>${pontos}</b> pontos.</p><button id="iniciar">Jogar de novo</button>`;
  tela.classList.add("visivel");
  tela.querySelector("#iniciar").addEventListener("click", iniciar);
}

function colide(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function loop(agora) {
  if (!rodando) return;
  const passo = Math.min((agora - ultimo) / 16.67, 3); // independente da taxa de quadros
  ultimo = agora;
  const { height } = tamanho();
  vy += GRAVIDADE * passo; y += vy * passo;
  foguete.style.top = y + "px";
  foguete.style.transform = `rotate(${Math.max(-30, Math.min(70, vy * 6)) + 45}deg)`;

  if ((quadro += passo) >= INTERVALO / VELOCIDADE) { quadro = 0; criarCampo(); }
  const rf = foguete.getBoundingClientRect();
  const margem = 8;
  const caixa = { left: rf.left + margem, right: rf.right - margem, top: rf.top + margem, bottom: rf.bottom - margem };
  for (const c of campos) {
    c.x -= VELOCIDADE * passo;
    c.cima.style.left = c.baixo.style.left = c.x + "px";
    if (colide(caixa, c.cima.getBoundingClientRect()) || colide(caixa, c.baixo.getBoundingClientRect())) return fim();
    if (!c.contou && c.x + 64 < foguete.offsetLeft) { c.contou = true; elPontos.textContent = ++pontos; }
  }
  campos = campos.filter((c) => (c.x > -80 ? true : (c.cima.remove(), c.baixo.remove(), false)));
  if (y < -10 || y > height - 30) return fim();
  requestAnimationFrame(loop);
}

const acelerar = () => { if (rodando) vy = IMPULSO; };
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); rodando ? acelerar() : iniciar(); }
});
jogo.addEventListener("pointerdown", (e) => { if (e.target.tagName !== "BUTTON") acelerar(); });
document.querySelector("#iniciar").addEventListener("click", iniciar);
