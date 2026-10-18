import { useEffect, useRef, useState, type CSSProperties } from "react";

type Chapter = "opening" | "brand" | "manifesto" | "roles" | "days" | "steps" | "finale";

const vertexShader = [
  "attribute vec2 a_position;",
  "void main() { gl_Position = vec4(a_position, 0.0, 1.0); }",
].join("\n");

const fragmentShader = [
  "precision highp float;",
  "uniform vec2 u_resolution;",
  "uniform float u_time;",
  "uniform float u_progress;",
  "uniform float u_reduced;",
  "float hash(vec3 p) {",
  "  p = fract(p * 0.1031);",
  "  p += dot(p, p.yxz + 33.33);",
  "  return fract((p.x + p.y) * p.z);",
  "}",
  "float boxD(vec3 p, vec3 b) {",
  "  vec3 q = abs(p) - b;",
  "  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);",
  "}",
  "vec3 tunnelPoint(vec3 p) {",
  "  float travel = u_progress * 27.0 * (1.0 - 0.94 * u_reduced);",
  "  float twist = p.z * 0.036 + u_progress * 1.55 * (1.0 - u_reduced) + u_time * 0.018;",
  "  float s = sin(twist);",
  "  float c = cos(twist);",
  "  p.xy = mat2(c, -s, s, c) * p.xy;",
  "  p.xy += vec2(0.11 * sin(u_progress * 4.2), 0.08 * cos(u_progress * 3.4));",
  "  p.z += travel + u_time * 0.22 * (1.0 - u_reduced);",
  "  return p;",
  "}",
  "vec2 tunnelField(vec3 p) {",
  "  float r = length(p.xy);",
  "  float wallRadius = 3.18 + 0.07 * sin(p.z * 0.22) + 0.045 * sin(p.z * 0.63);",
  "  float best = abs(r - wallRadius) - 0.055;",
  "  float material = 0.0;",
  "  float zRail = mod(p.z + 1.05, 3.15) - 1.575;",
  "  float rail = length(vec2(r - 2.92, zRail)) - 0.075;",
  "  if (rail < best) { best = rail; material = 1.0; }",
  "  float zGear = mod(p.z + 0.78, 4.1) - 2.05;",
  "  float angle = atan(p.y, p.x);",
  "  float toothAngle = mod(angle + 0.1308997, 0.2617994) - 0.1308997;",
  "  float teeth = boxD(vec3(r - 2.63, toothAngle * 2.63, zGear), vec3(0.145, 0.052, 0.18));",
  "  if (teeth < best) { best = teeth; material = 2.0; }",
  "  float gearRing = length(vec2(r - 2.63, zGear)) - 0.075;",
  "  if (gearRing < best) { best = gearRing; material = 1.0; }",
  "  float zInner = mod(p.z + 0.3, 2.25) - 1.125;",
  "  float innerRail = length(vec2(r - 2.22, zInner)) - 0.027;",
  "  if (innerRail < best) { best = innerRail; material = 3.0; }",
  "  float zPlate = mod(p.z + 0.52, 1.18) - 0.59;",
  "  float plateAngle = mod(angle + 0.2617994, 0.5235988) - 0.2617994;",
  "  float plate = boxD(vec3(r - 2.78, plateAngle * 2.78, zPlate), vec3(0.17, 0.115, 0.24));",
  "  if (plate < best) { best = plate; material = 0.0; }",
  "  return vec2(best, material);",
  "}",
  "float clothField(vec3 p) {",
  "  float opening = 1.28 * smoothstep(0.105, 0.315, u_progress);",
  "  float rippleA = sin(p.x * 2.9 + sin(p.y * 1.7)) * 0.085;",
  "  float rippleB = sin(p.x * 7.0 - p.y * 1.8) * 0.027;",
  "  float fineFold = sin(p.x * 15.0 + p.y * 5.2) * 0.009;",
  "  float peel = smoothstep(0.13, 0.34, u_progress) * abs(p.x) * 0.12;",
  "  float surface = 0.78 + rippleA + rippleB + fineFold + peel;",
  "  return max(max(abs(p.z - surface) - 0.035, opening - abs(p.x)), abs(p.y) - 2.7);",
  "}",
  "vec2 sceneField(vec3 p) {",
  "  vec2 hit = tunnelField(tunnelPoint(p));",
  "  if (u_progress > 0.075 && u_progress < 0.405 && u_reduced < 0.5) {",
  "    float cloth = clothField(p);",
  "    if (cloth < hit.x) hit = vec2(cloth, 4.0);",
  "  }",
  "  return hit;",
  "}",
  "vec3 normalAt(vec3 p) {",
  "  vec2 e = vec2(0.0035, 0.0);",
  "  return normalize(vec3(",
  "    sceneField(p + e.xyy).x - sceneField(p - e.xyy).x,",
  "    sceneField(p + e.yxy).x - sceneField(p - e.yxy).x,",
  "    sceneField(p + e.yyx).x - sceneField(p - e.yyx).x",
  "  ));",
  "}",
  "void main() {",
  "  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / max(u_resolution.y, 1.0);",
  "  float aspect = u_resolution.x / max(u_resolution.y, 1.0);",
  "  vec3 ro = vec3(0.0, 0.0, 0.0);",
  "  vec3 rd = normalize(vec3(uv.x * 1.55, uv.y * 1.12, 1.0));",
  "  float t = 0.0;",
  "  float material = -1.0;",
  "  for (int i = 0; i < 64; i++) {",
  "    vec3 p = ro + rd * t;",
  "    vec2 hit = sceneField(p);",
  "    if (hit.x < 0.0025) { material = hit.y; break; }",
  "    t += clamp(hit.x * 0.72, 0.012, 0.68);",
  "    if (t > 34.0) break;",
  "  }",
  "  vec3 color = vec3(0.006, 0.008, 0.007);",
  "  if (material >= 0.0) {",
  "    vec3 pos = tunnelPoint(ro + rd * t);",
  "    vec3 n = normalAt(ro + rd * t);",
  "    vec3 lightA = normalize(vec3(-0.7, 0.95, -0.55));",
  "    vec3 lightB = normalize(vec3(0.85, -0.35, -0.7));",
  "    float diffuse = max(dot(n, lightA), 0.0) * 0.92 + max(dot(n, lightB), 0.0) * 0.36;",
  "    float specular = pow(max(dot(reflect(-lightA, n), -rd), 0.0), 28.0);",
  "    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.7);",
  "    float grain = hash(floor(pos * 27.0 + vec3(u_time * 0.08))) - 0.5;",
  "    if (material > 3.5) {",
  "      float weave = 0.5 + 0.5 * sin(pos.x * 16.0 + 2.4 * sin(pos.y * 2.1));",
  "      float sheen = pow(max(0.0, sin(pos.x * 4.2 + pos.y * 2.0)), 7.0);",
  "      color = mix(vec3(0.008, 0.036, 0.026), vec3(0.045, 0.14, 0.095), weave * 0.78);",
  "      color += vec3(0.19, 0.075, 0.032) * sheen * 0.42;",
  "      color *= 0.42 + diffuse * 0.92;",
  "      color += vec3(0.10, 0.12, 0.085) * specular * 0.58;",
  "    } else {",
  "      vec3 steel = vec3(0.12, 0.14, 0.13);",
  "      vec3 emerald = vec3(0.025, 0.095, 0.064);",
  "      vec3 copper = vec3(0.31, 0.13, 0.065);",
  "      vec3 base = material < 0.5 ? steel : material < 1.5 ? copper : material < 2.5 ? vec3(0.19, 0.21, 0.19) : emerald;",
  "      float band = pow(max(0.0, sin(pos.z * 2.4 + atan(pos.y, pos.x) * 5.0)), 16.0);",
  "      color = base * (0.18 + diffuse * 0.86);",
  "      color += vec3(0.14, 0.07, 0.036) * (specular * 0.76 + band * 0.12);",
  "      color += vec3(0.012, 0.075, 0.047) * rim * 0.76;",
  "      color += grain * 0.012;",
  "    }",
  "    float fog = exp(-t * 0.067);",
  "    color = mix(vec3(0.006, 0.009, 0.008), color, fog);",
  "  }",
  "  float reveal = smoothstep(0.018, 0.13, u_progress);",
  "  color *= mix(0.13, 1.0, reveal);",
  "  float vignette = 1.0 - smoothstep(0.22, 1.48, length(vec2(uv.x / max(aspect, 0.7), uv.y) * 1.45));",
  "  color *= 0.45 + 0.55 * vignette;",
  "  float filmGrain = hash(vec3(gl_FragCoord.xy, floor(u_time * 24.0))) - 0.5;",
  "  color += filmGrain * 0.012;",
  "  color = pow(max(color, 0.0), vec3(0.92));",
  "  gl_FragColor = vec4(color, 1.0);",
  "}",
].join("\n");

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothStep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function getChapter(progress: number): Chapter {
  if (progress < 0.12) return "opening";
  if (progress < 0.425) return "brand";
  if (progress < 0.55) return "manifesto";
  if (progress < 0.665) return "roles";
  if (progress < 0.765) return "days";
  if (progress < 0.89) return "steps";
  return "finale";
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("Founders’ Affair shader compilation failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const audioRef = useRef<{
    context: AudioContext;
    gain: GainNode;
    oscillators: OscillatorNode[];
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  reducedMotionRef.current = reducedMotion;
  const chapter = getChapter(progress);
  const openingOpacity = 1 - smoothStep(0.055, 0.125, progress);
  const brandOpacity = smoothStep(0.16, 0.245, progress) * (1 - smoothStep(0.37, 0.435, progress));
  const sceneStyle = { "--journey-progress": progress } as CSSProperties;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener?.("change", updateMotion);

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const travel = Math.max(1, section.offsetHeight - window.innerHeight);
        const next = clamp01(-rect.top / travel);
        progressRef.current = next;
        setProgress((current) => Math.abs(current - next) > 0.0025 ? next : current);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      media.removeEventListener?.("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;
    if (!gl) {
      setWebglFailed(true);
      return;
    }

    const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) {
      setWebglFailed(true);
      return;
    }
    const program = gl.createProgram();
    if (!program) {
      setWebglFailed(true);
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Founders’ Affair shader linking failed:", gl.getProgramInfoLog(program));
      setWebglFailed(true);
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    if (!buffer) {
      setWebglFailed(true);
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const progressLocation = gl.getUniformLocation(program, "u_progress");
    const reducedLocation = gl.getUniformLocation(program, "u_reduced");

    const resize = () => {
      const compact = window.innerWidth < 768;
      const scale = Math.min(window.devicePixelRatio || 1, 1.25) * (compact ? 0.78 : 0.9);
      const width = Math.max(1, Math.floor(window.innerWidth * scale));
      const height = Math.max(1, Math.floor(window.innerHeight * scale));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      if (resolutionLocation) gl.uniform2f(resolutionLocation, width, height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const start = performance.now();
    const render = (now: number) => {
      if (!document.hidden && !gl.isContextLost()) {
        const elapsed = (now - start) / 1000;
        const reduced = reducedMotionRef.current;
        if (timeLocation) gl.uniform1f(timeLocation, reduced ? 0 : elapsed);
        if (progressLocation) gl.uniform1f(progressLocation, progressRef.current);
        if (reducedLocation) gl.uniform1f(reducedLocation, reduced ? 1 : 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = window.requestAnimationFrame(render);
    };
    raf = window.requestAnimationFrame(render);

    const onLost = (event: Event) => {
      event.preventDefault();
      setWebglFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.oscillators.forEach((oscillator) => {
      try { oscillator.stop(); } catch {}
    });
    void audio.context.close();
  }, []);

  const toggleSound = async () => {
    const next = !soundEnabled;
    try {
      let audio = audioRef.current;
      if (!audio && next) {
        const audioConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!audioConstructor) return;
        const context = new audioConstructor();
        const gain = context.createGain();
        gain.gain.value = 0;
        gain.connect(context.destination);
        const low = context.createOscillator();
        const high = context.createOscillator();
        low.type = "sine";
        high.type = "triangle";
        low.frequency.value = 54;
        high.frequency.value = 81;
        const lowGain = context.createGain();
        const highGain = context.createGain();
        lowGain.gain.value = 0.7;
        highGain.gain.value = 0.13;
        low.connect(lowGain);
        high.connect(highGain);
        lowGain.connect(gain);
        highGain.connect(gain);
        low.start();
        high.start();
        audio = { context, gain, oscillators: [low, high] };
        audioRef.current = audio;
      }
      if (audio) {
        await audio.context.resume();
        audio.gain.gain.setTargetAtTime(next ? 0.022 : 0, audio.context.currentTime, 0.28);
      }
      setSoundEnabled(next);
    } catch (error) {
      console.warn("Ambient sound could not be started.", error);
      setSoundEnabled(false);
    }
  };

  return (
    <section id="top" ref={sectionRef} className="fa-scroll-hero fa-journey-hero theme-dark" style={sceneStyle}>
      <div className={"fa-scroll-sticky fa-journey-sticky" + (webglFailed ? " fa-journey-sticky--fallback" : "")}>
        <canvas ref={canvasRef} className="fa-tunnel-canvas" aria-hidden="true" />
        <div className="fa-tunnel-fallback" aria-hidden="true">
          <div className="fa-fallback-ring fa-fallback-ring--one" />
          <div className="fa-fallback-ring fa-fallback-ring--two" />
          <div className="fa-fallback-ring fa-fallback-ring--three" />
          <div className="fa-fallback-core" />
        </div>
        <div className="fa-journey-shade" aria-hidden="true" />
        <div className="fa-journey-top label-mono">
          <a href="#top" className="fa-journey-wordmark" aria-label="Founders’ Affair — return to opening">FA<span> / </span>EIC</a>
          <span className="fa-journey-edition">A TWO-DAY BUSINESS SIMULATION</span>
          <button type="button" className="fa-sound-toggle" onClick={toggleSound} aria-pressed={soundEnabled}>
            <span className={"fa-sound-indicator" + (soundEnabled ? " is-on" : "")} aria-hidden="true" />
            {soundEnabled ? "Sound on" : "Sound off"}
          </button>
        </div>

        <div className="fa-journey-content" aria-live="polite">
          {chapter === "opening" && (
            <div className="fa-journey-panel fa-journey-panel--opening" style={{ opacity: openingOpacity }}>
              <img src="/eic-logo.svg" alt="EIC — Entrepreneurship & Innovation Cell" className="fa-opening-eic-logo" />
              <p className="fa-journey-kicker label-mono">Entrepreneurship & Innovation Cell presents</p>
              <span className="fa-opening-line" />
              <p className="fa-opening-prompt label-mono">Scroll to enter the experience</p>
            </div>
          )}

          {chapter === "brand" && (
            <div className="fa-journey-panel fa-journey-panel--brand" style={{ opacity: brandOpacity }}>
              <p className="fa-journey-kicker label-mono">EIC Presents</p>
              <h1 className="fa-main-title"><span>Founders’</span><em>Affair</em></h1>
              <p className="fa-brand-subtitle">Ideas. People. Opportunities.</p>
              <span className="fa-brand-rule" />
              <p className="fa-brand-caption label-mono">Build it. Run it. Move it. Sell it. Fund it.</p>
            </div>
          )}

          {chapter === "manifesto" && (
            <div className="fa-journey-panel fa-journey-panel--manifesto">
              <p className="fa-journey-kicker label-mono">The simulation</p>
              <h2 className="fa-statement">Build the company.<br />Move the market.<br /><em>Win the investors.</em></h2>
              <p className="fa-journey-description">Five people. Five C-suite roles. One company to build, run and sell in two days.</p>
              <p className="fa-journey-side-note label-mono">Every decision has consequences.</p>
            </div>
          )}

          {chapter === "roles" && (
            <div className="fa-journey-panel fa-journey-panel--roles">
              <p className="fa-journey-kicker label-mono">Five roles. One company.</p>
              <h2 className="fa-panel-heading">Take the seat.<br /><em>Make the call.</em></h2>
              <div className="fa-role-grid">
                <div><b>CEO</b><span>Strategy</span></div>
                <div><b>CFO</b><span>Finance</span></div>
                <div><b>CMO</b><span>Brand</span></div>
                <div><b>COO</b><span>Operations</span></div>
                <div><b>CTO</b><span>Innovation</span></div>
              </div>
              <p className="fa-journey-description">Five executive roles. One team. A company that has to survive every decision.</p>
            </div>
          )}

          {chapter === "days" && (
            <div className="fa-journey-panel fa-journey-panel--days">
              <p className="fa-journey-kicker label-mono">One company. Two days.</p>
              <h2 className="fa-panel-heading">Build it.<br /><em>Then get funded.</em></h2>
              <div className="fa-day-grid">
                <article>
                  <span className="fa-day-label label-mono">DAY 01</span>
                  <h3>Build and move the market</h3>
                  <p>Build, decide, survive, move the market.</p>
                  <span className="fa-day-activities">Acquisition Floor · Boardroom Crisis · Stock Market</span>
                </article>
                <article>
                  <span className="fa-day-label label-mono">DAY 02</span>
                  <h3>Build the brand and get funded</h3>
                  <p>Brand, sell, pitch, get funded.</p>
                  <span className="fa-day-activities">Brand War · Investor Marketplace</span>
                </article>
              </div>
              <p className="fa-capital-note label-mono">$100,000 in simulated starting capital. Spend it wisely.</p>
              <p className="fa-journey-description">The simulations are connected. A decision in one stage can change the next.</p>
            </div>
          )}

          {chapter === "steps" && (
            <div className="fa-journey-panel fa-journey-panel--steps">
              <p className="fa-journey-kicker label-mono">The road to the win</p>
              <h2 className="fa-panel-heading">Eight steps.<br /><em>One winner.</em></h2>
              <div className="fa-steps-grid">
                <div><span>01</span><b>Acquire</b><small>Buy your foundation</small></div>
                <div><span>02</span><b>Operate</b><small>Boardroom decisions</small></div>
                <div><span>03</span><b>Move the market</b><small>Decisions hit your stock</small></div>
                <div><span>04</span><b>Manage</b><small>React to the market</small></div>
                <div><span>05</span><b>Build the brand</b><small>Earn belief</small></div>
                <div><span>06</span><b>Pitch</b><small>Take it to the marketplace</small></div>
                <div><span>07</span><b>Get funded</b><small>Win the cheques</small></div>
                <div><span>08</span><b>Win</b><small>Highest total cheque value</small></div>
              </div>
              <p className="fa-journey-description">Each simulation has its own winner. The overall winner is decided across all eight steps.</p>
            </div>
          )}

          {chapter === "finale" && (
            <div className="fa-journey-panel fa-journey-panel--finale">
              <p className="fa-journey-kicker label-mono">Not just a college event.</p>
              <h2 className="fa-finale-quote">“For these two days, this wasn’t a college event.<br /><em>This was my company.</em>”</h2>
              <p className="fa-finale-manifesto">BUILD IT. RUN IT. MOVE IT. SELL IT. FUND IT.</p>
              <div className="fa-contact-row">
                <a href="mailto:foundersaffair@gmail.com">foundersaffair@gmail.com</a>
                <a href="https://www.instagram.com/eic.foundersaffair/" target="_blank" rel="noreferrer">@eic.foundersaffair ↗</a>
              </div>
              <span className="fa-registration-pending label-mono">Registration details to be announced</span>
            </div>
          )}
        </div>

        <div className="fa-journey-bottom label-mono">
          <span>FOUNDERS’ AFFAIR <i>—</i> EIC</span>
          <span className="fa-journey-progress"><i style={{ transform: "scaleX(" + progress + ")" }} /></span>
          <span>{String(Math.round(progress * 100)).padStart(3, "0")}<i> / 100</i></span>
        </div>
        {progress < 0.9 && <a className="fa-journey-scroll-cue label-mono" href="#about"><span /> Scroll to travel</a>}


      </div>
      <span id="about" className="fa-journey-anchor" style={{ top: "45%" }} aria-hidden="true" />
      <span id="team" className="fa-journey-anchor" style={{ top: "57%" }} aria-hidden="true" />
      <span id="how" className="fa-journey-anchor" style={{ top: "69%" }} aria-hidden="true" />
      <span id="experiences" className="fa-journey-anchor" style={{ top: "80%" }} aria-hidden="true" />
      <span id="contact" className="fa-journey-anchor" style={{ top: "94%" }} aria-hidden="true" />
    </section>
  );
}
