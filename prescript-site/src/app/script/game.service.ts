import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Card, Enemy, Prescript, GameState } from './game.models';
import { AudioService } from './audio.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Pool de cartas estático basado en tu diseño
  private readonly CARD_POOL: Card[] = [
    { id:'c1',  type:'fuerza',     text:'La constancia abre caminos.',        effect:'+3 daño',        dmg:3, cost:1 },
    { id:'c2',  type:'constancia', text:'Un paso más. Solo uno.',            effect:'+2 daño, +1 moneda', dmg:2, cost:1, gainCoin:1 },
    { id:'c3',  type:'fuerza',     text:'El esfuerzo siempre vale la pena.',  effect:'+4 daño',        dmg:4, cost:2 },
    { id:'c4',  type:'fuerza',     text:'No te rindas. Vas bien.',            effect:'+2 daño, +2 HP', dmg:2, cost:1, heal:2 },
    { id:'c5',  type:'constancia', text:'Cada día cuenta. No pares.',         effect:'+3 daño, +1 moneda', dmg:3, cost:2, gainCoin:1 },
    { id:'c6',  type:'especial',   text:'Hay algo escondido entre las palabras.', effect:'+6 daño, roba 1', dmg:6, cost:2, draw:1 },
    { id:'c7',  type:'fuerza',     text:'Mantenerse firme es el camino.',     effect:'+3 daño',        dmg:3, cost:1 },
    { id:'c8',  type:'constancia', text:'Lo que practicas en silencio define lo que eres.', effect:'+5 daño', dmg:5, cost:3 },
    { id:'c9',  type:'especial',   text:'No es casualidad que estés aquí.',    effect:'+4 daño, +3 HP', dmg:4, cost:2, heal:3 },
    { id:'c10', type:'fuerza',     text:'Seguir intentando es ganar.',        effect:'+2 daño, roba 1', dmg:2, cost:1, draw:1 },
    { id:'c11', type:'duda',       text:'¿Y si no funciona? (descarta)',      effect:'−1 HP propio, +7 daño', dmg:7, cost:0, selfDmg:1 },
    { id:'c12', type:'constancia', text:'La diferencia está en una sola decisión.', effect:'+4 daño, +1 moneda', dmg:4, cost:2, gainCoin:1 },
  ];

  public readonly PRESCRIPS: Prescript[] = [
    { text:'La constancia recompensa, pero el tiempo apremia.', bonus:'Cartas cuestan -1 menos.', curse:'La presión baja 30% más rápido.', bonusFn: s => s.costReduction += 1, curseFn: s => s.pressureSpeedMult = Math.min(2.2, s.pressureSpeedMult + 0.3) },
    { text:'El esfuerzo duplica, pero el cuerpo paga.', bonus:'+2 daño en todas las cartas.', curse:'−3 HP al inicio de cada turno.', bonusFn: s => s.dmgBonus += 2, curseFn: s => s.hpCostPerTurn += 3 },
    { text:'La claridad llega, pero el silencio duele.', bonus:'Robas 5 cartas por turno.', curse:'Solo 1 moneda por turno.', bonusFn: s => s.drawPerTurn += 1, curseFn: s => s.coinsPerTurn = Math.max(1, s.coinsPerTurn - 1) },
    { text:'La duda te hace fuerte, pero te hace lento.', bonus:'+4 daño en cartas de duda.', curse:'Cartas de fuerza cuestan +1.', bonusFn: s => s.dudaDmgBonus += 4, curseFn: s => s.fuerzaCostExtra += 1 },
    { text:'El riesgo multiplica, pero el error cuesta.', bonus:'Cada carta jugada da -1 menos.', curse:'Si terminas turno sin jugar, −5 HP.', bonusFn: s => s.costReduction += 1, curseFn: s => s.endTurnPenalty += 5 },
    { text:'La velocidad es tuya, pero la guardia cae.', bonus:'Presión baja 20% más lento.', curse:'Enemigo hace +2 daño por ataque.', bonusFn: s => s.pressureSpeedMult -= 0.2, curseFn: s => s.enemyDmgBonus += 2 },
  ];

  private readonly ENEMIES: Enemy[] = [
  { name:'La Pereza', hp:1, phrases:['¿para qué esforzarte?','mañana lo haces.','no vale la pena.'], dmgPerTick:4, tickMs:2200, cardPool: [] },
  { name:'La Duda', hp:2, phrases:['no eres suficiente.','siempre fallas.','¿quién te crees?'], dmgPerTick:5, tickMs:1900, cardPool: [] },
  { name:'El Agotamiento', hp:3, phrases:['ya no puedes más.','detente.','ya es suficiente.'], dmgPerTick:6, tickMs:1700, cardPool: [] },
];

  // Estado reactivo observable por los componentes de Angular
  private stateSubject = new BehaviorSubject<GameState | null>(null);
  public gameState$ = this.stateSubject.asObservable();

  private pressureInterval: any = null;
  private battleLogSubject = new BehaviorSubject<string>('Elige una carta para responder.');
  public battleLog$ = this.battleLogSubject.asObservable();

  private enemyPhraseSubject = new BehaviorSubject<string>('...');
  public enemyPhrase$ = this.enemyPhraseSubject.asObservable();

  constructor(private audioService: AudioService) {
    this.initState();
  }

  public initState(): void {
    this.stopPressure();
    const firstEnemy = this.ENEMIES[0];
    
    this.stateSubject.next({
      round: 1,
      hp: 20,
      coins: 3,
      deck: this.shuffle([...this.CARD_POOL.slice(0, 6)]),
      discard: [],
      hand: [],
      enemy: { ...firstEnemy, currentHp: firstEnemy.hp },
      pressure: 100,
      gameOver: false,
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
      maxCoins: 10,             // Ajusta este valor máximo según las reglas de tu juego
    enemyCard: null,          // O la carta con la que empiece el enemigo si aplica
    clashBonusGlobal: 0,      // Valor inicial del bono de choque
    isClashing: false         // Estado de choque inicial
    });
    this.battleLogSubject.next('Elige una carta para responder.');
    this.enemyPhraseSubject.next('...');
  }

  // --- MÉTODOS DEL CORE DEL JUEGO ---
  public startTurn(): void {
    const s = this.getState();
    if (!s) return;

    this.stopPressure();
    s.cardsPlayedThisTurnCount = 0;
    s.coins = s.coinsPerTurn;

    this.drawCards(s.drawPerTurn, s);
    this.showEnemyPhrase(s.enemy.phrases[Math.floor(Math.random() * s.enemy.phrases.length)]);
    this.battleLogSubject.next('Elige una carta para responder.');
    this.resetPressure(s);
  }

  public playCard(card: Card): void {
    const s = this.getState();
    if (!s || s.gameOver) return;

    let realCost = card.cost - s.costReduction;
    if (card.type === 'fuerza') realCost += s.fuerzaCostExtra;
    realCost = Math.max(0, realCost);

    if (s.coins < realCost) return;

    s.coins -= realCost;
    s.hand = s.hand.filter(c => c.id !== card.id);
    s.discard.push(card);
    s.cardsPlayedThisTurnCount++;

    let log = `"${card.text.slice(0,30)}..." — ${card.effect}.`;
    let dmg = card.dmg + s.dmgBonus;
    if (card.type === 'duda') dmg += s.dudaDmgBonus;
    
    if (s.enemy.currentHp !== undefined) {
      s.enemy.currentHp -= dmg;
    }

    if (card.gainCoin) { s.coins += card.gainCoin; log += ` +${card.gainCoin} moneda.`; }
    if (card.heal)     { s.hp = Math.min(20, s.hp + card.heal); log += ` +${card.heal} HP.`; }
    if (card.selfDmg)  { s.hp -= card.selfDmg; }
    if (card.draw)     { this.drawCards(card.draw, s); }

    this.battleLogSubject.next(log);

    if (s.enemy.currentHp !== undefined && s.enemy.currentHp <= 0) {
      s.enemy.currentHp = 0;
      this.stateSubject.next({ ...s });
      setTimeout(() => this.endRound(), 600);
      return;
    }

    this.resetPressure(s);
  }

  public endTurn(): void {
    const s = this.getState();
    if (!s || s.gameOver) return;

    if (s.hpCostPerTurn > 0) {
      s.hp -= s.hpCostPerTurn;
      this.battleLogSubject.next(`El desgaste físico te pasa factura. −${s.hpCostPerTurn} HP.`);
      if (s.hp <= 0) { s.hp = 0; this.endGame(false, s); return; }
    }

    if (s.cardsPlayedThisTurnCount === 0) {
      const penalty = s.endTurnPenalty || 0;
      const extraDmg = (s.enemy.dmgPerTick + s.enemyDmgBonus) + penalty;
      s.hp -= extraDmg;
      this.battleLogSubject.next(`Pasaste sin actuar. El estado mental aprovecha. −${extraDmg} HP.`);
      this.showEnemyPhrase(s.enemy.phrases[Math.floor(Math.random() * s.enemy.phrases.length)]);
      if (s.hp <= 0) { s.hp = 0; this.endGame(false, s); return; }
    }

    this.stopPressure();
    s.discard.push(...s.hand);
    s.hand = [];
    this.stateSubject.next({ ...s });
    this.startTurn();
  }

  public applyPrescript(p: Prescript): void {
    const s = this.getState();
    if (!s) return;
    s.prescrip = p;
    p.bonusFn(s);
    p.curseFn(s);
    this.nextRound(s);
  }

  // --- AYUDANTES DE TIEMPO Y PRESIÓN ---
  private startPressure(s: GameState): void {
    this.stopPressure();
    const step = (s.enemy.dmgPerTick / s.enemy.tickMs) * 50;

    this.pressureInterval = setInterval(() => {
      const current = this.getState();
      if (!current || current.gameOver) { this.stopPressure(); return; }

      const safeSpeedMult = Math.min(4.0, current.pressureSpeedMult);
      current.pressure -= step * safeSpeedMult;

      if (current.pressure <= 0) {
        this.stopPressure();
        current.pressure = 0;
        this.stateSubject.next({ ...current });
        this.enemyAttack(current);
      } else {
        this.stateSubject.next({ ...current });
      }
    }, 50);
  }

  private enemyAttack(s: GameState): void {
    s.hp -= s.enemy.dmgPerTick;
    this.showEnemyPhrase(s.enemy.phrases[Math.floor(Math.random() * s.enemy.phrases.length)]);
    this.battleLogSubject.next(`${s.enemy.name} te golpea. −${s.enemy.dmgPerTick} HP.`);

    if (s.hp <= 0) { s.hp = 0; this.endGame(false, s); return; }
    this.resetPressure(s);
  }

  private resetPressure(s: GameState): void {
    s.pressure = 100;
    this.stateSubject.next({ ...s });
    this.startPressure(s);
  }

  public stopPressure(): void {
    if (this.pressureInterval) {
      clearInterval(this.pressureInterval);
      this.pressureInterval = null;
    }
  }

  private endRound(): void {
    const s = this.getState();
    if (!s) return;
    this.stopPressure();
    s.gameOver = true;
    this.audioService.setAudioMuffled(true);
    this.stateSubject.next({ ...s });
  }

  private nextRound(s: GameState): void {
    this.stopPressure();
    this.audioService.setAudioMuffled(false);

    s.round++;
    const enemyIdx = Math.min(s.round - 1, this.ENEMIES.length - 1);
    s.enemy = { ...this.ENEMIES[enemyIdx], currentHp: this.ENEMIES[enemyIdx].hp };
    s.gameOver = false;
    s.cardsPlayedThisTurnCount = 0;
    s.deck = this.shuffle([...s.deck, ...s.discard, ...s.hand]);
    s.discard = [];
    s.hand = [];

    this.stateSubject.next({ ...s });
    this.startTurn();
  }

  private endGame(win: boolean, s: GameState): void {
    this.stopPressure();
    s.gameOver = true;
    this.stateSubject.next({ ...s });
  }

  private drawCards(n: number, s: GameState): void {
    for (let i = 0; i < n; i++) {
      if (s.deck.length === 0) {
        if (s.discard.length === 0) return;
        s.deck = this.shuffle([...s.discard]);
        s.discard = [];
      }
      const card = s.deck.pop();
      if (card) s.hand.push(card);
    }
  }

  public drawCardAction(): void {
    const s = this.getState();
    if (!s || s.gameOver) return;
    s.coins += 1;
    this.drawCards(1, s);
    this.battleLogSubject.next('Robaste una carta. +1 moneda.');
    this.stateSubject.next({ ...s });
  }

  private shuffle(arr: any[]): any[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private showEnemyPhrase(text: string): void {
    this.enemyPhraseSubject.next(text);
  }

  private getState(): GameState | null {
    return this.stateSubject.value;
  }
}