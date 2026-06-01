import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioCtx: AudioContext | null = null;
  private audioSource: MediaElementAudioSourceNode | null = null;
  private audioFilter: BiquadFilterNode | null = null;
  private audioHtml: HTMLAudioElement | null = null;

  private readonly TEMAS_POOL = [
    'assets/audio/musica-fondo.mp3',
    'assets/audio/musica-fondo2.mp3',
    'assets/audio/musica-fondo3.mp3'
  ];

  initAudio(): void {
    if (this.audioCtx) return; // Evita inicializaciones dobles

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    const temaAleatorio = this.TEMAS_POOL[Math.floor(Math.random() * this.TEMAS_POOL.length)];
    
    this.audioHtml = new Audio(temaAleatorio);
    this.audioHtml.loop = true;
    this.audioHtml.volume = 0;

    this.audioSource = this.audioCtx.createMediaElementSource(this.audioHtml);
    this.audioFilter = this.audioCtx.createBiquadFilter();
    this.audioFilter.type = 'lowpass';
    this.audioFilter.frequency.setValueAtTime(22000, this.audioCtx.currentTime);

    this.audioSource.connect(this.audioFilter);
    this.audioFilter.connect(this.audioCtx.destination);

    this.audioHtml.play().catch(err => console.warn("Audio play bloqueado por navegador:", err));

    // Fade-in gradual de volumen
    let vol = 0;
    const fadeInterval = setInterval(() => {
      if (this.audioHtml && vol < 0.5) {
        vol += 0.02;
        this.audioHtml.volume = Math.min(0.5, vol);
      } else {
        clearInterval(fadeInterval);
      }
    }, 50);
  }

  setAudioMuffled(muffled: boolean): void {
    if (!this.audioCtx || !this.audioFilter) return;
    const targetFreq = muffled ? 400 : 22000;
    // Transición suave de 0.4 segundos usando el scheduler nativo
    this.audioFilter.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.4);
  }

  stopAudio(): void {
    if (this.audioHtml) {
      this.audioHtml.pause();
      this.audioHtml = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}