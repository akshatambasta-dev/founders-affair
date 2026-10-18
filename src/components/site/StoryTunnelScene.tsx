import { useEffect, useRef } from "react";
import * as THREE from "three";

type SceneRefs = {
  progressRef: { current: number };
  reducedMotionRef: { current: boolean };
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / Math.max(0.0001, b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function makePattern(kind: "weave" | "metal" | "floor") {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const x = c.getContext("2d");
  if (!x) return null;

  if (kind === "weave") {
    x.fillStyle = "#ded6c4";
    x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 5) {
      x.strokeStyle = i % 15 === 0 ? "rgba(255,251,232,.74)" : "rgba(65,56,43,.2)";
      x.lineWidth = i % 15 === 0 ? 1.5 : 1;
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 2, 512); x.stroke();
      x.strokeStyle = i % 15 === 0 ? "rgba(255,250,228,.52)" : "rgba(65,56,43,.17)";
      x.beginPath(); x.moveTo(0, i); x.lineTo(512, i - 2); x.stroke();
    }
    for (let i = 0; i < 500; i++) {
      x.fillStyle = i % 4 === 0 ? "rgba(255,255,255,.16)" : "rgba(42,36,27,.04)";
      x.fillRect((i * 73) % 512, (i * 151) % 512, 1, 3 + i % 4);
    }
  } else if (kind === "metal") {
    // TPF-inspired fine-line banknote guilloche & copperplate engraving hatching
    const g = x.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, "#28322c"); g.addColorStop(.5, "#141c17"); g.addColorStop(1, "#222a25");
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);

    // Fine-line undulating guilloche curves
    for (let i = 0; i < 512; i += 8) {
      x.strokeStyle = i % 24 === 0 ? "rgba(184,115,74,.24)" : "rgba(205,213,193,.09)";
      x.lineWidth = i % 24 === 0 ? 1.2 : 0.6;
      x.beginPath();
      for (let y = 0; y <= 512; y += 16) {
        const xOffset = Math.sin(y * 0.05 + i * 0.1) * 6;
        if (y === 0) x.moveTo(i + xOffset, y);
        else x.lineTo(i + xOffset, y);
      }
      x.stroke();
    }
    // Precision micro-coordinates & cross-hatch
    for (let i = 0; i < 180; i++) {
      x.strokeStyle = i % 2 ? "rgba(184,115,74,.2)" : "rgba(231,226,210,.12)";
      x.beginPath();
      x.moveTo((i * 97) % 512, (i * 179) % 512);
      x.lineTo((i * 97) % 512 + 4 + i % 14, (i * 179) % 512 + (i % 7) - 3);
      x.stroke();
    }
  } else {
    x.fillStyle = "#0e1511"; x.fillRect(0, 0, 512, 512);
    // Engraved floor tiles with copper reveal inlays
    for (let i = 0; i < 512; i += 32) {
      x.strokeStyle = "rgba(184,115,74,.18)";
      x.lineWidth = 1;
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke();
      x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke();
    }
    for (let i = 0; i < 512; i += 8) {
      x.strokeStyle = i % 32 === 0 ? "rgba(184,115,74,.16)" : "rgba(255,255,255,.025)";
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i - 80, 512); x.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function ring(radius: number, tube: number, material: THREE.Material, z: number, segments = 88) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, segments), material);
  mesh.position.z = z;
  return mesh;
}

// --- MECHANICAL IRIS APERTURE (Replaces Fabric Curtain) ---
// Composed of 8 overlapping brushed-metal / copper blades mounted on radial pivots.
// Opening expands blades synchronously with mechanical precision.
function createMechanicalAperture(
  scene: THREE.Scene,
  z: number,
  outerRadius: number,
  bladeMat1: THREE.Material,
  bladeMat2: THREE.Material,
  keep: <T>(item: T) => T,
) {
  const group = new THREE.Group();
  group.position.z = z;

  // Outer housing ring and collar
  const housing = ring(outerRadius + 0.6, 0.45, bladeMat2, 0, 64);
  const housingCollar = ring(outerRadius + 0.2, 0.15, bladeMat1, -0.1, 64);
  keep(housing.geometry); keep(housingCollar.geometry);
  group.add(housing, housingCollar);

  const numBlades = 8;
  const blades: THREE.Group[] = [];
  const bladeLength = outerRadius * 1.35;
  const bladeWidth = outerRadius * 0.72;

  // Blade shape: tapered curved leaf
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, 0);
  bladeShape.lineTo(bladeWidth * 0.45, bladeLength * 0.35);
  bladeShape.quadraticCurveTo(bladeWidth * 0.95, bladeLength * 0.8, bladeWidth * 0.4, bladeLength);
  bladeShape.lineTo(-bladeWidth * 0.35, bladeLength * 0.75);
  bladeShape.quadraticCurveTo(-bladeWidth * 0.2, bladeLength * 0.3, 0, 0);

  const bladeGeom = keep(new THREE.ExtrudeGeometry(bladeShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  }));

  for (let i = 0; i < numBlades; i++) {
    const angle = (i / numBlades) * Math.PI * 2;
    const bladePivot = new THREE.Group();
    bladePivot.position.set(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius, (i % 2) * 0.1);
    bladePivot.rotation.z = angle + Math.PI / 2;

    const bladeMesh = new THREE.Mesh(bladeGeom, i % 2 === 0 ? bladeMat1 : bladeMat2);
    bladeMesh.rotation.z = 0.22;
    bladePivot.add(bladeMesh);

    group.add(bladePivot);
    blades.push(bladePivot);
  }

  scene.add(group);
  return { group, blades, numBlades, outerRadius };
}

export function StoryTunnelScene({ progressRef, reducedMotionRef }: SceneRefs) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let frame = 0;
    let lastFrame = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let gear: THREE.Group | null = null;
    let dayOne: THREE.Group | null = null;
    let dayTwo: THREE.Group | null = null;
    let ringTrio: THREE.Group | null = null;
    let endPortal: THREE.Group | null = null;
    let endGlow: THREE.Mesh | null = null;
    let openingWarmLight: THREE.PointLight | null = null;
    let openingIris: ReturnType<typeof createMechanicalAperture> | null = null;
    let finaleIris: ReturnType<typeof createMechanicalAperture> | null = null;
    const roleGates: THREE.Group[] = [];
    const stockBars: THREE.Mesh[] = [];

    const resources = new Set<{ dispose?: () => void }>();
    const keep = <T,>(item: T): T => {
      if (item && (typeof item === "object" || typeof item === "function")) resources.add(item as { dispose?: () => void });
      return item;
    };

    const boot = () => {
      try {
        const small = window.innerWidth < 768;
        renderer = new THREE.WebGLRenderer({
          canvas, alpha: true, antialias: !small, powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.0 : 1.35));
        renderer.setSize(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight, false);
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(new THREE.Color("#080a08"), .0032);
        camera = new THREE.PerspectiveCamera(76, innerWidth / Math.max(1, innerHeight), .1, 320);
        camera.position.set(0, 0, 38);
        camera.lookAt(0, 0, 18);

        const weaveMap = keep(makePattern("weave"));
        const metalMap = keep(makePattern("metal"));
        const floorMap = keep(makePattern("floor"));
        if (weaveMap) weaveMap.repeat.set(3, 2);
        if (metalMap) metalMap.repeat.set(2, 4);
        if (floorMap) floorMap.repeat.set(2, 8);

        const metal = keep(new THREE.MeshStandardMaterial({
          color: "#899184", map: metalMap, metalness: .85, roughness: .34,
        }));
        const darkSteel = keep(new THREE.MeshStandardMaterial({
          color: "#1c2320", map: metalMap, metalness: .88, roughness: .45,
        }));
        const copper = keep(new THREE.MeshStandardMaterial({
          color: "#b8734a", metalness: .82, roughness: .26,
          emissive: "#3e190b", emissiveIntensity: .42,
        }));
        const copperGlow = keep(new THREE.MeshStandardMaterial({
          color: "#b8734a", metalness: .34, roughness: .24,
          emissive: "#b8734a", emissiveIntensity: 1.45,
        }));
        const emerald = keep(new THREE.MeshStandardMaterial({
          color: "#0b3d2e", metalness: .78, roughness: .35,
          emissive: "#06271e", emissiveIntensity: .65,
        }));
        const ivoryMetal = keep(new THREE.MeshStandardMaterial({
          color: "#ede7d9", metalness: .6, roughness: .4,
          emissive: "#5c5647", emissiveIntensity: .25,
        }));
        const floorMaterial = keep(new THREE.MeshStandardMaterial({
          color: "#131a15", map: floorMap, metalness: .65, roughness: .25, side: THREE.DoubleSide,
        }));
        const warmPortal = keep(new THREE.MeshBasicMaterial({ color: "#d8c8a6" }));
        const darkBackdrop = keep(new THREE.MeshBasicMaterial({ color: "#080a08", side: THREE.DoubleSide }));

        // --- LIGHTING ---
        scene.add(new THREE.HemisphereLight(0xd5d8c8, 0x0a100c, 1.45));

        const key = new THREE.DirectionalLight(0xe1d4b8, 2.2);
        key.position.set(-8, 10, 12); scene.add(key);

        const edge = new THREE.DirectionalLight(0x3e8a65, 2.2);
        edge.position.set(8, -2, -20); scene.add(edge);

        openingWarmLight = new THREE.PointLight("#ede0c4", 120, 42, 2);
        openingWarmLight.position.set(0, 0, 24);
        scene.add(openingWarmLight);

        const addLight = (color: string, power: number, distance: number, pos: [number, number, number]) => {
          const light = new THREE.PointLight(color, power, distance, 2);
          light.position.set(...pos); scene.add(light);
        };
        addLight("#b8734a", 96, 32, [0, 1.6, -5]);
        addLight("#246b4c", 72, 40, [-5, 4, -30]);
        addLight("#b8734a", 65, 32, [0, 0, -52]);
        addLight("#2e5748", 68, 36, [0, 2, -64]);
        addLight("#b8734a", 62, 30, [0, 0, -74]);
        addLight("#0b3d2e", 80, 38, [0, 3, -94]);
        addLight("#b8734a", 85, 38, [-7, 0, -118]);
        addLight("#e1cda8", 92, 48, [0, 2.5, -148]);
        addLight("#b8734a", 54, 30, [0, 0, -159]);

        // --- CONTINUOUS TUNNEL SHELL ---
        const shellGeometry = keep(new THREE.CylinderGeometry(12.7, 12.7, 138, 64, 1, true));
        shellGeometry.rotateX(Math.PI / 2);
        const shellMaterial = keep(new THREE.MeshStandardMaterial({
          color: "#111a14", map: metalMap, metalness: .78, roughness: .48,
          side: THREE.BackSide, emissive: "#05150d", emissiveIntensity: .6,
        }));
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        shell.position.z = -65; scene.add(shell);

        const floorGeometry = keep(new THREE.PlaneGeometry(25.2, 146));
        floorGeometry.rotateX(-Math.PI / 2);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(0, -12.52, -61); scene.add(floor);

        // Tunnel ribs with copper milestones
        for (let i = 0; i < 31; i++) {
          const z = -4 - i * 4.28;
          const milestone = i % 4 === 0;
          const rib = ring(
            milestone ? 12.12 : 12.34,
            milestone ? .22 : .1,
            milestone ? copper : darkSteel,
            z,
          );
          keep(rib.geometry); scene.add(rib);
          if (milestone) {
            const inner = ring(11.86, .04, copperGlow, z - .11);
            keep(inner.geometry); scene.add(inner);
            const milestoneGlow = new THREE.PointLight("#b8734a", 16, 12, 2);
            milestoneGlow.position.set(0, 0, z);
            scene.add(milestoneGlow);
          }
          if (i % 2 === 0) {
            const geom = keep(new THREE.BoxGeometry(.32, 1.2, .5));
            const brackets = new THREE.InstancedMesh(geom, metal, 12);
            const temp = new THREE.Object3D();
            for (let j = 0; j < 12; j++) {
              const a = j / 12 * Math.PI * 2;
              temp.position.set(Math.cos(a) * 11.93, Math.sin(a) * 11.93, z);
              temp.rotation.set(0, 0, a + Math.PI / 2); temp.updateMatrix();
              brackets.setMatrixAt(j, temp.matrix);
            }
            brackets.instanceMatrix.needsUpdate = true; scene.add(brackets);
          }
        }

        // Longitudinal rails
        for (let j = 0; j < 20; j++) {
          const a0 = j / 20 * Math.PI * 2;
          const points = [];
          for (let k = 0; k <= 9; k++) {
            const z = -2 - k * 14.6;
            const a = a0 + Math.sin(k * .7 + j * .12) * .045;
            points.push(new THREE.Vector3(Math.cos(a) * 11.9, Math.sin(a) * 11.9, z));
          }
          const curve = new THREE.CatmullRomCurve3(points);
          const geom = keep(new THREE.TubeGeometry(curve, 110, j % 4 === 0 ? .09 : .045, 6, false));
          scene.add(new THREE.Mesh(geom, j % 4 === 0 ? copper : emerald));
        }

        // --- SCENE 1: OPENING MECHANICAL IRIS APERTURE (Z = 28) ---
        // Positioned close to camera start (z = 38) so overlapping blades fill the viewport at p = 0
        openingIris = createMechanicalAperture(scene, 28, 8.2, copper, darkSteel, keep);

        // --- SCENE 2: GEAR GATE (Z = -6.6) ---
        gear = new THREE.Group(); gear.position.z = -6.6;
        const gateRings = [
          ring(10.6, .32, darkSteel, 0),
          ring(9.9, .15, copperGlow, -.18),
          ring(7.6, .22, metal, -.38),
          ring(5.4, .16, emerald, -.56),
          ring(3.4, .09, copperGlow, -.82),
        ];
        gateRings.forEach((item) => { keep(item.geometry); gear!.add(item); });
        
        // Prominent, heavy mechanical teeth with high-contrast copper material
        const toothGeometry = keep(new THREE.BoxGeometry(1.2, .48, .85));
        const teeth = new THREE.InstancedMesh(toothGeometry, copperGlow, 36);
        const tooth = new THREE.Object3D();
        for (let i = 0; i < 36; i++) {
          const a = (i / 36) * Math.PI * 2;
          tooth.position.set(Math.cos(a) * 10.7, Math.sin(a) * 10.7, 0);
          tooth.rotation.set(0, 0, a);
          tooth.updateMatrix();
          teeth.setMatrixAt(i, tooth.matrix);
        }
        teeth.instanceMatrix.needsUpdate = true; gear.add(teeth);

        // Heavy counter-rotating inner planetary spoke hub
        const spokeGeometry = keep(new THREE.BoxGeometry(4.2, .18, .28));
        for (let i = 0; i < 8; i++) {
          const spoke = new THREE.Mesh(spokeGeometry, copper);
          const a = (i / 8) * Math.PI * 2;
          spoke.position.set(Math.cos(a) * 4.1, Math.sin(a) * 4.1, -.28);
          spoke.rotation.z = a;
          gear.add(spoke);
        }
        scene.add(gear);

        // --- SCENE 4: FIVE DISTINCT C-SUITE GATES (Z = -45 to -68) ---
        // Scaled up to 6.2 units and lit with dedicated overhead marker lights.
        // 0: CEO (Crown / Crest Diamond), 1: CFO (Hexagonal Valuation Vault),
        // 2: CMO (Radial Broadcast Prism), 3: COO (Interlocking Meshed Gear Train), 4: CTO (Octagonal Tech Matrix)
        const roleZ = [-46, -51.5, -57, -62.5, -68];
        const roleNames = ["CEO", "CFO", "CMO", "COO", "CTO"];
        
        for (let r = 0; r < 5; r++) {
          const roleGroup = new THREE.Group();
          roleGroup.position.z = roleZ[r];

          // Dedicated overhead spotlight for each C-suite gate
          const roleSpot = new THREE.PointLight(r % 2 === 0 ? "#b8734a" : "#2e5748", 45, 18, 2);
          roleSpot.position.set(0, 5.5, roleZ[r] + 1);
          scene.add(roleSpot);

          // Horizontal architectural floor support beam
          const beamGeom = keep(new THREE.BoxGeometry(14, .32, .45));
          const beam = new THREE.Mesh(beamGeom, darkSteel);
          beam.position.set(0, -6.5, 0);
          roleGroup.add(beam);

          // Heavy vertical portal pillars
          const pillarGeom = keep(new THREE.BoxGeometry(.45, 13, .55));
          const leftPillar = new THREE.Mesh(pillarGeom, copper);
          leftPillar.position.set(-6.8, 0, 0);
          const rightPillar = new THREE.Mesh(pillarGeom, copper);
          rightPillar.position.set(6.8, 0, 0);
          roleGroup.add(leftPillar, rightPillar);

          if (r === 0) {
            // CEO: Royal Crest diamond gate
            const diamondGeom = keep(new THREE.TorusGeometry(5.8, .28, 4, 4));
            diamondGeom.rotateZ(Math.PI / 4);
            const diamond = new THREE.Mesh(diamondGeom, copperGlow);
            const innerRing = ring(4.5, .08, darkSteel, -.12, 64);
            roleGroup.add(diamond, innerRing);
          } else if (r === 1) {
            // CFO: Hexagonal Valuation Vault gate
            const hexGeom = keep(new THREE.TorusGeometry(5.6, .3, 6, 6));
            const hex = new THREE.Mesh(hexGeom, copper);
            const innerTicker = ring(4.5, .09, emerald, -.12, 64);
            roleGroup.add(hex, innerTicker);
          } else if (r === 2) {
            // CMO: Waveform Broadcast aperture
            const waveRing = ring(5.6, .26, ivoryMetal, 0, 72);
            for (let b = 0; b < 8; b++) {
              const fin = new THREE.Mesh(keep(new THREE.BoxGeometry(.22, 2.6, .12)), copperGlow);
              const angle = (b / 8) * Math.PI * 2;
              fin.position.set(Math.cos(angle) * 5.4, Math.sin(angle) * 5.4, -.06);
              fin.rotation.z = angle;
              roleGroup.add(fin);
            }
            roleGroup.add(waveRing);
          } else if (r === 3) {
            // COO: Clockwork Meshed Gear Train gate
            const gearRing = ring(5.5, .32, darkSteel, 0, 72);
            for (let g = 0; g < 24; g++) {
              const cog = new THREE.Mesh(keep(new THREE.BoxGeometry(.5, .25, .35)), copperGlow);
              const angle = (g / 24) * Math.PI * 2;
              cog.position.set(Math.cos(angle) * 5.6, Math.sin(angle) * 5.6, 0);
              cog.rotation.z = angle;
              roleGroup.add(cog);
            }
            roleGroup.add(gearRing);
          } else {
            // CTO: Octagonal Tech Grid Matrix
            const octGeom = keep(new THREE.TorusGeometry(5.6, .28, 8, 8));
            const oct = new THREE.Mesh(octGeom, emerald);
            const coreSpokeX = new THREE.Mesh(keep(new THREE.BoxGeometry(10.5, .14, .14)), copperGlow);
            const coreSpokeY = new THREE.Mesh(keep(new THREE.BoxGeometry(.14, 10.5, .14)), copperGlow);
            roleGroup.add(oct, coreSpokeX, coreSpokeY);
          }

          scene.add(roleGroup);
          roleGates.push(roleGroup);
        }

        // --- SCENE 4b: DAY 1 - STOCK MARKET & BOARDROOM CRISIS (Z = -74) ---
        // 3D Volumetric Financial Candlestick / Order-Book Depth Terrain along the corridor floor & walls
        dayOne = new THREE.Group(); dayOne.position.z = -74;

        // Central Floor Market Arch
        const marketArch = ring(4.8, .16, copperGlow, 0, 64);
        dayOne.add(marketArch);

        // 3D Financial Candlestick / Volumetric Depth bars flanked on both sides of corridor
        const candleGeom = keep(new THREE.BoxGeometry(.42, 1, .42));
        const barHeights = [2.2, 4.1, 1.6, 5.4, 3.2, 4.8, 2.7, 6.1, 3.8, 5.0];
        for (let i = 0; i < barHeights.length; i++) {
          const h = barHeights[i];
          const isUp = i % 3 !== 1;
          const barMesh = new THREE.Mesh(candleGeom, isUp ? emerald : copper);
          const side = i % 2 === 0 ? -1 : 1;
          const x = side * (5.5 + (i * 0.45));
          const zOffset = (i - 5) * 1.8;
          barMesh.scale.set(1, h, 1);
          barMesh.position.set(x, -6.5 + (h / 2), zOffset);
          dayOne.add(barMesh);
          stockBars.push(barMesh);
        }
        scene.add(dayOne);

        // --- SCENE 4c: DAY 2 - INVESTOR MARKETPLACE ROTUNDA (Z = -94) ---
        // Inspired directly by the emerald-and-copper Business Conclave stage photo:
        // Majestic architectural rotunda with 6 vertical copper light columns framing the portal.
        dayTwo = new THREE.Group(); dayTwo.position.z = -94;

        const conclavePortal = ring(4.8, .22, copper, 0, 80);
        const innerConclaveRing = ring(4.2, .08, copperGlow, -.15, 80);
        dayTwo.add(conclavePortal, innerConclaveRing);

        // 6 Vertical architectural illuminated light columns (seen in Business Conclave reference photo)
        const colGeom = keep(new THREE.BoxGeometry(.28, 11.5, .32));
        for (let c = 0; c < 6; c++) {
          const colMesh = new THREE.Mesh(colGeom, c % 2 === 0 ? copper : emerald);
          const x = (c - 2.5) * 2.8;
          colMesh.position.set(x, 0, -.3);
          dayTwo.add(colMesh);
        }
        scene.add(dayTwo);

        // --- SCENE 5: THREE-RING TRIPTYCH (BUILD / MOVE / FUND) (Z = -116) ---
        ringTrio = new THREE.Group(); ringTrio.position.z = -116;
        const triad = [
          { x: -7.35, r: 3.5, material: copperGlow },
          { x: 0, r: 4.05, material: emerald },
          { x: 7.35, r: 3.5, material: ivoryMetal },
        ];
        const triptychBeamGeom = keep(new THREE.BoxGeometry(20.5, .28, .36));
        const triptychBeam = new THREE.Mesh(triptychBeamGeom, darkSteel);
        triptychBeam.position.set(0, -4.6, -.1);
        ringTrio.add(triptychBeam);

        triad.forEach((item, index) => {
          const outer = ring(item.r, .18, item.material, 0, 80);
          const inner = ring(item.r - .36, .05, darkSteel, -.18, 72);
          outer.position.x = inner.position.x = item.x;
          const bridge = new THREE.Mesh(keep(new THREE.BoxGeometry(.08, item.r * 1.7, .12)), index === 1 ? copperGlow : darkSteel);
          bridge.position.set(item.x, 0, -.08);

          const pylonGeom = keep(new THREE.BoxGeometry(.22, 2.2, .24));
          const pylon = new THREE.Mesh(pylonGeom, copper);
          pylon.position.set(item.x, -item.r - 0.4, -.08);

          [outer, inner, bridge, pylon].forEach((part) => {
            if (part.geometry) keep(part.geometry);
            ringTrio!.add(part);
          });
        });
        scene.add(ringTrio);

        // --- SCENE 6: FINALE MECHANICAL IRIS & CALM CHAMBER (Z = -142 to -164) ---
        finaleIris = createMechanicalAperture(scene, -142, 8.5, copperGlow, darkSteel, keep);

        const endWall = new THREE.Mesh(keep(new THREE.PlaneGeometry(48, 38)), darkBackdrop);
        endWall.position.z = -164.5; scene.add(endWall);
        endPortal = new THREE.Group(); endPortal.position.z = -160.8;
        [
          ring(7.25, .18, copper, 0, 120),
          ring(6.75, .065, copperGlow, -.08, 120),
          ring(5.98, .04, warmPortal, -.14, 120),
        ].forEach((part) => { keep(part.geometry); endPortal!.add(part); });
        scene.add(endPortal);
        const endGlowMat = keep(new THREE.MeshBasicMaterial({
          color: "#b69e79", transparent: true, opacity: .16, side: THREE.DoubleSide,
        }));
        endGlow = new THREE.Mesh(keep(new THREE.CircleGeometry(5.82, 96)), endGlowMat);
        endGlow.position.z = -160.55; scene.add(endGlow);

        for (let i = 0; i < 7; i++) {
          const marker = new THREE.Mesh(
            keep(new THREE.BoxGeometry(.065, .035, 3.2)),
            i % 2 === 0 ? copperGlow : emerald,
          );
          marker.position.set(0, -12.35, -139 - i * 2.4); scene.add(marker);
        }

        // Bolts
        const boltGeometry = keep(new THREE.SphereGeometry(.08, 8, 6));
        const bolts = new THREE.InstancedMesh(boltGeometry, copperGlow, 128);
        const bolt = new THREE.Object3D();
        let idx = 0;
        for (let i = 0; i < 31; i += 2) {
          const z = -4 - i * 4.28;
          for (let j = 0; j < 8; j++) {
            const a = j / 8 * Math.PI * 2;
            bolt.position.set(Math.cos(a) * 12.02, Math.sin(a) * 12.02, z);
            bolt.updateMatrix(); bolts.setMatrixAt(idx++, bolt.matrix);
          }
        }
        bolts.count = idx; bolts.instanceMatrix.needsUpdate = true; scene.add(bolts);

        // --- RESIZE HANDLER ---
        const onResize = () => {
          if (!renderer || !camera || cancelled) return;
          const w = Math.max(1, canvas.clientWidth || innerWidth);
          const h = Math.max(1, canvas.clientHeight || innerHeight);
          camera.aspect = w / h; camera.updateProjectionMatrix();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.0 : 1.35));
          renderer.setSize(w, h, false);
        };
        window.addEventListener("resize", onResize);
        (canvas as HTMLCanvasElement & { __cleanup?: () => void }).__cleanup = () => window.removeEventListener("resize", onResize);

        // --- RENDER LOOP ---
        const render = (now: number) => {
          if (cancelled) return;
          const reduced = reducedMotionRef.current;
          const fpsInterval = window.innerWidth < 768 ? 1000 / 30 : 1000 / 45;
          if (!document.hidden && now - lastFrame >= fpsInterval) {
            lastFrame = now;
            const p = progressRef.current;
            const t = reduced ? 0 : now / 1000;

            // Multi-directional cinematic camera flight path:
            // S-curves horizontally (X), elevates and swoops over stations (Y), and banks dynamically (roll Z)
            const camZ = 38 - p * 190;
            
            // Gateway dampening: broad sweeping flight between stations, but smoothly aligned
            // when passing through key gates: Opening Iris (p ≈ 0.05), Gear Gate (p ≈ 0.235), Finale Portal (p ≈ 0.95)
            const gateDamp = Math.max(0.2, 1 - 0.45 * Math.exp(-Math.pow((p - 0.235) / 0.06, 2))
                                             - 0.65 * Math.exp(-Math.pow((p - 0.05) / 0.05, 2))
                                             - 0.55 * Math.exp(-Math.pow((p - 0.95) / 0.06, 2)));

            // Smoothly align and center the camera straight ahead for the finale calm chamber
            const finaleCenter = smooth(0.83, 0.96, p);

            // Horizontal sway: swoops left towards Boardroom, right towards Stock Market, centers at Ring Triad & Finale
            const camX = (Math.sin(p * Math.PI * 3.2) * 1.85 + Math.sin(p * Math.PI * 1.5) * 0.95) * gateDamp * (1 - finaleCenter);
            // Vertical pitch: elevates over the opening gate, dips towards the boardroom table, climbs into rotunda, levels at Finale
            const camY = (Math.cos(p * Math.PI * 2.8) * 0.85 + Math.sin(p * Math.PI * 5.0) * 0.35) * gateDamp * (1 - finaleCenter);
            camera!.position.set(camX, camY, camZ);

            // Dynamic look-ahead with banking & yaw towards upcoming stations, centering at Finale
            const lookTargetX = Math.sin((p + 0.04) * Math.PI * 3.2) * 1.1 * gateDamp * (1 - finaleCenter);
            const lookTargetY = Math.cos((p + 0.04) * Math.PI * 2.8) * 0.45 * gateDamp * (1 - finaleCenter);
            camera!.lookAt(lookTargetX, lookTargetY, camZ - 22);

            // Camera roll / bank into horizontal curves (like an aerial drone / cinematic dolly), leveling at Finale
            if (!reduced) {
              const bankAngle = -Math.cos(p * Math.PI * 3.2) * 0.075 * gateDamp * (1 - finaleCenter);
              camera!.rotation.z = bankAngle;
            }

            // Gear rotation: Continuous mechanical spin + strong acceleration from scroll movement
            gear!.rotation.z = reduced ? 0 : (t * 0.75) + (p * Math.PI * 14.0);
            dayOne!.rotation.z = reduced ? 0 : smooth(.52, .65, p) * .035;
            dayTwo!.rotation.z = reduced ? 0 : -smooth(.62, .76, p) * .045;
            ringTrio!.rotation.z = reduced ? 0 : smooth(.68, .84, p) * .035;
            endPortal!.rotation.z = reduced ? 0 : smooth(.82, 1, p) * .04;
            (endGlow!.material as THREE.MeshBasicMaterial).opacity = .08 + smooth(.85, .99, p) * .28;

            // Animate Opening Iris: Starts closed, rotates blades outwards visibly across p = 0.01 -> 0.18
            if (openingIris) {
              const irisOpen = smooth(.01, .18, p);
              openingIris.blades.forEach((blade, index) => {
                const baseRot = (index / openingIris!.numBlades) * Math.PI * 2 + Math.PI / 2;
                blade.rotation.z = baseRot + (irisOpen * 1.85);
              });
            }

            // Animate Finale Iris: Closes/opens into the quiet portal as progress moves 0.80 -> 0.96
            if (finaleIris) {
              const finaleOpen = smooth(.80, .96, p);
              finaleIris.blades.forEach((blade, index) => {
                const baseRot = (index / finaleIris!.numBlades) * Math.PI * 2 + Math.PI / 2;
                blade.rotation.z = baseRot + (finaleOpen * 1.35);
              });
            }

            // Animate Dynamic Financial Candlestick Pulses (Stock Market fluctuation)
            if (!reduced && stockBars.length > 0) {
              for (let s = 0; s < stockBars.length; s++) {
                const pulse = 1 + Math.sin(t * 2.4 + s * 1.1) * 0.12;
                stockBars[s].scale.y = pulse * (2 + (s % 4));
              }
            }

            // Animate Role Gates subtly on approach
            roleGates.forEach((gate, gIdx) => {
              gate.rotation.z = reduced ? 0 : Math.sin(t * 0.8 + gIdx) * 0.08;
            });

            // Fade opening warm light as mechanical iris opens
            if (openingWarmLight) {
              openingWarmLight.intensity = 120 * (1 - smooth(.04, .2, p));
            }

            renderer!.render(scene!, camera!);
          }
          frame = window.requestAnimationFrame(render);
        };
        frame = window.requestAnimationFrame(render);
      } catch (error) {
        console.warn("3D scene initialisation failed; keeping the CSS backdrop visible.", error);
        canvas.style.display = "none";
      }
    };

    boot();
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      (canvas as HTMLCanvasElement & { __cleanup?: () => void }).__cleanup?.();
      if (scene) scene.traverse((object: THREE.Object3D) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry && !resources.has(mesh.geometry)) mesh.geometry.dispose?.();
      });
      resources.forEach((resource) => resource?.dispose?.());
      renderer?.dispose?.();
    };
  }, [progressRef, reducedMotionRef]);

  return <canvas ref={canvasRef} className="fa-story-canvas" aria-hidden="true" />;
}
