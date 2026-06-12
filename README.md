# 🎛️ SynthBreaker: See With Your Ears

**An interactive generative audio experience disguised as an arcade classic.**

![SynthBreaker Preview](https://via.placeholder.com/800x400/0D0D11/00FFFF?text=SynthBreaker+Generative+Audio+Game) 
*(Note: Replace with an actual screenshot or GIF of your game)*

**SynthBreaker** is a premium web application that merges the nostalgic mechanics of *Breakout / Arkanoid* with a high-end generative audio synthesis engine. Built for musicians, audio engineers, and tech enthusiasts, every bounce, collision, and broken brick dynamically modulates a virtual analog synthesizer, creating a unique ambient-techno soundtrack driven entirely by gameplay physics.

There is no "Play" button. The game *is* the instrument.

---

## ✨ Key Features

*   **🕹️ Zero-Friction UX:** No boring menus. The title screen awaits in a state of suspended animation. Click anywhere to awaken the audio engine and trigger the sequence.
*   **🎹 Generative Audio DSP:** Powered by the Web Audio API / Tone.js. The game events are mapped to real synthesizer parameters:
    *   **Paddle Hits:** Trigger deep, sub-bass 808-style kicks.
    *   **Lower Bricks:** Fire quantized plucks and arpeggios locked to a musical scale.
    *   **Upper Bricks:** Act as modulation nodes, opening Low-Pass Filter cutoffs, increasing LFO rates, or ramping up Delay Feedback.
*   **🌌 Dynamic Dark Mode Aesthetic:** A sleek, premium UI featuring a deep `#0D0D11` background, reactive neon cyan and magenta accents, and physics-based particle trails.
*   **📊 Real-time HUD:** Monospaced technical readouts (Score, Multiplier, Cutoff Frequencies, Delay FB) display active DSP parameters evolving at 60fps.

---

## 🛠️ Tech Stack

This project was built with a focus on modularity and high performance in the browser.

*   **Frontend:** HTML5, CSS3 / Tailwind CSS (for rapid, borderless styling).
*   **Graphics & Physics:** Native `Canvas API` (rendering at fluid 60fps).
*   **Audio Engine:** `Tone.js` (Handling polyphonic synthesis, FM synthesis, and the global effects chain: Reverb, PingPong Delay, AutoFilter).

---

## 🧠 DSP Mapping Logic

The magic of SynthBreaker lies in how physical coordinates translate to sound design:

| Gameplay Event | Synthesis Parameter | Effect |
| :--- | :--- | :--- |
| **Ball X-Axis** | Panner Node | Spatial stereo panning (Left/Right) |
| **Ball Y-Axis** | Filter Cutoff | Controls the brightness of the ambient drone |
| **Brick Collision** | MIDI Note Trigger | Fires notes within a minor pentatonic scale |
| **Special Bricks** | Overdrive / Delay | Momentary bursts of tape saturation or high-feedback delays |

---

## 🚀 How to Run Locally

You can run this project with any local development server.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/synthbreaker.git
    cd synthbreaker
    ```
2.  **Start a local server:**
    If you have Python installed, you can easily spin up a server:
    ```bash
    python -m http.server 8000
    ```
    *Alternatively, you can use the VS Code "Live Server" extension or Node's `http-server`.*
3.  **Open in your browser:**
    Navigate to `http://localhost:8000`

> ⚠️ **Note:** Modern browsers block audio context until the user interacts with the page. Click anywhere on the screen to initialize the `Tone.js` engine and start the game.

---

## 👨‍💻 Author

**David Rábago**
*Mechatronics Engineer & Audio DSP Developer*

Passionate about bridging the gap between embedded systems, JUCE plugin development, and cutting-edge web technologies. 

*   [GitHub Profile](https://github.com/yourusername)
*   [LinkedIn](https://linkedin.com/in/yourprofile)
*   *Based in Culiacán, Mexico | Seeking Master's opportunities in Canada 🇨🇦*

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
