export interface Card {
  id: string;
  type: 'fuerza' | 'constancia' | 'especial' | 'duda';
  text: string;
  effect: string;
  dmg: number;
  cost: number;          // monedas necesarias (1-5)
  gainCoin?: number;
  heal?: number;
  selfDmg?: number;
  draw?: number;
  clashBonus?: number;   // daño extra en clash
}

export interface EnemyCard {
  id: string;
  name: string;          // nombre corto de la carta enemiga
  text: string;          // frase que dice la carta
  dmg: number;           // daño base de la carta enemiga
  clashPower: number;    // poder del enemigo en los choques individuales
  rounds: number;        // cuántos choques resiste antes de romperse
}

export interface Prescript {
  text: string;
  bonus: string;
  curse: string;
  bonusFn: (state: GameState) => void;
  curseFn: (state: GameState) => void;
}

export interface Enemy {
  name: string;
  hp: number;
  currentHp?: number;
  phrases: string[];
  dmgPerTick: number;
  tickMs: number;
  cardPool: EnemyCard[]; // pool de cartas que puede usar
}

export interface ClashResult {
  playerWins: boolean;   // quién ganó el clash
  rounds: number;        // cuántos choques ocurrieron
  surplusDmg: number;    // daño del ganador que sobra
}

export interface GameState {
  round: number;
  hp: number;
  coins: number;
  maxCoins: number;
  deck: Card[];
  discard: Card[];
  hand: Card[];
  enemy: Enemy;
  enemyCard: EnemyCard | null;   // carta activa del enemigo esta ronda
  pressure: number;
  gameOver: boolean;
  cardsPlayedThisTurnCount: number;
  prescrip: Prescript | null;
  costReduction: number;
  dmgBonus: number;
  drawPerTurn: number;
  coinsPerTurn: number;
  pressureSpeedMult: number;
  dudaDmgBonus: number;
  fuerzaCostExtra: number;
  coinPerCard: number;
  endTurnPenalty: number;
  enemyDmgBonus: number;
  hpCostPerTurn: number;
  clashBonusGlobal: number;      // bonus de daño en clashes
  isClashing: boolean;           // animación de clash en curso
}