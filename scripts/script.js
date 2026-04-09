const SOUND_FILE = "media/scramble.mp3";

const sujetos = [
  "El que lo intenta", "Quien da el primer paso", "El que aprende cada día",
  "Alguien constante", "El que sigue adelante", "Quien se equivoca",
  "El que se levanta", "Una mente curiosa", "El que practica",
  "Quien sabe escuchar", "El que observa y aprende", "Alguien paciente",
  "El que decide cambiar", "Quien busca mejorar", "El que se adapta",
  "Una buena decisión", "Un pequeño paso", "El esfuerzo de cada día",
  "La disciplina", "La constancia", "Aprender siempre",
  "El hábito diario", "La motivación", "El compromiso",
  "El enfoque", "La dedicación", "La práctica constante",
  "El cambio", "La perseverancia", "El progreso",
  "La intención", "Intentarlo de verdad", "La actitud",
  "El trabajo de cada día", "Mejorar un poco cada vez", "La iniciativa",
  "El que no se rinde", "Quien lo vuelve a intentar",
  "El que corrige sus errores", "Alguien que insiste",
  "El que se esfuerza", "Quien quiere aprender de verdad",
  "El que se mantiene firme", "Alguien que avanza",
  "El que no para", "Quien sigue intentándolo",
  "El que da lo mejor de sí", "Alguien comprometido",
  "El que empieza sin miedo", "Quien enfrenta los retos",
  "El que se supera", "Alguien que evoluciona",
  "El que crea hábitos", "Quien pasa a la acción",
  "El que persevera", "Alguien enfocado",
  "El que se reta a sí mismo", "Quien busca soluciones",
  "El que mejora poco a poco", "Alguien disciplinado",
  "El que actúa", "Quien decide seguir adelante",
  "El que no se queda quieto", "Alguien que progresa",
  "El que sigue aprendiendo", "Quien no abandona",
  "El que se mantiene constante", "Alguien que no se rinde",
  "El que lo intenta cada día", "Quien construye su propio camino",
  "El que da un paso más", "Alguien que no se conforma",
  "El que quiere lograrlo", "Quien trabaja por lo que quiere",
  "El que sigue creciendo", "Alguien que se enfoca",
  "El que insiste hasta lograrlo", "Quien no pierde el rumbo",
  "El que empieza", "El que sigue",
  "El que lo vuelve a intentar", "El que aprende",
  "El que se equivoca y sigue", "El que mejora",
  "El que avanza", "El que insiste",
  "El que lo intenta otra vez", "El que quiere mejorar",
  "El que se enfoca", "El que hace el esfuerzo",
  "Un buen hábito", "El esfuerzo",
  "La práctica", "El intento", "El trabajo",
  "La mejora", "El hábito", "El tiempo", "La paciencia",
  "Hacerlo hoy", "Intentarlo otra vez", "Seguir adelante",
  "No rendirse", "Empezar ya", "Dar el primer paso",
  "Seguir intentando", "Aprender de los errores",
  "Mejorar poco a poco", "Probar algo nuevo",
  "Volver a empezar", "Hacer el esfuerzo",
  "Mantenerse firme", "No detenerse"
];

const verbos = [
  "avanza poquito a poco", "marca la diferencia",
  "trae buenos resultados", "abre oportunidades",
  "siempre vale la pena", "te acerca a lo que quieres",
  "mejora con el tiempo", "deja una buena lección",
  "abre caminos", "genera cambios reales",
  "te ayuda a crecer", "requiere paciencia",
  "toma tiempo, pero funciona", "suma más de lo que crees",
  "te prepara para lo que viene", "da frutos a largo plazo",
  "te hace más fuerte", "es parte del proceso",
  "te impulsa a seguir", "crea nuevas posibilidades",
  "te enseña algo nuevo", "refuerza tu disciplina",
  "te acerca a tu meta", "depende de tu constancia",
  "requiere esfuerzo, pero vale la pena", "te construye día a día",
  "es clave para avanzar", "hace que todo cobre sentido",
  "te mantiene en movimiento", "te ayuda a mejorar cada día",
  "te lleva más lejos de lo que imaginas"
];

const cierres = [
  "Sigue así.", "No te detengas.", "Vale la pena.",
  "Confía en el proceso.", "Paso a paso.",
  "Todo suma.", "Sigue intentándolo.",
  "No te rindas.", "Vas bien.", "Continúa.",
  "Hazlo sencillo.", "Sigue aprendiendo.",
  "Cada día cuenta.", "Mantente firme.",
  "Disfruta el camino.", "Todo mejora con el tiempo.",
  "Sigue avanzando.", "No pierdas el ritmo.",
  "Vas progresando.", "Sigue con eso.",
  "Haz que valga la pena.", "No pares ahora.",
  "Vas mejorando.", "Sigue creciendo.",
  "Confía en ti.", "No te frenes ahora.",
  "Sigue dando lo mejor de ti.", "Mantén el foco.",
  "Todo esfuerzo suma.", "No lo dejes a medias."
];

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#@!%&░▒▓█▌▐▀▄▂▃▅▆▇";

const SECRET_THRESHOLD = 15;

let animId = null;
let lastCombo = "";
let isAnimating = false; 
const audio = new Audio(SOUND_FILE);

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildPhrase() {
  let phrase, attempts = 0;
  do {
    phrase = pick(sujetos) + " " + pick(verbos) + ". " + pick(cierres);
    attempts++;
  } while (phrase === lastCombo && attempts < 10);
  lastCombo = phrase;
  return phrase;
}

function scrambleAnimate(target) {
  const container = document.getElementById('p-text');


  if (animId) {
    clearInterval(animId);
    animId = null;
  }

  container.innerHTML = '';
  const spans = [];

  for (let i = 0; i < target.length; i++) {
    const span = document.createElement('span');
    span.className = 'char ' + (target[i] === ' ' ? 'resolved' : 'scrambling');
    span.textContent = target[i] === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)];
    container.appendChild(span);
    spans.push(span);
  }

  const resolved = target.split('').map(c => c === ' ');
  let resolvedCount = resolved.filter(Boolean).length;
  const total = target.length;
  const DURATION = 1400;


  const generation = ++scrambleAnimate.generation;

  for (let i = 0; i < total; i++) {
    if (target[i] === ' ') continue;

    const delay = (i / total) * DURATION * 0.65 + Math.random() * 200;

    setTimeout(() => {
     
      if (scrambleAnimate.generation !== generation) return;

      resolved[i] = true;
      spans[i].textContent = target[i];
      spans[i].className = 'char resolved';
      resolvedCount++;

      if (resolvedCount >= total) {
        isAnimating = false;
        document.getElementById('btn').disabled = false;
      }
    }, delay + DURATION * 0.35);
  }

  animId = setInterval(() => {
    if (scrambleAnimate.generation !== generation) {
      clearInterval(animId);
      animId = null;
      return;
    }
    for (let i = 0; i < total; i++) {
      if (!resolved[i]) {
        spans[i].textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
      }
    }
  }, 50);

  setTimeout(() => {
    if (scrambleAnimate.generation !== generation) return;
    clearInterval(animId);
    animId = null;
  }, DURATION + 400);
}

scrambleAnimate.generation = 0;


function checkSecretButton() {
  const clicks = parseInt(localStorage.getItem('lucky_clicks') || '0');
  const existing = document.getElementById('secret-btn');

  if (clicks >= SECRET_THRESHOLD) {
    if (!existing) {
      const btn = document.createElement('a');
      btn.id = 'secret-btn';
      btn.href = 'https://yuta578.github.io/ai/';
      btn.textContent = '▇';
      btn.style.cssText = `
        position: fixed;
        bottom: 18px;
        right: 20px;
        color: rgba(255,255,255,0.12);
        font-size: 11px;
        letter-spacing: 0.1em;
      `;
      document.body.appendChild(btn);
    }
  }
}

function generate() {

  if (isAnimating) return;

  isAnimating = true;
  document.getElementById('btn').disabled = true;

  audio.currentTime = 0;
  audio.play().catch(() => {});
  scrambleAnimate(buildPhrase());


  const clicks = parseInt(localStorage.getItem('lucky_clicks') || '0') + 1;
  localStorage.setItem('lucky_clicks', clicks);


  checkSecretButton();
}

document.getElementById('btn').addEventListener('click', generate);

checkSecretButton();


(function initIntro() {
  const INTRO_KEY = 'prescript_intro_seen';

  const startScreen  = document.getElementById('start-screen');
  const startBtn     = document.getElementById('start-btn');
  const dialogScreen = document.getElementById('dialog-screen');
  const dialogBox    = document.getElementById('dialog-box');
  const dialogText   = document.getElementById('dialog-text');
  const dialogNext   = document.getElementById('dialog-next');
  const prescripWrap = document.getElementById('prescrip-wrap');
  const btnWrap      = document.getElementById('btn-wrap');
  const luckyBtn     = document.getElementById('btn');

  
  const lines = [
    "...",
    "Hace mucho no veo a alguien por aquí.",
    "No tengas miedo.",
    "Solo soy una observadora.",
    "Te voy a mostrar algo que puede ayudarte.",
    "Aqui te mostrara mensajes para ti.",           
    "Cada frase te puede resonar.",
    "No hay respuesta correcta.",
    "La pantalla te mostrara lo que tengas que ver",
    "o saber...",
    "Cuando quieras, pulsa el botón.",
    "Buena suerte."
  ];

  const SHOW_BOX_AFTER  = 4; // después de leer la línea 4 (índice 3) y pulsar ›
  const SHOW_BTN_AFTER  = 7; // después de leer la línea 7 (índice 6) y pulsar ›

  let currentLine = 0;


  if (localStorage.getItem(INTRO_KEY)) {
    startScreen.style.display  = 'none';
    dialogScreen.style.display = 'none';
    prescripWrap.classList.add('no-intro');
    btnWrap.classList.add('no-intro');
    return;
  }


  luckyBtn.disabled = true;

  function showLine(idx) {
    dialogBox.classList.remove('visible');
    setTimeout(function () {
      dialogText.textContent = lines[idx];
      dialogBox.classList.add('visible');
    }, 240);
  }


  startBtn.addEventListener('click', function () {
    startScreen.style.transition    = 'opacity 0.35s ease';
    startScreen.style.opacity       = '0';
    startScreen.style.pointerEvents = 'none';

    setTimeout(function () {
      startScreen.style.display = 'none';
      dialogScreen.classList.add('active');
      dialogText.textContent = lines[0];

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          dialogBox.classList.add('visible');
        });
      });
    }, 350);
  });


  dialogNext.addEventListener('click', function () {
    if (currentLine === SHOW_BOX_AFTER) {
      prescripWrap.classList.add('visible');
    }

    currentLine++;

    if (currentLine < lines.length) {
      showLine(currentLine);
    } else {
      localStorage.setItem(INTRO_KEY, '1');

      dialogBox.classList.remove('visible');
      setTimeout(function () {
        dialogScreen.classList.remove('active');
        btnWrap.classList.add('visible');
        setTimeout(function () {
          luckyBtn.disabled = false;
        }, 520);
      }, 350);
    }

  });
})();


(function initDebug() {
  let pCount = 0;
  let pTimer = null;

  document.addEventListener('keydown', function(e) {
    if (e.key !== '.') return;

    pCount++;
    clearTimeout(pTimer);

    
    pTimer = setTimeout(function() { pCount = 0; }, 2000);

    if (pCount >= 5) {
      pCount = 0;
      showDebugBtn();
    }
  });

  function showDebugBtn() {
    if (document.getElementById('debug-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'debug-btn';
    btn.textContent = 'borrar datos';
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: transparent;
      border: 1px solid #550000;
      color: #883333;
      font-size: 9px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      padding: 8px 20px;
      cursor: pointer;
      font-family: 'Georgia', serif;
      z-index: 9999;
      transition: border-color 0.2s, color 0.2s;
    `;

    btn.addEventListener('mouseenter', function() {
      btn.style.borderColor = '#aa0000';
      btn.style.color = '#cc4444';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.borderColor = '#550000';
      btn.style.color = '#883333';
    });

    btn.addEventListener('click', function() {
      localStorage.clear();
      btn.textContent = 'listo ✓';
      btn.style.color = '#448844';
      btn.style.borderColor = '#226622';
      setTimeout(function() { btn.remove(); }, 1500);
    });

    document.body.appendChild(btn);
  }
})();