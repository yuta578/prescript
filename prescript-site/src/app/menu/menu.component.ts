import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AudioService } from '../script/audio.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit, OnDestroy {

  // ── Estado UI ──
  sidebarCollapsed = true;
  zonaOculta = true;
  triggerVisible = true;
  relojVisible = true;
  activePanel: 'panel-sumision' | 'panel-tribunal' | 'panel-afrontamiento' = 'panel-sumision';
  btnEntrarVisible = false;
  btnEntrarText = '';
  consolaTexto = '[SISTEMA]: Esperando inicialización. Selecciona una directriz estructural de la lista superior.';
  consolaColor = '#555';
  activeDificultad: string | null = null;
  pantallaDesenfocada = false;
  reloj = '00:00:00';

  // Tribunal
  textoTribunal = '"Sabías perfectamente cómo iba a terminar esto, y aun así decidiste ejecutarlo."';
  notificacionVisible = false;
  notificacionHtml = '';
  notificacionColor = '#555';

  // Traits
  contadorTraits = 0;
  traits = [
    { nombre: 'Abnegación Total', efecto: 'Al entrar en zona crítica de Presión (>80%), las directivas defensivas duplican su efectividad.', enlazado: false },
    { nombre: 'Complejo de Mártir', efecto: 'Sufres -3 HP iniciales. Las acciones de asalto ganan +1 de efectividad por salud ausente.', enlazado: false },
    { nombre: 'Fe Ciega', efecto: 'Anula un espacio operativo de tu mano. A cambio, los costes del resto se reducen a cero.', enlazado: false },
    { nombre: 'Voluntad Quebrada', efecto: 'El ratio de Presión aumenta un 15% más lento, pero se pierde la capacidad crítica.', enlazado: false },
  ];

  private relojInterval: any;
  private scrambleInterval: any;

  private poolTribunal = [
    'Sabías perfectamente cómo iba a terminar esto, y aun así decidiste ejecutarlo.',
    'Te esfuerzas por aparentar inocencia, pero tus acciones pasadas dicen lo contrario.',
    'Estás repitiendo el mismo patrón destructivo. ¿Realmente crees que esta vez será diferente?',
    'Prefieres obedecer una orden de ejecución injusta antes que asumir la responsabilidad de elegir.',
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef, private audioService: AudioService) {} // 2. Añadir al constructor

  ngOnInit() {
    this.relojInterval = setInterval(() => this.actualizarReloj(), 1000);
    this.actualizarReloj();
    this.audioService.stopAudio();
  }

  ngOnDestroy() {
    clearInterval(this.relojInterval);
    clearInterval(this.scrambleInterval);
  }

  actualizarReloj() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    this.reloj = `${h}:${m}:${s}`;
  }

  seleccionarOpcion(panel: 'panel-sumision' | 'panel-tribunal' | 'panel-afrontamiento') {
    if (this.activePanel === panel && !this.sidebarCollapsed) {
      this.sidebarCollapsed = true;
      this.zonaOculta = true;
      this.triggerVisible = true;
      this.relojVisible = true;
      return;
    }
    this.sidebarCollapsed = false;
    this.zonaOculta = false;
    this.triggerVisible = false;
    this.relojVisible = false;
    this.activePanel = panel;
  }

  restaurarMenu() {
    this.sidebarCollapsed = false;
    this.zonaOculta = false;
    this.triggerVisible = false;
    this.relojVisible = false;
  }

  seleccionarDificultad(tipo: string) {
    this.activeDificultad = tipo;
    this.aplicarScramble('ENTRAR');
    this.btnEntrarVisible = true;

    const msgs: Record<string, { text: string; color: string }> = {
      inocente:   { text: 'Mente libre de influencias regulatorias. Sin imposición de mandatos de sesión.', color: '#555' },
      contencion: { text: 'El entorno muestra hostilidad acelerada. Los patrones enemigos operarán bajo flujos avanzados.', color: '#777' },
      culpable:   { text: 'Prescriptos obligatorios activos entre rondas. Ej: \'Toda resolución defensiva queda inhabilitada por un turno\'.', color: '#cf2a2a' },
      index:      { text: 'Imposición tiránica de atrocidades externas. Ej: \'Las acciones curativas revertirán su polaridad infligiendo daño directo\'.', color: '#cf2a2a' },
    };
    this.consolaTexto = msgs[tipo].text;
    this.consolaColor = msgs[tipo].color;
  }

  aplicarScramble(texto: string) {
    const chars = 'XØ█▓░▰▱▲▼𝚿⦀☣10';
    let iter = 0;
    clearInterval(this.scrambleInterval);
    
    this.scrambleInterval = setInterval(() => {
      this.btnEntrarText = texto.split('').map((l, i) => {
        if (i < iter) return texto[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      
      // 3. Forzar a Angular a renderizar el nuevo string en cada iteración del cronómetro
      this.cdr.detectChanges(); 

      if (iter >= texto.length) clearInterval(this.scrambleInterval);
      iter += 1 / 3;
    }, 40);
  }

  ejecutarTransicion() {
    if (!this.activeDificultad) return;

    // Sonido
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3500, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + 1.5);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 4.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 4.5);
    } catch (e) {}

    this.pantallaDesenfocada = true;

    // Navegar al juego después del blackout
    setTimeout(() => {
      this.router.navigate(['/script'], {
        state: { dificultad: this.activeDificultad, traits: this.traits.filter(t => t.enlazado).map(t => t.nombre) }
      });
    }, 5000);
  }

  procesarRespuesta(tipo: 'obedecer' | 'rebelarse') {
    this.notificacionVisible = true;
    if (tipo === 'obedecer') {
      this.notificacionHtml = '↳ [CARTA ADQUIRIDA]: <b>Barrera de Sumisión</b> (Sistemática / Defensiva)';
      this.notificacionColor = '#2acf6b';
    } else {
      this.notificacionHtml = '↳ [CARTA ADQUIRIDA]: <b>Ira Inocente</b> (Volátil / Agresiva)';
      this.notificacionColor = '#cf2a2a';
    }
    setTimeout(() => {
      const i = Math.floor(Math.random() * this.poolTribunal.length);
      this.textoTribunal = `"${this.poolTribunal[i]}"`;
    }, 1800);
  }

  toggleTrait(idx: number) {
    const t = this.traits[idx];
    if (t.enlazado) {
      t.enlazado = false;
      this.contadorTraits--;
    } else {
      if (this.contadorTraits >= 3) {
        // Flash en contador
        return;
      }
      t.enlazado = true;
      this.contadorTraits++;
    }
  }
}
