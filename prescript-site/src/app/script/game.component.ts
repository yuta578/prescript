import { Component, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.css'],
  encapsulation: ViewEncapsulation.None
})
export class GameComponent implements AfterViewInit, OnDestroy {

  private activeInterval: any = null;

  ngAfterViewInit(): void {

    // ═══════════════════════════════════════════════════════════
    // DATA — CARTAS DEL JUGADOR
    // ═══════════════════════════════════════════════════════════
    const CARD_POOL: any[] = [
      { id:'c1',  type:'fuerza',     text:'La constancia abre caminos.',                     effect:'+3 dmg',            dmg:3,  cost:1 },
      { id:'c2',  type:'constancia', text:'Un paso más. Solo uno.',                           effect:'+2 dmg, +1 moneda', dmg:2,  cost:1, gainCoin:1 },
      { id:'c7',  type:'fuerza',     text:'Mantenerse firme es el camino.',                   effect:'+3 dmg',            dmg:3,  cost:1 },
      { id:'c10', type:'fuerza',     text:'Seguir intentando es ganar.',                      effect:'+2 dmg, roba 1',    dmg:2,  cost:1, draw:1 },
      { id:'c11', type:'duda',       text:'¿Y si no funciona?',                               effect:'−1 HP, +5 clash',   dmg:4,  cost:1, selfDmg:1, clashBonus:3 },
      { id:'c3',  type:'fuerza',     text:'El esfuerzo siempre vale la pena.',                effect:'+5 dmg',            dmg:5,  cost:2 },
      { id:'c4',  type:'fuerza',     text:'No te rindas. Vas bien.',                          effect:'+3 dmg, +2 HP',     dmg:3,  cost:2, heal:2 },
      { id:'c5',  type:'constancia', text:'Cada día cuenta. No pares.',                       effect:'+4 dmg, +1 moneda', dmg:4,  cost:2, gainCoin:1 },
      { id:'c9',  type:'especial',   text:'No es casualidad que estés aquí.',                 effect:'+4 dmg, +3 HP',     dmg:4,  cost:2, heal:3 },
      { id:'c12', type:'constancia', text:'La diferencia está en una sola decisión.',         effect:'+4 dmg, +1 moneda', dmg:4,  cost:2, gainCoin:1 },
      { id:'c6',  type:'especial',   text:'Hay algo escondido entre las palabras.',           effect:'+7 dmg, roba 1',    dmg:7,  cost:3, draw:1 },
      { id:'c8',  type:'constancia', text:'Lo que practicas en silencio te define.',          effect:'+6 dmg',            dmg:6,  cost:3 },
      { id:'c13', type:'fuerza',     text:'El fuego dentro no se apaga.',                     effect:'+8 dmg',            dmg:8,  cost:3 },
      { id:'c14', type:'especial',   text:'Toma el control. Ahora.',                          effect:'+10 dmg, +2 HP',    dmg:10, cost:4, heal:2 },
      { id:'c15', type:'constancia', text:'Mil días de práctica silenciosa.',                 effect:'+9 dmg, roba 2',    dmg:9,  cost:4, draw:2, gainCoin:1 },
      { id:'c16', type:'especial',   text:'El vacío se convierte en claridad.',               effect:'+14 dmg, +5 HP',    dmg:14, cost:5, heal:5, draw:2 },
    ];

    // ═══════════════════════════════════════════════════════════
    // DATA — CARTAS ENEMIGAS
    // ═══════════════════════════════════════════════════════════
    const ENEMY_CARD_POOLS: Record<string, any[]> = {
      'La Pereza': [
        { id:'e1a', name:'Inercia',     text:'el cuerpo pesa más que la voluntad.',          dmg:3, clashPower:2, rounds:2 },
        { id:'e1b', name:'Mañana',      text:'siempre habrá tiempo. siempre.',               dmg:2, clashPower:1, rounds:3 },
        { id:'e1c', name:'Comodidad',   text:'quedarte quieto no es rendirse, ¿verdad?',     dmg:2, clashPower:2, rounds:2 },
        { id:'e1d', name:'Distracción', text:'hay cosas más importantes ahora mismo.',       dmg:3, clashPower:3, rounds:1 },
      ],
      'La Duda': [
        { id:'e2a', name:'Fracaso',      text:'ya has fallado antes. ¿para qué?',            dmg:5, clashPower:4, rounds:2 },
        { id:'e2b', name:'Comparación',  text:'hay alguien mejor que tú. siempre.',          dmg:4, clashPower:3, rounds:2 },
        { id:'e2c', name:'Juicio',       text:'todos lo verán. todos sabrán.',               dmg:3, clashPower:2, rounds:3 },
        { id:'e2d', name:'Inadecuación', text:'nunca serás suficiente.',                     dmg:6, clashPower:5, rounds:1 },
        { id:'e2e', name:'Parálisis',    text:'mejor no intentarlo que fallar.',             dmg:4, clashPower:4, rounds:2 },
      ],
      'El Agotamiento': [
        { id:'e3a', name:'Desgaste',   text:'ya no puedes. el cuerpo lo sabe.',              dmg:7, clashPower:5, rounds:2 },
        { id:'e3b', name:'Vacío',      text:'nada que dar. nada que quedar.',                dmg:6, clashPower:4, rounds:3 },
        { id:'e3c', name:'Rendición',  text:'detente. ya es suficiente esfuerzo.',           dmg:8, clashPower:6, rounds:1 },
        { id:'e3d', name:'Colapso',    text:'todo a la vez. ya no hay forma de continuar.',  dmg:9, clashPower:7, rounds:1 },
        { id:'e3e', name:'Silencio',   text:'el ruido se acabó. ya no hay más.',             dmg:7, clashPower:5, rounds:2 },
      ],
    };

    // ═══════════════════════════════════════════════════════════
    // DATA — PRESCRIPS
    // ═══════════════════════════════════════════════════════════
    const PRESCRIPS: any[] = [
      { text:'La constancia recompensa, pero el tiempo apremia.',    bonus:'Cartas cuestan -1.',          curse:'Presión baja 30% más rápido.',   bonusFn:(s:any)=>{ s.costReduction+=1; },     curseFn:(s:any)=>{ s.pressureSpeedMult+=0.9; } },
      { text:'El esfuerzo duplica, pero el cuerpo paga.',            bonus:'+2 dmg en todas las cartas.', curse:'−3 HP al inicio de cada turno.', bonusFn:(s:any)=>{ s.dmgBonus+=2; },           curseFn:(s:any)=>{ s.hpCostPerTurn+=3; } },
      { text:'La claridad llega, pero el silencio duele.',           bonus:'Robas 5 cartas por turno.',   curse:'Solo 1 moneda por turno.',        bonusFn:(s:any)=>{ s.drawPerTurn+=1; },        curseFn:(s:any)=>{ s.coinsPerTurn=Math.max(1,s.coinsPerTurn-1); } },
      { text:'La duda te hace fuerte, pero te hace lento.',          bonus:'+4 dmg en cartas de duda.',   curse:'Fuerza cuesta +1 extra.',         bonusFn:(s:any)=>{ s.dudaDmgBonus+=4; },       curseFn:(s:any)=>{ s.fuerzaCostExtra+=1; } },
      { text:'El riesgo multiplica, pero el error cuesta.',          bonus:'+2 bonus de clash global.',   curse:'Si no juegas carta, −5 HP.',      bonusFn:(s:any)=>{ s.clashBonusGlobal+=2; },  curseFn:(s:any)=>{ s.endTurnPenalty+=5; } },
      { text:'La velocidad es tuya, pero la guardia cae.',           bonus:'Presión baja 20% más lento.', curse:'Enemigo hace +2 dmg.',            bonusFn:(s:any)=>{ s.pressureSpeedMult-=0.2; },curseFn:(s:any)=>{ s.enemyDmgBonus+=2; } },
    ];

    // ═══════════════════════════════════════════════════════════
    // DATA — ENEMIGOS
    // ═══════════════════════════════════════════════════════════
    const ENEMIES: any[] = [
      { name:'La Pereza',      hp:12, phrases:['¿para qué esforzarte?','mañana lo haces.','no vale la pena.'],  dmgPerTick:3, tickMs:2500, cardsPerTurn:2 },
      { name:'La Duda',        hp:20, phrases:['no eres suficiente.','siempre fallas.','¿quién te crees?'],      dmgPerTick:4, tickMs:2000, cardsPerTurn:3 },
      { name:'El Agotamiento', hp:28, phrases:['ya no puedes más.','detente.','ya es suficiente.'],              dmgPerTick:5, tickMs:1700, cardsPerTurn:3 },
    ];

    // ═══════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════
    let state: any = {};

    const initState = () => {
      state = {
        round: 1,
        hp: 20,
        coins: 3,
        maxCoins: 5,
        deck: shuffle([...CARD_POOL.slice(0,8)]),
        discard: [],
        hand: [],
        enemy: { ...ENEMIES[0], currentHp: ENEMIES[0].hp },
        enemyCards: [],
        // assignments: playerCardId -> enemyCardId
        assignments: {} as Record<string,string>,
        selectedPlayerCard: null as any,
        pressure: 100,
        pressureInterval: null,
        gameOver: false,
        isResolving: false,
        cardsPlayedThisTurnCount: 0,
        prescrip: null,
        costReduction: 0,
        dmgBonus: 0,
        drawPerTurn: 4,
        coinsPerTurn: 3,
        pressureSpeedMult: 1,
        dudaDmgBonus: 0,
        fuerzaCostExtra: 0,
        coinPerCard: 0,
        endTurnPenalty: 0,
        enemyDmgBonus: 0,
        hpCostPerTurn: 0,
        clashBonusGlobal: 0,
      };
    };

    function shuffle(arr: any[]) {
      for (let i = arr.length-1; i>0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]] = [arr[j],arr[i]];
      }
      return arr;
    }

    // ═══════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════
    function getRealCost(card: any): number {
      let c = card.cost - state.costReduction;
      if (card.type === 'fuerza') c += state.fuerzaCostExtra;
      return Math.max(0, c);
    }

    function getPlayerClashPower(card: any): number {
      let p = card.dmg + state.dmgBonus + state.clashBonusGlobal;
      if (card.type === 'duda') p += state.dudaDmgBonus + (card.clashBonus || 0);
      return Math.max(1, p);
    }

    // Coste total de todas las asignaciones pendientes
    function totalAssignedCost(): number {
      return Object.keys(state.assignments).reduce((sum: number, pid: string) => {
        const card = state.hand.find((c: any) => c.id === pid);
        return sum + (card ? getRealCost(card) : 0);
      }, 0);
    }

    // Monedas que quedarían libres si descartamos la selección actual
    function coinsAvailable(): number {
      return state.coins - totalAssignedCost();
    }

    // ═══════════════════════════════════════════════════════════
    // MONEDAS VISUALES
    // ═══════════════════════════════════════════════════════════
    function renderCoins(mode?: 'normal' | 'spend' | 'gain') {
      const container = document.getElementById('coins-visual')!;
      container.innerHTML = '';
      const committed = totalAssignedCost(); // monedas ya comprometidas

      for (let i = 0; i < state.maxCoins; i++) {
        const coin = document.createElement('div');
        const isActive    = i < state.coins;
        const isCommitted = isActive && i < committed; // comprometida por asignación
        const isFree      = isActive && !isCommitted;  // disponible

        if (isCommitted) {
          coin.className = 'coin active committed';
        } else {
          coin.className = 'coin' + (isActive ? ' active' : '');
        }
        coin.textContent = '◈';

        if (mode === 'spend' && i >= state.coins) coin.classList.add('spent');
        if (mode === 'gain'  && isFree)           coin.classList.add('gain');

        container.appendChild(coin);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // RENDER ENEMY CARDS
    // ═══════════════════════════════════════════════════════════
    function renderEnemyCards() {
      const row = document.getElementById('enemy-cards-row')!;
      row.innerHTML = '';
      state.enemyCards.forEach((ec: any) => {
        const el = document.createElement('div');
        el.className = 'enemy-card';
        el.id = 'ecard-' + ec.id;
        if (Object.values(state.assignments).includes(ec.id)) el.classList.add('targeted');

        el.innerHTML = `
          <div class="enemy-card-name">${ec.name}</div>
          <div class="enemy-card-text">${ec.text}</div>
          <div class="enemy-card-stats">
            <span class="enemy-card-dmg">⚔ ${ec.dmg}</span>
            <span class="enemy-card-power">◈ ${ec.clashPower}</span>
          </div>`;

        el.addEventListener('click', () => {
          if (!state.selectedPlayerCard || state.isResolving) return;
          assignClash(state.selectedPlayerCard, ec);
        });

        row.appendChild(el);
      });
    }

    // ═══════════════════════════════════════════════════════════
    // RENDER HAND
    // ═══════════════════════════════════════════════════════════
    function renderHand() {
      const hand = document.getElementById('hand')!;
      hand.innerHTML = '';
      const free = coinsAvailable();

      state.hand.forEach((card: any) => {
        const realCost  = getRealCost(card);
        const isAssigned = !!state.assignments[card.id];
        const isSelected = state.selectedPlayerCard?.id === card.id;
        const canAfford  = realCost <= state.coins;
        // Bloqueada si no puede pagarse aunque hubiera monedas libres
        const isLocked   = !isAssigned && !isSelected && realCost > free && !state.selectedPlayerCard;
        // Bloqueada porque hay selección activa y no es la seleccionada
        const isGrayed   = !!state.selectedPlayerCard && !isSelected && !isAssigned;

        const el = document.createElement('div');
        let cls = 'card';
        if (!canAfford)            cls += ' cant-afford';
        else if (isLocked)         cls += ' coins-locked';
        else if (isGrayed)         cls += ' coins-locked'; // bloquear otras mientras hay selección
        if (isAssigned)            cls += ' assigned';
        if (isSelected)            cls += ' selected-for-clash';
        el.className = cls;
        el.id = 'pcard-' + card.id;

        let pipsHtml = '';
        for (let p = 0; p < Math.min(5, realCost); p++) {
          pipsHtml += `<span class="cost-pip${!canAfford ? ' unaffordable':''}"></span>`;
        }
        if (realCost > 5) pipsHtml = `<span style="font-size:8px;color:#a08050">◈${realCost}</span>`;
        if (realCost === 0) pipsHtml = `<span style="font-size:8px;color:#5a8a5a">gratis</span>`;

        el.innerHTML = `
          <div class="card-type ${card.type}">${card.type}</div>
          <div class="card-text">${card.text}</div>
          <div class="card-effect">${card.effect}</div>
          <div class="card-cost">${pipsHtml}</div>`;

        if (!state.isResolving && canAfford) {
          el.addEventListener('pointerdown', (e) => onCardDragStart(e, card, realCost, el));
        }

        hand.appendChild(el);
      });
    }

    // ═══════════════════════════════════════════════════════════
    // RENDER COMPLETO
    // ═══════════════════════════════════════════════════════════
    const render = (coinMode?: 'normal'|'spend'|'gain') => {
      document.getElementById('stat-hp')!.textContent   = state.hp;
      document.getElementById('stat-deck')!.textContent = state.deck.length;
      const prescripEl = document.getElementById('stat-prescrip')!;
      const sepEl      = document.getElementById('prescrip-sep')!;
      if (state.prescrip) {
        prescripEl.textContent = `"${state.prescrip.text.slice(0,36)}..."`;
        sepEl.style.display = '';
      } else {
        prescripEl.textContent = '';
        sepEl.style.display = 'none';
      }
      document.getElementById('round-label')!.textContent = `ronda ${state.round}`;
      const enemyPct = Math.max(0, (state.enemy.currentHp / state.enemy.hp) * 100);
      document.getElementById('enemy-hp-fill')!.style.width = enemyPct + '%';
      document.getElementById('enemy-name')!.textContent   = state.enemy.name.toLowerCase();

      renderCoins(coinMode || 'normal');
      renderEnemyCards();
      renderHand();
      updateConfirmBtn();
      updateEndTurnBtn();
      drawArrows();
    };

    function updateEndTurnBtn() {
      const btn = document.getElementById('btn-end');
      if (!btn) return;
      const noAction = state.cardsPlayedThisTurnCount === 0 && Object.keys(state.assignments).length === 0;
      if (noAction) {
        const dmg = state.enemy.dmgPerTick + state.enemyDmgBonus + (state.endTurnPenalty||0);
        btn.textContent = `terminar turno (−${dmg} HP)`;
        btn.style.color = '#8a3a3a';
        btn.style.borderColor = '#5a2a2a';
      } else {
        btn.textContent = 'terminar turno';
        btn.style.color = '';
        btn.style.borderColor = '';
      }
    }

    function updateConfirmBtn() {
      const btn = document.getElementById('btn-confirm')!;
      btn.style.display = Object.keys(state.assignments).length > 0 ? '' : 'none';
    }

    // ═══════════════════════════════════════════════════════════
    // DRAG PARA ASIGNAR CHOQUE
    // ─ pointerdown en carta → aparece flecha al cursor
    // ─ soltar sobre carta enemiga → se fija la asignación
    // ─ soltar en otro lado  → cancela / des-asigna si ya tenía
    // ═══════════════════════════════════════════════════════════
    let dragState: any = null; // { card, realCost, previewPath }

    function onCardDragStart(e: PointerEvent, card: any, realCost: number, _el: HTMLElement) {
      if (state.isResolving) return;
      e.preventDefault();
      e.stopPropagation();

      // Si ya estaba asignada, des-asignar
      if (state.assignments[card.id]) {
        delete state.assignments[card.id];
        render('normal');
        return;
      }

      // Verificar monedas libres
      if (realCost > coinsAvailable()) return;

      const svg = document.getElementById('arrows-svg')!;

      // Crear path SVG de preview
      const previewPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      previewPath.setAttribute('class', 'arrow-line');
      previewPath.style.opacity = '0.7';
      svg.appendChild(previewPath);

      dragState = { card, previewPath };

      // Marcar la carta visualmente SIN llamar render (evita que el DOM se rehaga)
      const liveEl = () => document.getElementById('pcard-' + card.id);
      liveEl()?.classList.add('selected-for-clash');

      function onMove(me: PointerEvent) {
        // Leer posición del elemento VIVO en el DOM
        const cardEl = liveEl();
        if (!cardEl) return;
        const r    = cardEl.getBoundingClientRect();
        const x1   = r.left + r.width / 2;
        const y1   = r.top;
        const x2   = me.clientX;
        const y2   = me.clientY;
        const midy = (y1 + y2) / 2;
        previewPath.setAttribute('d', `M${x1} ${y1} C${x1} ${midy},${x2} ${midy},${x2} ${y2}`);

        // Highlight carta enemiga bajo el cursor
        document.querySelectorAll('.enemy-card').forEach(ec => ec.classList.remove('drag-hover'));
        const hit = getEnemyCardAt(me.clientX, me.clientY);
        if (hit) hit.classList.add('drag-hover');
      }

      function onUp(ue: PointerEvent) {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup',   onUp);

        // Quitar flecha de preview
        if (svg.contains(previewPath)) svg.removeChild(previewPath);

        // Quitar highlights
        document.querySelectorAll('.enemy-card').forEach(ec => {
          ec.classList.remove('drag-hover');
          ec.classList.remove('targeted');
        });
        liveEl()?.classList.remove('selected-for-clash');
        dragState = null;

        // ¿Soltó sobre una carta enemiga?
        const hit = getEnemyCardAt(ue.clientX, ue.clientY);
        if (hit) {
          const enemyId   = hit.id.replace('ecard-', '');
          const enemyCard = state.enemyCards.find((c: any) => c.id === enemyId);
          if (enemyCard) state.assignments[card.id] = enemyCard.id;
        }

        render('normal');
      }

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup',   onUp);
    }

    function getEnemyCardAt(x: number, y: number): HTMLElement | null {
      const els = document.elementsFromPoint(x, y);
      for (const el of els) {
        if ((el as HTMLElement).classList?.contains('enemy-card')) return el as HTMLElement;
        if ((el as HTMLElement).closest?.('.enemy-card')) return (el as HTMLElement).closest('.enemy-card') as HTMLElement;
      }
      return null;
    }

    // Mantener assignClash como helper interno (usado al soltar)
    function assignClash(playerCard: any, enemyCard: any) {
      state.assignments[playerCard.id] = enemyCard.id;
      render('normal');
    }

    // ═══════════════════════════════════════════════════════════
    // FLECHAS SVG
    // ═══════════════════════════════════════════════════════════
    function drawArrows() {
      const svg = document.getElementById('arrows-svg')!;
      svg.querySelectorAll('path').forEach(n => n.remove());

      Object.entries(state.assignments).forEach(([pid, eid]) => {
        const pEl = document.getElementById('pcard-' + pid);
        const eEl = document.getElementById('ecard-' + eid);
        if (!pEl || !eEl) return;

        const pR = pEl.getBoundingClientRect();
        const eR = eEl.getBoundingClientRect();

        const x1 = pR.left + pR.width / 2;
        const y1 = pR.top;
        const x2 = eR.left + eR.width / 2;
        const y2 = eR.bottom;

        const midy = (y1 + y2) / 2;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M${x1} ${y1} C${x1} ${midy},${x2} ${midy},${x2} ${y2}`);
        path.setAttribute('class', 'arrow-line');
        svg.appendChild(path);
      });
    }

    // ═══════════════════════════════════════════════════════════
    // ANIMACIÓN — carta del jugador vuela al centro
    // ═══════════════════════════════════════════════════════════
    function flyCardToCenter(cardEl: HTMLElement): Promise<void> {
      return new Promise(resolve => {
        const rect   = cardEl.getBoundingClientRect();
        const vw     = window.innerWidth;
        const vh     = window.innerHeight;
        const destX  = vw / 2 - 68;   // centrado (mitad ancho carta ~136px)
        const destY  = vh / 2 - 70;   // centrado (mitad alto carta ~140px)

        // Clonar la carta para la animación sin sacarla del DOM
        const clone = cardEl.cloneNode(true) as HTMLElement;
        clone.style.cssText = `
          position: fixed;
          left: ${rect.left}px;
          top:  ${rect.top}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          z-index: 45;
          pointer-events: none;
          transition: left 0.38s cubic-bezier(.4,0,.2,1),
                      top  0.38s cubic-bezier(.4,0,.2,1),
                      transform 0.38s cubic-bezier(.4,0,.2,1);
          margin: 0;
          transform: scale(1);
        `;
        document.body.appendChild(clone);

        // Ocultar el original mientras vuela el clon
        cardEl.style.opacity = '0';

        // Forzar reflow y arrancar vuelo
        void clone.offsetWidth;
        clone.style.left      = destX + 'px';
        clone.style.top       = destY + 'px';
        clone.style.transform = 'scale(1.15)';

        setTimeout(() => {
          document.body.removeChild(clone);
          resolve();
        }, 420);
      });
    }

    // Carta enemiga vuela al centro desde su posición
    function flyEnemyCardToCenter(cardEl: HTMLElement): Promise<void> {
      return new Promise(resolve => {
        const rect  = cardEl.getBoundingClientRect();
        const vw    = window.innerWidth;
        const vh    = window.innerHeight;
        const destX = vw / 2 + 44;   // lado derecho del centro
        const destY = vh / 2 - 70;

        const clone = cardEl.cloneNode(true) as HTMLElement;
        clone.style.cssText = `
          position: fixed;
          left: ${rect.left}px;
          top:  ${rect.top}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          z-index: 45;
          pointer-events: none;
          transition: left 0.38s cubic-bezier(.4,0,.2,1),
                      top  0.38s cubic-bezier(.4,0,.2,1),
                      transform 0.38s cubic-bezier(.4,0,.2,1);
          margin: 0;
          transform: scale(1);
          background: #0b0606;
          border: 1px solid #4a2a2a;
        `;
        document.body.appendChild(clone);
        cardEl.style.opacity = '0.2';

        void clone.offsetWidth;
        clone.style.left      = destX + 'px';
        clone.style.top       = destY + 'px';
        clone.style.transform = 'scale(1.12)';

        setTimeout(() => {
          document.body.removeChild(clone);
          resolve();
        }, 420);
      });
    }

    // ═══════════════════════════════════════════════════════════
    // ARENA DE CLASH (overlay con cartas fantasma)
    // ═══════════════════════════════════════════════════════════
    function showClashArena(playerCard: any, enemyCard: any) {
      const arena = document.getElementById('clash-arena')!;
      const pGhost = document.getElementById('clash-player-ghost')!;
      const eGhost = document.getElementById('clash-enemy-ghost')!;
      const score  = document.getElementById('clash-score')!;

      const pPow = getPlayerClashPower(playerCard);
      const ePow = enemyCard.clashPower;

      pGhost.innerHTML = `
        <div class="clash-ghost-type">${playerCard.type}</div>
        <div class="clash-ghost-text">${playerCard.text}</div>
        <div class="clash-ghost-power" id="cghost-player-pow">${pPow}</div>`;

      eGhost.innerHTML = `
        <div class="clash-ghost-type">${enemyCard.name}</div>
        <div class="clash-ghost-text">${enemyCard.text}</div>
        <div class="clash-ghost-power" id="cghost-enemy-pow">${ePow}</div>`;

      score.textContent = '×0';
      score.className   = '';
      arena.classList.add('active');
    }

    function hideClashArena() {
      document.getElementById('clash-arena')!.classList.remove('active');
    }

    // ═══════════════════════════════════════════════════════════
    // RESOLVER UN CHOQUE (con animación arena)
    // ═══════════════════════════════════════════════════════════
    function resolveOneClash(playerCard: any, enemyCard: any): Promise<void> {
      return new Promise(async resolve => {
        const playerPower = getPlayerClashPower(playerCard);
        const enemyPower  = enemyCard.clashPower;
        const maxRounds   = enemyCard.rounds;
        const playerWins  = playerPower >= enemyPower;

        // Limpiar flechas y ocultar mano visualmente
        document.getElementById('arrows-svg')!.querySelectorAll('path').forEach(n => n.remove());

        // Volar las dos cartas al centro ANTES de mostrar la arena
        const pEl = document.getElementById('pcard-' + playerCard.id);
        const eEl = document.getElementById('ecard-' + enemyCard.id);

        const flyPromises: Promise<void>[] = [];
        if (pEl) flyPromises.push(flyCardToCenter(pEl));
        if (eEl) flyPromises.push(flyEnemyCardToCenter(eEl));
        await Promise.all(flyPromises);

        // Mostrar arena
        showClashArena(playerCard, enemyCard);

        // Restaurar opacidad de las cartas originales
        if (pEl) pEl.style.opacity = '';
        if (eEl) eEl.style.opacity = '';

        const scoreEl   = document.getElementById('clash-score')!;
        const pPowEl    = document.getElementById('cghost-player-pow');
        const ePowEl    = document.getElementById('cghost-enemy-pow');
        const pGhost    = document.getElementById('clash-player-ghost')!;
        const eGhost    = document.getElementById('clash-enemy-ghost')!;

        // Actualizar estilos de poder
        if (pPowEl) pPowEl.className = 'clash-ghost-power ' + (playerWins ? 'winning' : 'losing');
        if (ePowEl) ePowEl.className = 'clash-ghost-power ' + (playerWins ? 'losing' : 'winning');

        let roundsDone = 0;
        const doRound = () => {
          roundsDone++;
          scoreEl.textContent = `×${roundsDone}`;
          scoreEl.classList.remove('bump');
          void (scoreEl as any).offsetWidth;
          scoreEl.classList.add('bump');

          pGhost.classList.remove('shaking');
          eGhost.classList.remove('shaking');
          void (pGhost as any).offsetWidth;
          pGhost.classList.add('shaking');
          eGhost.classList.add('shaking');

          flashScreen(playerWins ? 'flash-clash' : 'flash-red');

          if (roundsDone >= maxRounds) {
            setTimeout(() => {
              hideClashArena();
              applyClashResult(playerCard, enemyCard, playerPower, enemyPower, playerWins);
              setTimeout(resolve, 120);
            }, 380);
          } else {
            setTimeout(doRound, 400);
          }
        };

        // Pequeña pausa antes de arrancar las rondas
        setTimeout(doRound, 180);
      });
    }

    // ═══════════════════════════════════════════════════════════
    // APLICAR RESULTADO DEL CHOQUE
    // ═══════════════════════════════════════════════════════════
    function applyClashResult(playerCard: any, enemyCard: any, playerPower: number, enemyPower: number, playerWins: boolean) {
      if (playerWins) {
        let dmg = playerCard.dmg + state.dmgBonus;
        if (playerCard.type === 'duda') dmg += state.dudaDmgBonus;
        dmg += Math.floor(Math.max(0, playerPower - enemyPower) / 2);
        state.enemy.currentHp -= dmg;

        if (playerCard.gainCoin) state.coins = Math.min(state.maxCoins, state.coins + playerCard.gainCoin);
        if (playerCard.heal)     state.hp = Math.min(20, state.hp + playerCard.heal);
        if (playerCard.selfDmg)  state.hp -= playerCard.selfDmg;
        if (playerCard.draw)     drawCards(playerCard.draw);

        // Destruir carta enemiga
        const eEl = document.getElementById('ecard-' + enemyCard.id);
        if (eEl) eEl.classList.add('destroyed');
        state.enemyCards = state.enemyCards.filter((c: any) => c.id !== enemyCard.id);

        flashScreen('flash-green');

        if (state.enemy.currentHp <= 0) {
          state.enemy.currentHp = 0;
          render();
          setTimeout(() => endRound(), 650);
          state.gameOver = true;
        }
      } else {
        const dmg = enemyCard.dmg + state.enemyDmgBonus;
        state.hp -= dmg;
        flashScreen('flash-red');
        showEnemyPhrase(state.enemy.phrases[Math.floor(Math.random()*state.enemy.phrases.length)]);
        if (state.hp <= 0) { state.hp = 0; render(); endGame(false); state.gameOver = true; }
        else render();
      }
    }

    // ═══════════════════════════════════════════════════════════
    // RESOLVER TODOS LOS CHOQUES (al confirmar)
    // ═══════════════════════════════════════════════════════════
    async function resolveAllClashes() {
      if (state.isResolving) return;
      state.isResolving = true;
      stopPressure();
      state.selectedPlayerCard = null;

      const pairs = Object.entries(state.assignments) as [string, string][];
      if (pairs.length === 0) { state.isResolving = false; return; }

      // Cobrar monedas de una vez
      const total = pairs.reduce((sum, [pid]) => {
        const card = state.hand.find((c: any) => c.id === pid);
        return sum + (card ? getRealCost(card) : 0);
      }, 0);

      if (total > state.coins) {
        state.isResolving = false;
        return;
      }

      state.coins -= total;
      renderCoins('spend');

      // Resolver de a uno
      for (const [pid, eid] of pairs) {
        if (state.gameOver) break;
        const playerCard = state.hand.find((c: any) => c.id === pid);
        const enemyCard  = state.enemyCards.find((c: any) => c.id === eid);
        if (!playerCard || !enemyCard) continue;

        await resolveOneClash(playerCard, enemyCard);

        state.hand = state.hand.filter((c: any) => c.id !== pid);
        state.discard.push(playerCard);
        state.cardsPlayedThisTurnCount++;
        if (state.coinPerCard) state.coins = Math.min(state.maxCoins, state.coins + state.coinPerCard);
      }

      state.assignments = {};
      state.isResolving = false;

      if (!state.gameOver) {
        render();
        resetPressure();
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PRESIÓN
    // ═══════════════════════════════════════════════════════════
    const startPressure = () => {
      stopPressure();
      const enemy = state.enemy;
      const step  = (enemy.dmgPerTick / enemy.tickMs) * 50;

      state.pressureInterval = setInterval(() => {
        if (state.gameOver) { stopPressure(); return; }
        state.pressure -= step * Math.min(4.0, state.pressureSpeedMult);

        if (state.pressure <= 0) {
          stopPressure();
          state.pressure = 0;
          updatePressureBar();
          enemyAttack();
        } else {
          updatePressureBar();
        }
      }, 50);
      this.activeInterval = state.pressureInterval;
    };

    const stopPressure = () => {
      if (state.pressureInterval) { clearInterval(state.pressureInterval); state.pressureInterval = null; }
    };

    function updatePressureBar() {
      const fill = document.getElementById('pressure-fill-v')!;
      fill.style.height = state.pressure + '%';
      fill.style.background = state.pressure < 25 ? '#aa3333' : state.pressure < 50 ? '#886633' : '#8a3a3a';
      document.getElementById('pressure-pct')!.textContent = Math.ceil(state.pressure) + '%';
    }

    function resetPressure() {
      state.pressure = 100;
      updatePressureBar();
      startPressure();
    }

    // ═══════════════════════════════════════════════════════════
    // ATAQUE POR PRESIÓN
    // ═══════════════════════════════════════════════════════════
    function enemyAttack() {
      if (state.isResolving) return;
      const dmg = state.enemy.dmgPerTick + state.enemyDmgBonus;
      state.hp -= dmg;
      showEnemyPhrase(state.enemy.phrases[Math.floor(Math.random()*state.enemy.phrases.length)]);
      flashScreen('flash-red');
      render();
      if (state.hp <= 0) { state.hp = 0; render(); endGame(false); return; }
      resetPressure();
    }

    function showEnemyPhrase(text: string) {
      const el = document.getElementById('enemy-phrase')!;
      el.style.opacity = '0';
      setTimeout(() => { el.textContent = text; el.style.opacity = '1'; }, 200);
    }

    // ═══════════════════════════════════════════════════════════
    // DRAW
    // ═══════════════════════════════════════════════════════════
    function drawCards(n: number) {
      for (let i = 0; i < n; i++) {
        if (state.deck.length === 0) {
          if (state.discard.length === 0) return;
          state.deck = shuffle([...state.discard]);
          state.discard = [];
        }
        state.hand.push(state.deck.pop());
      }
    }

    // ═══════════════════════════════════════════════════════════
    // TURNO
    // ═══════════════════════════════════════════════════════════
    function pickEnemyCards(): any[] {
      const pool    = ENEMY_CARD_POOLS[state.enemy.name] || ENEMY_CARD_POOLS['La Pereza'];
      const count   = state.enemy.cardsPerTurn || 2;
      return shuffle([...pool]).slice(0, Math.min(count, pool.length)).map((c: any) => ({ ...c }));
    }

    const startTurn = () => {
      stopPressure();
      state.cardsPlayedThisTurnCount = 0;
      state.coins = Math.min(state.maxCoins, state.coinsPerTurn);
      state.assignments = {};
      state.selectedPlayerCard = null;
      state.isResolving = false;
      drawCards(state.drawPerTurn);
      state.enemyCards = pickEnemyCards();
      render();
      showEnemyPhrase(state.enemy.phrases[Math.floor(Math.random()*state.enemy.phrases.length)]);
      resetPressure();
    };

    function endTurn() {
      if (state.isResolving) return;

      if (state.hpCostPerTurn > 0) {
        state.hp -= state.hpCostPerTurn;
        flashScreen('flash-red');
        if (state.hp <= 0) { state.hp = 0; render(); endGame(false); return; }
      }

      if (state.cardsPlayedThisTurnCount === 0) {
        const dmg = state.enemy.dmgPerTick + state.enemyDmgBonus + (state.endTurnPenalty||0);
        state.hp -= dmg;
        flashScreen('flash-red');
        showEnemyPhrase(state.enemy.phrases[Math.floor(Math.random()*state.enemy.phrases.length)]);
        if (state.hp <= 0) { state.hp = 0; render(); endGame(false); return; }
      }

      stopPressure();
      state.discard.push(...state.hand);
      state.hand = [];
      state.enemyCards = [];
      state.assignments = {};
      state.selectedPlayerCard = null;
      startTurn();
    }

    // ═══════════════════════════════════════════════════════════
    // FIN DE RONDA
    // ═══════════════════════════════════════════════════════════
    function endRound() {
      stopPressure();
      state.gameOver = true;
      document.getElementById('flor-comment')!.style.opacity = '0';
      setAudioMuffled(true);
      showPrescripChoice();
      document.getElementById('overlay')!.classList.add('visible');
    }

    const FLOR_COMMENTS = [
      "elige con cuidado.", "no hay vuelta atrás.", "ambas tienen su precio.",
      "tú decides.", "Extiende lo inevitable.", "El final sera igual.",
      "un intento más hacia el mismo vacío.", "ellos disfrutan verte dudar.",
      "te desvaneces mientras lo piensas.", "CAOS!!!", "ya estabas condenado antes de empezar.",
      "nadie vendrá a salvarte de ti mismo.", "el silencio es el ruido más fuerte aquí."
    ];

    const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$#@!░▒▓";

    function scrambleText(el: HTMLElement, finalText: string, duration: number, onDone?: () => void) {
      el.textContent = '';
      const spans = finalText.split('').map(ch => {
        const s = document.createElement('span');
        s.textContent = ch === ' ' ? ' ' : SCRAMBLE_CHARS[Math.floor(Math.random()*SCRAMBLE_CHARS.length)];
        el.appendChild(s); return s;
      });
      const total = finalText.length; let done = 0;
      finalText.split('').forEach((ch, i) => {
        if (ch === ' ') { done++; return; }
        setTimeout(() => { spans[i].textContent = ch; done++; if (done>=total && onDone) onDone(); },
          (i/total)*duration*0.65 + Math.random()*150 + duration*0.3);
      });
      const iv = setInterval(() => {
        spans.forEach((s,i) => { if (finalText[i]!==' ' && s.textContent!==finalText[i]) s.textContent=SCRAMBLE_CHARS[Math.floor(Math.random()*SCRAMBLE_CHARS.length)]; });
      }, 50);
      setTimeout(() => clearInterval(iv), duration+400);
    }

    function buildPrescripTags(container: HTMLElement, p: any) {
      container.innerHTML = '';
      const bon = document.createElement('div');
      bon.style.cssText = 'font-size:9px;letter-spacing:0.15em;color:#5a8a5a;font-family:Share Tech Mono,monospace;';
      bon.textContent = '✦ ' + p.bonus;
      const cur = document.createElement('div');
      cur.style.cssText = 'font-size:9px;letter-spacing:0.15em;color:#8a3a3a;font-family:Share Tech Mono,monospace;';
      cur.textContent = '✖ ' + p.curse;
      container.appendChild(bon); container.appendChild(cur);
    }

    function showPrescripChoice() {
      const pool = shuffle([...PRESCRIPS]).slice(0,2);
      const [pTop, pBot] = pool;
      const topEl = document.getElementById('prescrip-top-text')!;
      const botEl = document.getElementById('prescrip-bot-text')!;
      const topBox = document.getElementById('prescrip-top')!;
      const botBox = document.getElementById('prescrip-bot')!;
      topEl.textContent = ''; botEl.textContent = '';
      buildPrescripTags(document.getElementById('prescrip-top-tags')!, pTop);
      buildPrescripTags(document.getElementById('prescrip-bot-tags')!, pBot);
      scrambleText(topEl, '"'+pTop.text+'"', 900, () => setTimeout(() => scrambleText(botEl, '"'+pBot.text+'"', 900), 200));
      const commentEl = document.getElementById('flor-comment')!;
      commentEl.style.transition='none'; commentEl.style.opacity='0';
      commentEl.textContent = FLOR_COMMENTS[Math.floor(Math.random()*FLOR_COMMENTS.length)];
      setTimeout(() => { commentEl.style.transition='opacity 0.5s ease'; commentEl.style.opacity='1'; setTimeout(()=>{commentEl.style.opacity='0';},3000); }, 400);
      let canChoose = false;
      [topBox,botBox].forEach(b=>{ b.style.cursor='default'; b.style.opacity='0.5'; b.style.transition='opacity 0.3s ease'; });
      setTimeout(()=>{ canChoose=true; [topBox,botBox].forEach(b=>{b.style.cursor='pointer';b.style.opacity='1';}); }, 2000);
      function onChoose(p:any) { if(!canChoose) return; state.prescrip=p; p.bonusFn(state); p.curseFn(state); nextRound(); }
      topBox.onclick = ()=>onChoose(pTop); botBox.onclick = ()=>onChoose(pBot);
      [topBox,botBox].forEach(box=>{
        box.addEventListener('mouseenter',()=>{ if(canChoose) box.style.borderColor='#3a3a3a'; });
        box.addEventListener('mouseleave',()=>{ box.style.borderColor='#1e1e1e'; });
      });
      document.getElementById('btn-next-round')!.style.display = 'none';
    }

    function nextRound() {
      stopPressure();
      document.getElementById('overlay')!.classList.remove('visible');
      document.getElementById('btn-next-round')!.style.display = '';
      document.getElementById('flor-comment')!.style.opacity = '0';
      document.getElementById('prescrip-top')!.style.borderColor = '#1e1e1e';
      document.getElementById('prescrip-bot')!.style.borderColor = '#1e1e1e';
      setAudioMuffled(false);
      state.round++;
      const idx = Math.min(state.round-1, ENEMIES.length-1);
      state.enemy = { ...ENEMIES[idx], currentHp: ENEMIES[idx].hp };
      state.gameOver = false;
      state.cardsPlayedThisTurnCount = 0;
      state.enemyCards = [];
      state.assignments = {};
      state.deck = shuffle([...state.deck, ...state.discard, ...state.hand]);
      state.discard = []; state.hand = [];
      startTurn();
    }

    // ═══════════════════════════════════════════════════════════
    // GAME OVER
    // ═══════════════════════════════════════════════════════════
    function endGame(win: boolean) {
      stopPressure(); state.gameOver = true;
      document.getElementById('prescrip-top-text')!.textContent = win ? 'lo lograste.' : 'el estado mental te venció.';
      document.getElementById('prescrip-top-tags')!.innerHTML  = '';
      document.getElementById('prescrip-bot-text')!.textContent = win ? '' : 'pero puedes volver a intentarlo.';
      document.getElementById('prescrip-bot-tags')!.innerHTML  = '';
      document.getElementById('flor-comment')!.textContent     = win ? 'victoria.' : 'caíste.';
      document.getElementById('flor-comment')!.style.opacity   = '1';
      document.getElementById('btn-next-round')!.textContent   = 'volver a intentar';
      document.getElementById('btn-next-round')!.style.display = '';
      document.getElementById('prescrip-top')!.onclick = null;
      document.getElementById('prescrip-bot')!.onclick = null;
      document.getElementById('overlay')!.classList.add('visible');
    }

    // ═══════════════════════════════════════════════════════════
    // UTILS

    function flashScreen(cls: string) {
      document.body.classList.remove('flash-green','flash-red','flash-clash');
      void (document.body as any).offsetWidth;
      document.body.classList.add(cls);
      setTimeout(() => document.body.classList.remove(cls), 500);
    }

    // ═══════════════════════════════════════════════════════════
    // EVENTOS
    // ═══════════════════════════════════════════════════════════
    document.getElementById('btn-end')!.addEventListener('click', () => {
      if (state.gameOver || state.isResolving) return;
      endTurn();
    });

    document.getElementById('btn-draw')!.addEventListener('click', () => {
      if (state.gameOver || state.isResolving) return;
      if (state.coins < state.maxCoins) {
        state.coins = Math.min(state.maxCoins, state.coins + 1);
      }
      drawCards(1);
      render('gain');
    });

    document.getElementById('btn-confirm')!.addEventListener('click', () => {
      if (state.gameOver || state.isResolving) return;
      resolveAllClashes();
    });

    document.getElementById('btn-next-round')!.addEventListener('click', () => {
      const florText = document.getElementById('flor-comment')!.textContent;
      if (state.round > ENEMIES.length || florText === 'caíste.') {
        initState();
        document.getElementById('overlay')!.classList.remove('visible');
        document.getElementById('btn-next-round')!.textContent = 'siguiente ronda';
        setAudioMuffled(false);
        startTurn();
      }
    });

    window.addEventListener('resize', () => { if (!state.gameOver) drawArrows(); });

    // ── INIT ─────────────────────────────────────────────
    initState();
    startTurn();

    // ── AUDIO ─────────────────────────────────────────────
    let audioCtx: any = null; let audioFilter: any = null;

    function initAudio() {
      if (audioCtx) return;
      const w = window as any;
      audioCtx = new (w.AudioContext || w.webkitAudioContext)();
      const TEMAS = ['media/theme1.mp3','media/theme2.mp3','media/theme3.mp3'];
      const audio = new Audio(TEMAS[Math.floor(Math.random()*TEMAS.length)]);
      audio.crossOrigin='anonymous'; audio.loop=true; audio.volume=0;
      const src = audioCtx.createMediaElementSource(audio);
      audioFilter = audioCtx.createBiquadFilter();
      audioFilter.type='lowpass';
      audioFilter.frequency.setValueAtTime(22000, audioCtx.currentTime);
      src.connect(audioFilter); audioFilter.connect(audioCtx.destination);
      audio.play();
      let vol=0;
      const fi=setInterval(()=>{ if(vol<0.5){vol+=0.02;audio.volume=Math.min(0.5,vol);}else clearInterval(fi); },50);
    }

    function setAudioMuffled(m: boolean) {
      if (!audioCtx||!audioFilter) return;
      audioFilter.frequency.setTargetAtTime(m?400:22000, audioCtx.currentTime, 0.4);
    }

    initAudio();
  }

  ngOnDestroy(): void {
    if (this.activeInterval) clearInterval(this.activeInterval);
  }
}