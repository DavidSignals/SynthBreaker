import * as Tone from 'https://esm.sh/tone@14.8.49';

export class AudioEngine {
    constructor() {
        this.isInitialized = false;
        
        // ──────────────────────────────────────────────────────
        // PROGRESSIONS: cada nivel es radicalmente diferente
        // ──────────────────────────────────────────────────────
        this.progressions = [
            {   // NIVEL 1: Outrun clásico — Do Menor pesado, lento y oscuro
                label: "Cm",
                // Corcheas con acentuación de octava
                bassPattern: ["C2", null, "C3", null, "D#2", null, "G2", "G2"],
                // Arpegio pentatónico ascendente lento
                scale: ["C3", "D#3", "G3", "A#3", "C4", "D#4", "G4", "A#4", "C5"],
                filterFreq: 500,
                resonance: 1
            },
            {   // NIVEL 2: Synthwave agresivo — Fa Menor, patrón sincopado rápido
                label: "Fm",
                // Patrón sincopado (offbeat) muy diferente al 1
                bassPattern: ["F1", "F2", "C2", "F1", null, "A#1", "C2", "A#1"],
                // Arpegio pentatónico de Fm, notas agudas
                scale: ["F4", "G#4", "A#4", "C5", "D#5", "F5", "G#5", "A#5", "C6"],
                filterFreq: 900,
                resonance: 4
            },
            {   // NIVEL 3: Clímax épico — Sol Menor, arpegios frenéticos
                label: "Gm",
                // Patrón ultra rápido (dieciseisavos, muy movido)
                bassPattern: ["G1", "D2", "G2", "D2", "A#1", "D2", "G2", "F2"],
                // Arpegio de Gm escalando en modo frenético
                scale: ["G4", "A#4", "C5", "D5", "F5", "G5", "A#5", "C6", "D6"],
                filterFreq: 1400,
                resonance: 8
            }
        ];
        
        this.currentLevel = 0;
        this.baseBpm = 115;
        
        // Modificadores del bassline activos (alterados por power-ups)
        this.bassVolume = -2;
        this.bassDetune = 0;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        await Tone.start();
        
        // ── Master ──
        this.masterCompressor = new Tone.Compressor(-12, 4).toDestination();

        // ── BASSLINE ──
        this.bassFilter = new Tone.Filter(500, "lowpass").connect(this.masterCompressor);
        this.bassSynth = new Tone.MonoSynth({
            oscillator: { type: "sawtooth" },
            envelope:       { attack: 0.01, decay: 0.18, sustain: 0.1, release: 0.4 },
            filterEnvelope: { attack: 0.01, decay: 0.2,  sustain: 0.1, release: 0.4, baseFrequency: 100, octaves: 4 },
            volume: this.bassVolume
        }).connect(this.bassFilter);

        let step = 0;
        this.bassLoop = new Tone.Loop(time => {
            const prog  = this.progressions[this.currentLevel];
            const note  = prog.bassPattern[step % prog.bassPattern.length];
            if (note !== null) {
                this.bassSynth.triggerAttackRelease(note, "16n", time);
            }
            step++;
        }, "16n");

        // ── DRUMS ──
        this.drumVolume = new Tone.Volume(-2).connect(this.masterCompressor);
        this.kickDrum  = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 4, volume: 4 }).connect(this.drumVolume);
        this.snareDrum = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }, volume: 0 }).connect(this.drumVolume);
        this.hihat     = new Tone.MetalSynth({ frequency: 200, envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5, volume: -10 }).connect(this.drumVolume);

        this.drumLoop = new Tone.Loop(time => {
            const beat = Math.floor((Tone.Transport.ticks / Tone.Transport.PPQ) * 4) % 16;
            if (beat % 4 === 0)  this.kickDrum.triggerAttackRelease("C1", "8n", time);
            if (beat % 8 === 4)  this.snareDrum.triggerAttackRelease("8n", time);
            if (beat % 2 === 0)  this.hihat.triggerAttackRelease("32n", time, 0.5);
        }, "16n");

        // ── BRICK PLUCKS (Juno chorus) ──
        this.chorus = new Tone.Chorus(4, 2.5, 0.5).start();
        this.delay  = new Tone.PingPongDelay("8n", 0.4);
        this.reverb = new Tone.Freeverb({ roomSize: 0.8, dampening: 2000 }).connect(this.masterCompressor);
        this.chorus.connect(this.delay);
        this.delay.connect(this.reverb);

        this.polySynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "square" },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 1.5 },
            volume: -8
        }).connect(this.chorus);
        
        // ── FX: Riser de transición ──
        this.riserSynth = new Tone.Synth({
            oscillator: { type: "sawtooth" },
            envelope: { attack: 2, decay: 0, sustain: 1, release: 1 },
            volume: -10
        }).connect(this.reverb);

        // ── FX: Power-up arpegio ──
        this.powerUpSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
            volume: 0
        }).connect(this.delay);
        
        // ── FX: Obstacle Glitch FM ──
        this.obstacleSynth = new Tone.FMSynth({
            harmonicity: 3.5, modulationIndex: 10,
            oscillator: { type: "sine" }, modulation: { type: "square" },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 },
            volume: -6
        }).connect(this.masterCompressor);
        
        Tone.Transport.bpm.value = this.baseBpm;
        this.isInitialized = true;
    }

    // ──────────────────────────────────────────────────────────
    // PADDLE FADER — mueve la barra = mueve el fader del bajo
    // ──────────────────────────────────────────────────────────
    updatePaddlePosition(paddleX, paddleWidth, canvasWidth) {
        if (!this.isInitialized) return;
        
        // Centro normalizado [-1, 1], 0 = centro (volumen neutro)
        const center = paddleX + paddleWidth / 2;
        const norm   = (center / canvasWidth) * 2 - 1; // -1 ... +1
        
        // Volumen: centro = normal, extremos = más silencioso o más fuerte
        const volDb = this.bassVolume + norm * 8; // rango ±8 dB
        this.bassSynth.volume.rampTo(Math.max(-30, Math.min(6, volDb)), 0.05);
        
        // Detune sutil para efecto de pitch-bend al mover la barra
        const detune = norm * this.bassDetune;
        this.bassSynth.detune.rampTo(detune, 0.05);
    }
    
    // ──────────────────────────────────────────────────────────
    // POWER-UP ÁMBAR — valores aleatorios del bassline
    // ──────────────────────────────────────────────────────────
    applyBasslinePowerUp() {
        if (!this.isInitialized) return;
        
        const roll = Math.random();
        
        if (roll < 0.33) {
            // Efecto A: Resonancia explosiva (Q alto) + detune de barra activado
            this.bassDetune = 50 + Math.random() * 150; // cents
            this.bassFilter.Q.rampTo(10 + Math.random() * 15, 0.5);
            setTimeout(() => {
                this.bassDetune = 0;
                this.bassFilter.Q.rampTo(1, 2);
            }, 8000);
        } else if (roll < 0.66) {
            // Efecto B: Cambio de forma de onda (sawtooth → square → triangle)
            const waves = ["square", "triangle", "sawtooth"];
            const wave  = waves[Math.floor(Math.random() * waves.length)];
            this.bassSynth.oscillator.type = wave;
            setTimeout(() => { this.bassSynth.oscillator.type = "sawtooth"; }, 8000);
        } else {
            // Efecto C: SubBass crush — octava baja + filtro muy cerrado
            this.bassFilter.frequency.rampTo(180, 0.3);
            this.bassSynth.volume.rampTo(4, 0.2);
            setTimeout(() => {
                this.bassFilter.frequency.rampTo(this.progressions[this.currentLevel].filterFreq, 2);
                this.bassSynth.volume.rampTo(this.bassVolume, 1);
            }, 8000);
        }
        
        // Siempre reproduce el arpegio de victoria
        const now = Tone.now();
        ["C5","E5","G5","C6"].forEach((n, i) => {
            this.powerUpSynth.triggerAttackRelease(n, "16n", now + i * 0.1);
        });
    }

    // ──────────────────────────────────────────────────────────
    // LEVEL PROGRESSION
    // ──────────────────────────────────────────────────────────
    setLevelProgression(level) {
        this.currentLevel = level % this.progressions.length;
        const prog = this.progressions[this.currentLevel];
        
        // Actualiza filtro y resonancia del nivel
        this.bassFilter.frequency.rampTo(prog.filterFreq, 1.5);
        this.bassFilter.Q.rampTo(prog.resonance, 1.5);
        
        // Actualiza escala de los plucks (mayor impacto auditivo)
        this.currentScale = prog.scale;
    }
    
    triggerTransitionRiser() {
        if (!this.isInitialized) return;
        this.riserSynth.triggerAttackRelease("C2", 2);
        this.riserSynth.frequency.rampTo("C6", 2.5);
    }
    
    triggerPaddleHit() {
        if (!this.isInitialized) return;
        this.kickDrum.triggerAttackRelease("C1", "8n");
    }
    
    triggerBrickHit(row, maxRows) {
        if (!this.isInitialized) return;
        const prog  = this.progressions[this.currentLevel];
        const scale = prog.scale;
        const index = Math.floor(((maxRows - row) / maxRows) * (scale.length - 1));
        const note  = scale[Math.max(0, Math.min(index, scale.length - 1))];
        this.polySynth.triggerAttackRelease(note, "16n");
    }
    
    triggerObstacleHit() {
        if (!this.isInitialized) return;
        const freqs = ["C3", "F#3", "A#3"];
        this.obstacleSynth.triggerAttackRelease(freqs[Math.floor(Math.random() * freqs.length)], "16n");
    }

    // Ball Y → filter del bassline; Ball X → delay feedback
    updateBallPosition(x, y, width, height) {
        if (!this.isInitialized) return { freq: 800, lfoRate: 0 };
        
        const normY      = Math.max(0, Math.min(1, y / height));
        const freq       = 200 + (1 - normY) * 3000;
        this.bassFilter.frequency.rampTo(freq, 0.1);
        
        const normX      = Math.max(0, Math.min(1, x / width));
        const feedbackVal = normX * 0.6;
        this.delay.feedback.rampTo(feedbackVal, 0.1);
        
        return { freq, lfoRate: feedbackVal };
    }

    startMusic() {
        if (!this.isInitialized) return;
        if (Tone.Transport.state !== "started") {
            this.bassLoop.start(0);
            this.drumLoop.start(0);
            Tone.Transport.start();
        }
    }

    pauseMusic() {
        if (!this.isInitialized) return;
        Tone.Transport.pause();
    }

    stopMusic() {
        if (!this.isInitialized) return;
        Tone.Transport.stop();
        this.bassLoop.stop(0);
        this.drumLoop.stop(0);
    }
}
