import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type SceneRefs = {
  progressRef: { current: number };
  reducedMotionRef: { current: boolean };
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / Math.max(0.0001, b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function makePattern(kind: "weave" | "metal" | "floor" | "wood" | "leather") {
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
    g.addColorStop(0, "#2a201a"); g.addColorStop(.5, "#181310"); g.addColorStop(1, "#241c16");
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);

    // Fine-line undulating guilloche curves
    for (let i = 0; i < 512; i += 8) {
      x.strokeStyle = i % 24 === 0 ? "rgba(184,115,74,.24)" : "rgba(220,185,150,.12)";
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
  } else if (kind === "wood") {
    // Rich architectural American walnut grain with warm amber/caramel undertones
    x.fillStyle = "#4a2a16";
    x.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 2) {
      const gAlpha = 0.15 + Math.sin(y * 0.035) * 0.09 + Math.sin(y * 0.12) * 0.04;
      x.fillStyle = `rgba(195, 120, 65, ${Math.max(0, gAlpha)})`;
      x.fillRect(0, y, 512, 2);
    }
    for (let i = 0; i < 160; i++) {
      x.strokeStyle = i % 2 === 0 ? "rgba(42, 22, 10, 0.45)" : "rgba(235, 175, 110, 0.2)";
      x.lineWidth = i % 3 === 0 ? 1.5 : 0.8;
      x.beginPath();
      const startY = (i * 19) % 512;
      x.moveTo(0, startY);
      for (let px = 0; px <= 512; px += 24) {
        const wave = Math.sin(px * 0.018 + i) * 6;
        x.lineTo(px, startY + wave);
      }
      x.stroke();
    }
  } else if (kind === "leather") {
    // Executive saddle cognac leather with fine natural grain and highlights
    x.fillStyle = "#422514";
    x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2000; i++) {
      const rx = (i * 97) % 512;
      const ry = (i * 157) % 512;
      x.fillStyle = i % 2 === 0 ? "rgba(240, 190, 145, 0.14)" : "rgba(25, 12, 6, 0.38)";
      x.fillRect(rx, ry, 2, 2);
    }
  } else {
    x.fillStyle = "#161311"; x.fillRect(0, 0, 512, 512);
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

function makeHudTexture(header: string, title: string, detail: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  // Dark brushed executive bronze slate
  ctx.fillStyle = "rgba(22, 20, 18, 0.96)";
  ctx.fillRect(0, 0, 512, 256);

  // Warm champagne brass border & bevel
  ctx.strokeStyle = "rgba(212, 155, 99, 0.75)";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(8, 8, 496, 240);

  ctx.strokeStyle = "rgba(184, 115, 74, 0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(14, 14, 484, 228);

  // Header tag in warm copper
  ctx.fillStyle = "#d49b63";
  ctx.font = "bold 15px 'Courier New', monospace";
  ctx.fillText(header, 28, 48);

  // Main title in letterpress warm ivory
  ctx.fillStyle = "#f7f4d5";
  ctx.font = "bold 23px 'Times New Roman', serif";
  ctx.fillText(title, 28, 106);

  // Detail / editorial notes
  ctx.fillStyle = "rgba(237, 231, 217, 0.88)";
  ctx.font = "15px 'Courier New', monospace";
  ctx.fillText(detail, 28, 160);

  // Subtext / executive status in brushed bronze
  ctx.fillStyle = "#b8734a";
  ctx.font = "13px 'Courier New', monospace";
  ctx.fillText("EXECUTIVE MANDATE // FOUNDERS' AFFAIR 2026", 28, 212);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function ring(radius: number, tube: number, material: THREE.Material, z: number, segments = 88) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, segments), material);
  mesh.position.z = z;
  return mesh;
}

// --- YUKIHATSUNE-INSPIRED 8-BLADE INDUSTRIAL BULKHEAD IRIS GATE ---
// Engineered industrial circular gate with:
// 1. Heavy cylindrical bulkhead collar with 16 radial locking lugs and circumferential hex bolts.
// 2. Concentric copper drive track and guide channel.
// 3. 8 mechanical pivot knuckles with cylindrical hinge pins and radial linkages.
// 4. 8 swept, curved bulkhead blades with stepped overlapping laps, raised copper reinforcing spines, and bevelled edges.
// 5. Precise radial retraction motion revealing the central tunnel portal.
function createMechanicalAperture(
  scene: THREE.Scene,
  z: number,
  outerRadius: number,
  copperMat: THREE.Material,
  steelMat: THREE.Material,
  keep: <T>(item: T) => T,
) {
  const group = new THREE.Group();
  group.position.z = z;

  // 1. Heavy outer cylindrical bulkhead housing
  const mainHousing = ring(outerRadius + 0.95, 0.48, steelMat, 0, 80);
  const copperDriveTrack = ring(outerRadius + 0.42, 0.16, copperMat, -0.06, 80);
  const innerBearingCollar = ring(outerRadius + 0.12, 0.09, steelMat, -0.12, 80);
  keep(mainHousing.geometry); keep(copperDriveTrack.geometry); keep(innerBearingCollar.geometry);
  group.add(mainHousing, copperDriveTrack, innerBearingCollar);

  // 2. 16 Perimeter radial locking lugs & hex bolts around the bulkhead frame
  const lugGeom = keep(new THREE.BoxGeometry(0.38, 0.72, 0.36));
  const boltGeom = keep(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 6));
  for (let k = 0; k < 16; k++) {
    const lugAngle = (k / 16) * Math.PI * 2;
    const lug = new THREE.Mesh(lugGeom, k % 2 === 0 ? copperMat : steelMat);
    lug.position.set(Math.cos(lugAngle) * (outerRadius + 1.15), Math.sin(lugAngle) * (outerRadius + 1.15), -0.02);
    lug.rotation.z = lugAngle;
    group.add(lug);

    const bolt = new THREE.Mesh(boltGeom, copperMat);
    bolt.position.set(Math.cos(lugAngle) * (outerRadius + 0.65), Math.sin(lugAngle) * (outerRadius + 0.65), 0.16);
    bolt.rotation.x = Math.PI / 2;
    group.add(bolt);
  }

  // 3. 8 Mechanical Pivot Knuckles & Actuators
  const knuckleGeom = keep(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 18));
  const pinGeom = keep(new THREE.CylinderGeometry(0.12, 0.12, 0.32, 8));
  const linkGeom = keep(new THREE.BoxGeometry(0.16, 0.68, 0.12));

  // 4. Swept, curved bulkhead blade shape (smooth interlocking curve with stepped overlap)
  const numBlades = 8;
  const blades: THREE.Group[] = [];
  const bladeLength = outerRadius * 1.38;
  const bladeWidth = outerRadius * 0.74;

  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, 0); // Root at pivot knuckle
  bladeShape.quadraticCurveTo(bladeWidth * 0.38, bladeLength * 0.22, bladeWidth * 0.58, bladeLength * 0.48);
  bladeShape.quadraticCurveTo(bladeWidth * 0.78, bladeLength * 0.82, bladeWidth * 0.32, bladeLength);
  bladeShape.quadraticCurveTo(-bladeWidth * 0.12, bladeLength * 0.75, -bladeWidth * 0.28, bladeLength * 0.45);
  bladeShape.quadraticCurveTo(-bladeWidth * 0.22, bladeLength * 0.18, 0, 0);

  const bladeGeom = keep(new THREE.ExtrudeGeometry(bladeShape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  }));

  // Raised structural reinforcing rib running along the centerline of each blade
  const spineGeom = keep(new THREE.BoxGeometry(0.11, bladeLength * 0.76, 0.06));

  for (let i = 0; i < numBlades; i++) {
    const angle = (i / numBlades) * Math.PI * 2;
    const bladePivot = new THREE.Group();
    // Offset each blade slightly in Z so they slide past each other cleanly like a genuine iris
    const zLayer = ((i % 4) - 1.5) * 0.08;
    bladePivot.position.set(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius, zLayer);
    bladePivot.rotation.z = angle + Math.PI / 2;

    // The blade plate
    const isCopper = i % 2 === 0;
    const bladeMesh = new THREE.Mesh(bladeGeom, isCopper ? copperMat : steelMat);
    bladeMesh.rotation.z = 0.22;
    bladePivot.add(bladeMesh);

    // Structural reinforcing spine catching highlights
    const spine = new THREE.Mesh(spineGeom, isCopper ? steelMat : copperMat);
    spine.position.set(bladeWidth * 0.12, bladeLength * 0.52, 0.09);
    spine.rotation.z = -0.16;
    bladePivot.add(spine);

    // Hinge Knuckle assembly at blade root
    const knuckle = new THREE.Mesh(knuckleGeom, copperMat);
    knuckle.rotation.x = Math.PI / 2;
    bladePivot.add(knuckle);

    const pin = new THREE.Mesh(pinGeom, steelMat);
    pin.rotation.x = Math.PI / 2;
    bladePivot.add(pin);

    // Mechanical linkage arm reaching to outer collar
    const link = new THREE.Mesh(linkGeom, steelMat);
    link.position.set(0, -0.32, 0);
    bladePivot.add(link);

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
    let boardroomGroup: THREE.Group | null = null;
    const gearGlints: THREE.Group[] = [];

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
        const woodMap = keep(makePattern("wood"));
        const leatherMap = keep(makePattern("leather"));
        if (weaveMap) weaveMap.repeat.set(3, 2);
        if (metalMap) metalMap.repeat.set(2, 4);
        if (floorMap) floorMap.repeat.set(2, 8);
        if (woodMap) woodMap.repeat.set(3, 2);
        if (leatherMap) leatherMap.repeat.set(2, 2);

        // --- EXECUTIVE ARCHITECTURAL PALETTE (RICH WALNUT, COGNAC & CHAMPAGNE BRASS) ---
        // Warm Walnut: Deep American Walnut (#4a2c1a), Warm Mahogany (#382217)
        // Accent Metals: Champagne Brass (#e6b77c), Antique Bronze (#c88a50), Brushed Copper (#b8734a)
        // Leather: Executive Cognac / Saddle Leather (#744326 / #8a522e)
        // Set against deep Obsidian Noir (#0e0c0b) & Smoked Espresso Charcoal (#181412)
        const gateMint = keep(new THREE.MeshStandardMaterial({
          color: "#c88a50", metalness: .82, roughness: .24,
          emissive: "#4a2410", emissiveIntensity: .65,
        }));
        const gateLuminous = keep(new THREE.MeshStandardMaterial({
          color: "#e6b77c", metalness: .88, roughness: .2,
          emissive: "#6e3f19", emissiveIntensity: .85,
        }));
        const gateTeal = keep(new THREE.MeshStandardMaterial({
          color: "#54331d", metalness: .65, roughness: .32,
          emissive: "#2e190d", emissiveIntensity: .5,
        }));
        const darkSteel = keep(new THREE.MeshStandardMaterial({
          color: "#1c1917", map: metalMap, metalness: .88, roughness: .42,
        }));
        const charcoal = keep(new THREE.MeshStandardMaterial({
          color: "#181412", map: metalMap, metalness: .82, roughness: .5,
        }));
        const deepBlack = keep(new THREE.MeshStandardMaterial({
          color: "#0e0c0b", metalness: .9, roughness: .6,
        }));
        const emerald = keep(new THREE.MeshStandardMaterial({
          color: "#4a2c1a", metalness: .78, roughness: .35,
          emissive: "#24130a", emissiveIntensity: .65,
        }));
        const emeraldGlow = keep(new THREE.MeshStandardMaterial({
          color: "#d48e50", metalness: .45, roughness: .22,
          emissive: "#6e3f19", emissiveIntensity: 1.1,
        }));
        const sage = keep(new THREE.MeshStandardMaterial({
          color: "#382217", metalness: .75, roughness: .38,
          emissive: "#1a0d07", emissiveIntensity: .5,
        }));
        const metal = keep(new THREE.MeshStandardMaterial({
          color: "#4a2c1a", map: metalMap, metalness: .82, roughness: .32,
        }));
        const floorMaterial = keep(new THREE.MeshStandardMaterial({
          color: "#141210", map: floorMap, metalness: .65, roughness: .35, side: THREE.DoubleSide,
        }));
        const warmPortal = keep(new THREE.MeshBasicMaterial({ color: "#d49b63" }));
        const darkBackdrop = keep(new THREE.MeshBasicMaterial({ color: "#0c0a09", side: THREE.DoubleSide }));
        const copperMat = keep(new THREE.MeshStandardMaterial({
          color: "#b8734a", metalness: .85, roughness: .24,
          emissive: "#4a2410", emissiveIntensity: .65,
        }));
        const walnutWood = keep(new THREE.MeshStandardMaterial({
          color: "#8a522e", map: woodMap, metalness: 0.08, roughness: 0.28,
        }));
        const executiveLeather = keep(new THREE.MeshStandardMaterial({
          color: "#744326", map: leatherMap, metalness: 0.1, roughness: 0.44,
        }));
        const chromeMetal = keep(new THREE.MeshStandardMaterial({
          color: "#f0f4f7", metalness: 0.98, roughness: 0.12,
        }));

        // --- ATMOSPHERIC WARM EXECUTIVE ARCHITECTURAL LIGHTING ---
        scene.add(new THREE.HemisphereLight(0xfff6ea, 0x141615, 1.45));

        const key = new THREE.DirectionalLight(0xffeedb, 2.2);
        key.position.set(-8, 10, 12); scene.add(key);

        const edge = new THREE.DirectionalLight(0xd49b63, 1.8);
        edge.position.set(8, -2, -20); scene.add(edge);

        openingWarmLight = new THREE.PointLight("#fff5ea", 140, 48, 2);
        openingWarmLight.position.set(0, 0, 24);
        scene.add(openingWarmLight);

        const addLight = (color: string, power: number, distance: number, pos: [number, number, number]) => {
          const light = new THREE.PointLight(color, power, distance, 2);
          light.position.set(...pos); scene?.add(light);
        };
        addLight("#fff6ea", 95, 36, [0, 2.5, -5]);
        addLight("#ffdcb0", 90, 36, [-5, 3.5, -25]);
        addLight("#fff4e0", 85, 32, [0, 2.5, -36]);
        addLight("#fff4e0", 85, 32, [0, 2.5, -72]);
        addLight("#ffdcb0", 90, 36, [0, 2.5, -88]);
        addLight("#fff6ea", 95, 38, [0, 2.5, -106]);
        addLight("#ffdcb0", 90, 38, [-5, 2.5, -125]);
        addLight("#fff6ea", 95, 42, [0, 2.5, -148]);
        addLight("#ffdcb0", 80, 32, [0, 2, -159]);

        // --- CONTINUOUS TUNNEL SHELL ---
        const shellGeometry = keep(new THREE.CylinderGeometry(12.7, 12.7, 138, 64, 1, true));
        shellGeometry.rotateX(Math.PI / 2);
        const shellMaterial = keep(new THREE.MeshStandardMaterial({
          color: "#0a0d0b", map: metalMap, metalness: .82, roughness: .52,
          side: THREE.BackSide, emissive: "#041009", emissiveIntensity: .6,
        }));
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        shell.position.z = -65; scene.add(shell);

        const floorGeometry = keep(new THREE.PlaneGeometry(25.2, 146));
        floorGeometry.rotateX(-Math.PI / 2);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(0, -12.52, -61); scene.add(floor);

        // Tunnel ribs with green & black milestones
        for (let i = 0; i < 31; i++) {
          const z = -4 - i * 4.28;
          const milestone = i % 4 === 0;
          const rib = ring(
            milestone ? 12.12 : 12.34,
            milestone ? .22 : .1,
            milestone ? copperMat : darkSteel,
            z,
          );
          keep(rib.geometry); scene.add(rib);
          if (milestone) {
            const inner = ring(11.86, .04, gateLuminous, z - .11);
            keep(inner.geometry); scene.add(inner);
            const milestoneGlow = new THREE.PointLight("#d49b63", 22, 14, 2);
            milestoneGlow.position.set(0, 0, z);
            scene.add(milestoneGlow);
          }
          if (i % 2 === 0) {
            const geom = keep(new THREE.BoxGeometry(.32, 1.2, .5));
            const brackets = new THREE.InstancedMesh(geom, charcoal, 12);
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
          scene.add(new THREE.Mesh(geom, j % 4 === 0 ? copperMat : darkSteel));
        }

        // --- SCENE 1: OPENING MECHANICAL IRIS APERTURE (Z = 28) ---
        // Warm brushed copper and dark steel blades
        openingIris = createMechanicalAperture(scene, 28, 8.2, copperMat, darkSteel, keep);

        // Optional custom model drop-in: if the user places iris-door.glb in /public/, load it
        try {
          const gltfLoader = new GLTFLoader();
          gltfLoader.load(
            "/iris-door.glb",
            (gltf) => {
              if (cancelled || !openingIris) return;
              gltf.scene.position.set(0, 0, 28);
              gltf.scene.scale.set(4, 4, 4);
              openingIris.group.visible = false;
              scene!.add(gltf.scene);
            },
            undefined,
            () => {
              // Procedural bulkhead iris remains active
            }
          );
        } catch {
          // Procedural bulkhead iris remains active
        }

        // --- SCENE 2: GEAR GATE (Z = -6.6) ---
        // High-contrast warm copper & champagne brass with dark steel
        gear = new THREE.Group(); gear.position.z = -6.6;
        const gateRings = [
          ring(10.6, .32, deepBlack, 0),
          ring(9.9, .15, copperMat, -.18),
          ring(7.6, .22, gateMint, -.38),
          ring(5.4, .16, darkSteel, -.56),
          ring(3.4, .09, gateLuminous, -.82),
        ];
        gateRings.forEach((item) => { keep(item.geometry); gear!.add(item); });
        
        // High-visibility warm copper drive teeth that pop crisply against dark space
        const toothGeometry = keep(new THREE.BoxGeometry(1.2, .48, .85));
        const teeth = new THREE.InstancedMesh(toothGeometry, copperMat, 36);
        const tooth = new THREE.Object3D();
        for (let i = 0; i < 36; i++) {
          const a = (i / 36) * Math.PI * 2;
          tooth.position.set(Math.cos(a) * 10.7, Math.sin(a) * 10.7, 0);
          tooth.rotation.set(0, 0, a);
          tooth.updateMatrix();
          teeth.setMatrixAt(i, tooth.matrix);
        }
        teeth.instanceMatrix.needsUpdate = true; gear.add(teeth);

        // Heavy counter-rotating inner spoke hub in warm Copper & Champagne Brass
        const spokeGeometry = keep(new THREE.BoxGeometry(4.2, .18, .28));
        for (let i = 0; i < 8; i++) {
          const spoke = new THREE.Mesh(spokeGeometry, i % 2 === 0 ? copperMat : gateLuminous);
          const a = (i / 8) * Math.PI * 2;
          spoke.position.set(Math.cos(a) * 4.1, Math.sin(a) * 4.1, -.28);
          spoke.rotation.z = a;
          gear.add(spoke);
        }
        scene.add(gear);

        // --- 4-POINT SPECULAR STAR GLINTS (Ten Pound Feather optical glints) ---
        // Sharp 4-ray optical glints reflecting off rotating metal drive teeth and gate keystones
        const starMat = keep(new THREE.MeshBasicMaterial({
          color: "#fff6ea",
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }));
        const vRayGeom = keep(new THREE.PlaneGeometry(0.12, 2.2));
        const hRayGeom = keep(new THREE.PlaneGeometry(2.2, 0.12));
        const coreGeom = keep(new THREE.PlaneGeometry(0.48, 0.48));

        const createStarGlint = (scale = 1.0) => {
          const group = new THREE.Group();
          const v = new THREE.Mesh(vRayGeom, starMat);
          const h = new THREE.Mesh(hRayGeom, starMat);
          const c = new THREE.Mesh(coreGeom, starMat);
          c.rotation.z = Math.PI / 4;
          group.add(v, h, c);
          group.scale.setScalar(scale);
          return group;
        };

        // 4 cardinal optical star glints stationed around the Gear Gate rim (top, bottom, left, right)
        const gearGlintAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
        gearGlintAngles.forEach((angle) => {
          const glint = createStarGlint(0.85);
          glint.position.set(Math.cos(angle) * 10.7, Math.sin(angle) * 10.7, -6.5);
          scene!.add(glint);
          gearGlints.push(glint);
        });

        // --- SCENE 3: ATRIUM GALLERY (Z = -14 to -36) ---
        // Flush architectural bronze wall plaques set into dark slat walls with warm sconces
        const hudGeom = keep(new THREE.PlaneGeometry(6.4, 3.2));
        const hudData = [
          {
            pos: [-9.2, 1.2, -18] as [number, number, number], rotY: Math.PI / 2,
            header: "SIMULATION PROTOCOL // INITIALIZED",
            title: "STARTING CAPITAL: $100,000.00",
            detail: "5 SEATS // 1 VENTURE // TWO DAYS TO BUILD & RUN",
          },
          {
            pos: [9.2, 0.4, -26] as [number, number, number], rotY: -Math.PI / 2,
            header: "EXECUTIVE MANDATE // TWO DAYS",
            title: "DAY 01: BUILD & MOVE // DAY 02: FUND",
            detail: "ACQUISITION · CRISIS · STOCK MARKET · BRAND WAR",
          },
          {
            pos: [-9.2, 0.8, -34] as [number, number, number], rotY: Math.PI / 2,
            header: "CAUSAL MARKET FEED // LIVE",
            title: "DECISION CONSEQUENCE LOOP: ACTIVE",
            detail: "APPROACHING THE EXECUTIVE BOARDROOM ROTUNDA",
          },
        ];

        hudData.forEach((item) => {
          const tex = keep(makeHudTexture(item.header, item.title, item.detail));
          if (tex) {
            const mat = keep(new THREE.MeshStandardMaterial({
              map: tex, metalness: 0.35, roughness: 0.45,
            }));
            const plaque = new THREE.Mesh(hudGeom, mat);
            plaque.position.set(...item.pos);
            plaque.rotation.y = item.rotY;
            scene!.add(plaque);

            // Warm architectural sconce light directly above the plaque
            const sconce = new THREE.PointLight("#fff5ea", 65, 8, 1.8);
            sconce.position.set(item.pos[0] * 0.85, item.pos[1] + 1.8, item.pos[2]);
            scene!.add(sconce);
          }
        });

        // --- SCENE 4: THE EXECUTIVE BOARDROOM SUITE (Z = -44 to -66) ---
        // Authentic executive boardroom with architectural walls, linear LED troffers,
        // polished boat-shaped walnut/copper conference table, and 5 ergonomic Eames-style leather chairs
        boardroomGroup = new THREE.Group();
        boardroomGroup.position.set(0, 0, -55);

        // 1. Room Floor: Polished executive dark oak / smoked terrazzo
        const roomFloorGeom = keep(new THREE.PlaneGeometry(24, 22));
        roomFloorGeom.rotateX(-Math.PI / 2);
        const roomFloorMat = keep(new THREE.MeshStandardMaterial({
          color: "#252726", map: floorMap, metalness: 0.45, roughness: 0.28,
        }));
        const roomFloor = new THREE.Mesh(roomFloorGeom, roomFloorMat);
        roomFloor.position.set(0, -3.2, 0);
        boardroomGroup.add(roomFloor);

        // 2. Room Ceiling: Architectural drop ceiling with recessed linear LED luminaire
        const roomCeilGeom = keep(new THREE.PlaneGeometry(24, 22));
        roomCeilGeom.rotateX(Math.PI / 2);
        const roomCeilMat = keep(new THREE.MeshStandardMaterial({
          color: "#1c201e", roughness: 0.65,
        }));
        const roomCeiling = new THREE.Mesh(roomCeilGeom, roomCeilMat);
        roomCeiling.position.set(0, 6.2, 0);
        boardroomGroup.add(roomCeiling);

        // Recessed linear LED troffer luminaire directly above conference table
        const ledTrofferGeom = keep(new THREE.BoxGeometry(4.8, 0.08, 9.8));
        const ledTrofferMat = keep(new THREE.MeshBasicMaterial({ color: "#fffef2" }));
        const ledTroffer = new THREE.Mesh(ledTrofferGeom, ledTrofferMat);
        ledTroffer.position.set(0, 6.16, 0);
        boardroomGroup.add(ledTroffer);

        // Bright architectural boardroom studio illumination (lights up the room and table clearly)
        const tableSpot1 = new THREE.SpotLight(0xfff6ea, 280, 32, Math.PI / 2.8, 0.4, 1.2);
        tableSpot1.position.set(0, 5.8, 2.5);
        const tableSpot2 = new THREE.SpotLight(0xfff6ea, 280, 32, Math.PI / 2.8, 0.4, 1.2);
        tableSpot2.position.set(0, 5.8, -2.5);
        const boardroomFill = new THREE.PointLight(0xffeed8, 175, 26, 1.2);
        boardroomFill.position.set(0, 3.4, 0);
        boardroomGroup.add(tableSpot1, tableSpot2, boardroomFill);

        // 3. Architectural Dark Slat Walls
        const wallMat = keep(new THREE.MeshStandardMaterial({
          color: "#181c1a", map: metalMap, metalness: 0.65, roughness: 0.52,
        }));
        const sideWallGeom = keep(new THREE.BoxGeometry(0.3, 9.4, 22));
        const leftWall = new THREE.Mesh(sideWallGeom, wallMat);
        leftWall.position.set(-11.4, 1.5, 0);
        const rightWall = new THREE.Mesh(sideWallGeom, wallMat);
        rightWall.position.set(11.4, 1.5, 0);

        // Horizontal warm copper cove strips
        const coveGeom = keep(new THREE.BoxGeometry(0.06, 0.08, 21.8));
        const coveMat = keep(new THREE.MeshBasicMaterial({ color: "#d49b63" }));
        const leftCove = new THREE.Mesh(coveGeom, coveMat);
        leftCove.position.set(-11.2, 0, 0);
        const rightCove = new THREE.Mesh(coveGeom, coveMat);
        rightCove.position.set(11.2, 0, 0);
        boardroomGroup.add(leftWall, rightWall, leftCove, rightCove);

        // Open Architectural Portals (Allows clear camera view into boardroom without blocking flight path)
        const portalPillarGeom = keep(new THREE.BoxGeometry(5.2, 9.4, 0.4));
        const portalLintelGeom = keep(new THREE.BoxGeometry(22.8, 2.2, 0.4));

        const frontPillarL = new THREE.Mesh(portalPillarGeom, wallMat);
        frontPillarL.position.set(-8.8, 1.5, 11);
        const frontPillarR = new THREE.Mesh(portalPillarGeom, wallMat);
        frontPillarR.position.set(8.8, 1.5, 11);
        const frontLintel = new THREE.Mesh(portalLintelGeom, wallMat);
        frontLintel.position.set(0, 5.1, 11);

        const backPillarL = new THREE.Mesh(portalPillarGeom, wallMat);
        backPillarL.position.set(-8.8, 1.5, -11);
        const backPillarR = new THREE.Mesh(portalPillarGeom, wallMat);
        backPillarR.position.set(8.8, 1.5, -11);
        const backLintel = new THREE.Mesh(portalLintelGeom, wallMat);
        backLintel.position.set(0, 5.1, -11);

        boardroomGroup.add(frontPillarL, frontPillarR, frontLintel, backPillarL, backPillarR, backLintel);

        // --- THE EXECUTIVE BOAT-SHAPED CONFERENCE TABLE (Y = -2.8) ---
        const tableGroup = new THREE.Group();
        tableGroup.position.set(0, -2.8, 0);

        // Center table top in rich warm American walnut
        const tableTopGeom = keep(new THREE.BoxGeometry(4.4, 0.22, 8.8));
        const tableTop = new THREE.Mesh(tableTopGeom, walnutWood);
        tableSpot1.target = tableTop;
        tableSpot2.target = tableTop;

        // Curved boat-shaped ends
        const endRadius = 2.2;
        const tableEndGeom = keep(new THREE.CylinderGeometry(endRadius, endRadius, 0.22, 32, 1, false, 0, Math.PI));
        const frontEnd = new THREE.Mesh(tableEndGeom, walnutWood);
        frontEnd.position.set(0, 0, 4.4);
        const backEnd = new THREE.Mesh(tableEndGeom, walnutWood);
        backEnd.position.set(0, 0, -4.4);
        backEnd.rotation.y = Math.PI;
        tableTop.add(frontEnd, backEnd);

        // Polished copper/brass perimeter edge band
        const edgeTrim = new THREE.Mesh(keep(new THREE.BoxGeometry(4.52, 0.05, 8.92)), copperMat);
        edgeTrim.position.y = -0.09;
        tableTop.add(edgeTrim);

        // Center recessed connectivity and cable management trough
        const trough = new THREE.Mesh(keep(new THREE.BoxGeometry(0.72, 0.04, 6.4)), deepBlack);
        trough.position.y = 0.115;
        const troughGlow = new THREE.Mesh(
          keep(new THREE.PlaneGeometry(0.68, 6.3)),
          keep(new THREE.MeshBasicMaterial({ color: "#d49b63", transparent: true, opacity: 0.55 }))
        );
        troughGlow.rotateX(-Math.PI / 2);
        troughGlow.position.y = 0.025;
        trough.add(troughGlow);
        tableTop.add(trough);

        // Dual Heavy Architectural Pedestals with Chamfered Copper Foot Plates
        const plinthGeom = keep(new THREE.BoxGeometry(1.4, 2.5, 0.75));
        const plinthFront = new THREE.Mesh(plinthGeom, darkSteel);
        plinthFront.position.set(0, -1.35, 2.4);
        const plinthBack = new THREE.Mesh(plinthGeom, darkSteel);
        plinthBack.position.set(0, -1.35, -2.4);

        const footPlateGeom = keep(new THREE.BoxGeometry(2.2, 0.1, 1.3));
        const footFront = new THREE.Mesh(footPlateGeom, copperMat);
        footFront.position.y = -1.25;
        plinthFront.add(footFront);
        const footBack = new THREE.Mesh(footPlateGeom, copperMat);
        footBack.position.y = -1.25;
        plinthBack.add(footBack);

        tableGroup.add(tableTop, plinthFront, plinthBack);
        boardroomGroup.add(tableGroup);

        // --- 5 ERGONOMIC EXECUTIVE BOARDROOM CHAIRS (EAMES / HERMAN MILLER STYLE) ---
        const chairGeoms = {
          starLeg: keep(new THREE.CylinderGeometry(0.035, 0.02, 0.54, 8)),
          wheel: keep(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12)),
          column: keep(new THREE.CylinderGeometry(0.045, 0.045, 0.52, 16)),
          tilt: keep(new THREE.BoxGeometry(0.32, 0.1, 0.32)),
          seat: keep(new THREE.BoxGeometry(1.05, 0.14, 1.02)),
          backFrame: keep(new THREE.BoxGeometry(1.04, 1.32, 0.05)),
          rib: keep(new THREE.BoxGeometry(0.96, 0.34, 0.1)),
          arm: keep(new THREE.BoxGeometry(0.07, 0.035, 0.7)),
          armPost: keep(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 12)),
          blotter: keep(new THREE.PlaneGeometry(0.85, 0.52)),
          terminal: keep(new THREE.BoxGeometry(0.68, 0.03, 0.44)),
        };
        chairGeoms.starLeg.rotateZ(Math.PI / 2);
        chairGeoms.wheel.rotateX(Math.PI / 2);
        chairGeoms.blotter.rotateX(-Math.PI / 2);

        const createExecutiveChair = () => {
          const chair = new THREE.Group();

          // 1. Five-Star Chrome Caster Base
          const baseHub = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16)), chromeMetal);
          baseHub.position.y = 0.1;
          chair.add(baseHub);

          for (let s = 0; s < 5; s++) {
            const sAngle = (s / 5) * Math.PI * 2;
            const leg = new THREE.Mesh(chairGeoms.starLeg, chromeMetal);
            leg.position.set(Math.cos(sAngle) * 0.27, 0.1, Math.sin(sAngle) * 0.27);
            leg.rotation.y = -sAngle;
            const wheel = new THREE.Mesh(chairGeoms.wheel, deepBlack);
            wheel.position.set(0.26, -0.05, 0);
            leg.add(wheel);
            chair.add(leg);
          }

          // 2. Hydraulic Lift Column & Tilt Housing
          const col = new THREE.Mesh(chairGeoms.column, chromeMetal);
          col.position.y = 0.36;
          const tilt = new THREE.Mesh(chairGeoms.tilt, darkSteel);
          tilt.position.y = 0.62;
          chair.add(col, tilt);

          // 3. Ergonomic Contoured Seat in Soft Obsidian Leather
          const seatGroup = new THREE.Group();
          seatGroup.position.set(0, 0.72, 0);

          const seat = new THREE.Mesh(chairGeoms.seat, executiveLeather);
          seatGroup.add(seat);

          // 4. Executive High-Back with 3 Horizontal Stitched Leather Pillows
          const backGroup = new THREE.Group();
          backGroup.position.set(0, 0.65, -0.45);
          backGroup.rotation.x = 0.12;

          const backFrame = new THREE.Mesh(chairGeoms.backFrame, chromeMetal);
          backGroup.add(backFrame);

          for (let p = 0; p < 3; p++) {
            const rib = new THREE.Mesh(chairGeoms.rib, executiveLeather);
            rib.position.set(0, -0.4 + p * 0.4, 0.06);
            backGroup.add(rib);
          }
          seatGroup.add(backGroup);

          // 5. Continuous Loop Armrests in Polished Chrome
          const lArm = new THREE.Mesh(chairGeoms.arm, chromeMetal);
          lArm.position.set(-0.55, 0.34, -0.05);
          const rArm = new THREE.Mesh(chairGeoms.arm, chromeMetal);
          rArm.position.set(0.55, 0.34, -0.05);

          const lPost = new THREE.Mesh(chairGeoms.armPost, chromeMetal);
          lPost.position.set(-0.55, 0.17, 0.12);
          const rPost = new THREE.Mesh(chairGeoms.armPost, chromeMetal);
          rPost.position.set(0.55, 0.17, 0.12);

          seatGroup.add(lArm, rArm, lPost, rPost);
          chair.add(seatGroup);

          return chair;
        };

        // Positions of the 5 C-Suite Seats around the Table:
        // Seat 0: CEO (Head of table, facing down)
        // Seat 1: CFO (Left upper)
        // Seat 2: CMO (Left lower)
        // Seat 3: COO (Right upper)
        // Seat 4: CTO (Right lower)
        const seatConfigs: Array<{
          pos: [number, number, number];
          rotY: number;
          blotterPos: [number, number, number];
          blotterRotY: number;
        }> = [
          { pos: [0, -2.8, -5.3], rotY: 0, blotterPos: [0, 0.13, -3.8], blotterRotY: 0 },
          { pos: [-2.85, -2.8, -1.8], rotY: Math.PI / 2, blotterPos: [-1.6, 0.13, -1.8], blotterRotY: Math.PI / 2 },
          { pos: [-2.85, -2.8, 1.8], rotY: Math.PI / 2, blotterPos: [-1.6, 0.13, 1.8], blotterRotY: Math.PI / 2 },
          { pos: [2.85, -2.8, -1.8], rotY: -Math.PI / 2, blotterPos: [1.6, 0.13, -1.8], blotterRotY: -Math.PI / 2 },
          { pos: [2.85, -2.8, 1.8], rotY: -Math.PI / 2, blotterPos: [1.6, 0.13, 1.8], blotterRotY: -Math.PI / 2 },
        ];

        seatConfigs.forEach((cfg) => {
          const chair = createExecutiveChair();
          chair.position.set(...cfg.pos);
          chair.rotation.y = cfg.rotY;
          boardroomGroup!.add(chair);

          // Executive Leather Blotter on table (warm charcoal/espresso leather pad)
          const blotterMat = keep(new THREE.MeshStandardMaterial({ color: "#1c1917", roughness: 0.52 }));
          const blotter = new THREE.Mesh(chairGeoms.blotter, blotterMat);
          blotter.position.set(cfg.blotterPos[0], cfg.blotterPos[1], cfg.blotterPos[2]);
          blotter.rotation.y = cfg.blotterRotY;
          tableTop.add(blotter);

          // Sleek Touchscreen Tablet Console on blotter
          const tabletMat = keep(new THREE.MeshStandardMaterial({
            color: "#18201d", metalness: 0.85, roughness: 0.22,
          }));
          const tablet = new THREE.Mesh(chairGeoms.terminal, tabletMat);
          tablet.position.set(cfg.blotterPos[0], cfg.blotterPos[1] + 0.02, cfg.blotterPos[2]);
          tablet.rotation.y = cfg.blotterRotY;
          tableTop.add(tablet);

          // Dedicated warm architectural downlight directly above each chair
          const chairDownlight = new THREE.PointLight(0xfff6ea, 65, 8, 1.8);
          chairDownlight.position.set(cfg.pos[0], 2.2, cfg.pos[2]);
          boardroomGroup!.add(chairDownlight);
        });

        scene.add(boardroomGroup);

        // --- SCENE 4b: DAY 01 — MARKET CRUCIBLE CONCOURSE (Z = -72 to -94) ---
        // 3 Narrative Stages:
        // 1. Acquisition Auction Arena (bidding rostrum, auction gavel, paddle consoles)
        // 2. Boardroom Crisis Command Station (curved crisis plinth, multi-monitor array, alert status well)
        // 3. Financial Market Crucible (architectural fluted walnut walls, brass valuation pillar bars, live ticker ribbons)
        dayOne = new THREE.Group(); dayOne.position.z = -72;

        // --- STAGE 1: ACQUISITION AUCTION ARENA (Z = 0 local) ---
        // Inspired by Sir Jony Ive (LoveFrom)'s sculpted monolithic rostrum for Christie's
        const auctionGroup = new THREE.Group();
        auctionGroup.position.set(0, -3.2, 0);

        // Grounded Architectural Rostrum Plinth with stepped bronze reveal
        const rostrumPlinth = new THREE.Mesh(keep(new THREE.BoxGeometry(4.6, 0.38, 3.4)), darkSteel);
        rostrumPlinth.position.y = 0.19;
        const rostrumPlinthTrim = new THREE.Mesh(keep(new THREE.BoxGeometry(4.72, 0.06, 3.52)), copperMat);
        rostrumPlinthTrim.position.y = 0.38;
        rostrumPlinth.add(rostrumPlinthTrim);

        // Sculptural Monolithic Curved Rostrum (curved walnut body with continuous organic contour)
        const rostrumBody = new THREE.Mesh(
          keep(new THREE.CylinderGeometry(0.92, 1.15, 1.7, 32, 1, false, -Math.PI * 0.1, Math.PI * 1.2)),
          walnutWood
        );
        rostrumBody.position.set(0, 1.22, -0.5);
        rostrumBody.rotation.y = Math.PI * 0.5;

        // Precision-machined champagne brass reading rim tracing the rostrum curve
        const rostrumRim = new THREE.Mesh(
          keep(new THREE.CylinderGeometry(0.96, 0.96, 0.06, 32, 1, false, -Math.PI * 0.1, Math.PI * 1.2)),
          copperMat
        );
        rostrumRim.position.y = 0.86;
        rostrumBody.add(rostrumRim);

        // Slanted walnut & brass manuscript deck for auction catalogue
        const readingDeck = new THREE.Mesh(keep(new THREE.BoxGeometry(0.92, 0.05, 0.65)), walnutWood);
        readingDeck.rotation.x = 0.28;
        readingDeck.position.set(0, 0.88, 0.1);
        const deckLip = new THREE.Mesh(keep(new THREE.BoxGeometry(0.94, 0.04, 0.05)), copperMat);
        deckLip.position.set(0, 0.02, 0.32);
        readingDeck.add(deckLip);
        rostrumBody.add(readingDeck);

        // Flush-mounted machined dark steel circular anvil with brass bezel ring
        const strikeBlock = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.22, 0.24, 0.06, 24)), darkSteel);
        strikeBlock.position.set(0.32, 0.94, 0.05);
        const strikeBezel = new THREE.Mesh(keep(new THREE.TorusGeometry(0.24, 0.02, 8, 24)), copperMat);
        strikeBezel.rotation.x = Math.PI / 2;
        strikeBezel.position.y = 0.03;
        strikeBlock.add(strikeBezel);

        // Precision Walnut & Brass Auction Gavel resting poised on strike block
        const gavelHandle = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.018, 0.024, 0.44, 12)), walnutWood);
        gavelHandle.rotation.z = Math.PI / 2.35;
        gavelHandle.position.set(0.32, 1.0, 0.05);
        const gavelHead = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 16)), copperMat);
        gavelHead.rotation.x = Math.PI / 2;
        gavelHead.position.set(0.48, 1.01, 0.05);
        const gavelRings = new THREE.Mesh(keep(new THREE.TorusGeometry(0.063, 0.012, 8, 16)), darkSteel);
        gavelHead.add(gavelRings);

        auctionGroup.add(rostrumPlinth, rostrumBody, strikeBlock, gavelHandle, gavelHead);

        // Bidder Consoles on Left and Right sides (Walnut with recessed copper edge)
        [-3.6, 3.6].forEach((xPos) => {
          const bDesk = new THREE.Mesh(keep(new THREE.BoxGeometry(1.8, 1.4, 1.2)), walnutWood);
          bDesk.position.set(xPos, 0.7, 0.5);
          const bTrim = new THREE.Mesh(keep(new THREE.BoxGeometry(1.86, 0.04, 1.26)), copperMat);
          bTrim.position.y = 0.7;
          bDesk.add(bTrim);
          const bPaddle = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16)), gateLuminous);
          bPaddle.position.set(0, 0.73, 0);
          bPaddle.rotation.x = -Math.PI / 2;
          bDesk.add(bPaddle);
          auctionGroup.add(bDesk);
        });

        // Overhead Auction Arena Spotlight
        const auctionSpot = new THREE.SpotLight(0xfff5ea, 240, 24, Math.PI / 3, 0.4, 1.2);
        auctionSpot.position.set(0, 6.2, 0);
        auctionSpot.target = rostrumBody;
        dayOne.add(auctionGroup, auctionSpot);

        // --- STAGE 2: BOARDROOM CRISIS COMMAND STATION (Z = -9 local) ---
        const crisisGroup = new THREE.Group();
        crisisGroup.position.set(0, -3.2, -9);

        // Curved Console Base in Walnut & Dark Steel
        const crisisDesk = new THREE.Mesh(keep(new THREE.CylinderGeometry(3.6, 3.6, 1.4, 32, 1, false, Math.PI * 0.15, Math.PI * 0.7)), walnutWood);
        crisisDesk.position.y = 0.7;
        const crisisTrim = new THREE.Mesh(keep(new THREE.CylinderGeometry(3.66, 3.66, 0.06, 32, 1, false, Math.PI * 0.14, Math.PI * 0.72)), copperMat);
        crisisTrim.position.y = 0.72;
        crisisDesk.add(crisisTrim);

        // Recessed Center Amber Status Well (Simulating emergency market alerts)
        const alertWell = new THREE.Mesh(
          keep(new THREE.CylinderGeometry(1.2, 1.2, 0.12, 24)),
          keep(new THREE.MeshStandardMaterial({ color: "#22160e", metalness: 0.8, roughness: 0.3 }))
        );
        alertWell.position.set(0, 0.74, -1.8);
        const alertRing = new THREE.Mesh(
          keep(new THREE.TorusGeometry(1.0, 0.04, 8, 32)),
          keep(new THREE.MeshBasicMaterial({ color: "#d49b63" }))
        );
        alertRing.rotateX(Math.PI / 2);
        alertRing.position.y = 0.08;
        alertWell.add(alertRing);
        crisisGroup.add(crisisDesk, alertWell);

        // 3 Emergency Decision Terminals mounted on curved copper armature
        for (let m = 0; m < 3; m++) {
          const mAngle = (m - 1) * 0.42;
          const monitor = new THREE.Mesh(
            keep(new THREE.BoxGeometry(0.95, 0.58, 0.05)),
            keep(new THREE.MeshStandardMaterial({ color: "#161b18", metalness: 0.85, roughness: 0.25 }))
          );
          monitor.position.set(Math.sin(mAngle) * 2.8, 1.85, -Math.cos(mAngle) * 2.8 + 0.8);
          monitor.rotation.y = -mAngle;
          const stand = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8)), copperMat);
          stand.position.set(0, -0.38, 0);
          monitor.add(stand);
          crisisGroup.add(monitor);
        }

        // Dedicated Crisis Amber Downlight
        const crisisSpot = new THREE.PointLight("#ffecd6", 160, 16, 1.5);
        crisisSpot.position.set(0, 3.8, -9);
        dayOne.add(crisisGroup, crisisSpot);

        // --- STAGE 3: FINANCIAL MARKET CRUCIBLE & VALUATION BOARD (Z = -18 local) ---
        const marketGroup = new THREE.Group();
        marketGroup.position.set(0, -3.2, -18);

        // Fluted Acoustic Walnut Wall Panelling with integrated dark backing
        const wallBackingGeom = keep(new THREE.BoxGeometry(0.12, 7.8, 12));
        const leftBacking = new THREE.Mesh(wallBackingGeom, darkSteel);
        leftBacking.position.set(-9.5, 3.9, 0);
        const rightBacking = new THREE.Mesh(wallBackingGeom, darkSteel);
        rightBacking.position.set(9.5, 3.9, 0);
        marketGroup.add(leftBacking, rightBacking);

        // Architectural fluted timber vertical ribs lining both sides
        const ribGeom = keep(new THREE.BoxGeometry(0.18, 7.6, 0.22));
        for (let r = 0; r < 24; r++) {
          const zOffset = (r - 11.5) * 0.48;
          const leftRib = new THREE.Mesh(ribGeom, walnutWood);
          leftRib.position.set(-9.38, 3.9, zOffset);
          const rightRib = new THREE.Mesh(ribGeom, walnutWood);
          rightRib.position.set(9.38, 3.9, zOffset);
          marketGroup.add(leftRib, rightRib);
        }

        // Flush Architectural LED Ticker Recesses (embedded into dark steel channel housings)
        const channelGeom = keep(new THREE.BoxGeometry(0.12, 0.52, 11.8));
        const leftChannel = new THREE.Mesh(channelGeom, darkSteel);
        leftChannel.position.set(-9.28, 4.2, 0);
        const rightChannel = new THREE.Mesh(channelGeom, darkSteel);
        rightChannel.position.set(9.28, 4.2, 0);

        const tickerGeom = keep(new THREE.BoxGeometry(0.06, 0.36, 11.6));
        const tickerMat = keep(new THREE.MeshBasicMaterial({ color: "#d49b63" }));
        const leftTicker = new THREE.Mesh(tickerGeom, tickerMat);
        leftTicker.position.set(-9.24, 4.2, 0);
        const rightTicker = new THREE.Mesh(tickerGeom, tickerMat);
        rightTicker.position.set(9.24, 4.2, 0);
        marketGroup.add(leftChannel, rightChannel, leftTicker, rightTicker);

        // Grounded Volumetric Valuation Pillars (representing live market valuation index bars)
        const pillarMatBull = keep(new THREE.MeshStandardMaterial({
          color: "#c88a50", metalness: 0.85, roughness: 0.24, emissive: "#4a2410", emissiveIntensity: 0.45,
        }));
        const pillarMatBear = keep(new THREE.MeshStandardMaterial({
          color: "#2a1e16", metalness: 0.8, roughness: 0.4,
        }));

        const pillarHeights = [1.8, 3.2, 2.4, 4.2, 2.8, 3.8, 2.1, 4.6];
        pillarHeights.forEach((h, pIdx) => {
          const side = pIdx < 4 ? -1 : 1;
          const zOffset = ((pIdx % 4) - 1.5) * 2.6;
          const pGeom = keep(new THREE.BoxGeometry(0.55, h, 0.55));
          const pMesh = new THREE.Mesh(pGeom, pIdx % 2 === 0 ? pillarMatBull : pillarMatBear);
          pMesh.position.set(side * 8.6, h / 2, zOffset);
          marketGroup.add(pMesh);
        });

        // Market Overhead Downlights
        const marketSpot1 = new THREE.PointLight("#fff5ea", 140, 18, 1.4);
        marketSpot1.position.set(-5.5, 4.2, -18);
        const marketSpot2 = new THREE.PointLight("#fff5ea", 140, 18, 1.4);
        marketSpot2.position.set(5.5, 4.2, -18);
        dayOne.add(marketGroup, marketSpot1, marketSpot2);

        scene.add(dayOne);

        // --- SCENE 4c: DAY 02 — CAPITAL & INVESTOR PAVILION (Z = -98 to -115) ---
        dayTwo = new THREE.Group(); dayTwo.position.z = -105;

        // Architectural Portal Arch in dark bronze and copper
        const conclavePortal = ring(5.6, .22, darkSteel, 0, 80);
        const innerConclaveRing = ring(5.0, .08, copperMat, -.15, 80);
        dayTwo.add(conclavePortal, innerConclaveRing);

        // Bespoke Partner Desks with leather blotters, dossier straps & brass closure studs
        const portfolioGeom = keep(new THREE.BoxGeometry(1.2, 0.06, 0.85));
        const portfolioMat = keep(new THREE.MeshStandardMaterial({
          color: "#5c361e", map: leatherMap, metalness: 0.1, roughness: 0.45,
        }));
        const blotterGeom = keep(new THREE.BoxGeometry(2.2, 0.02, 1.05));
        const blotterMat = keep(new THREE.MeshStandardMaterial({
          color: "#2b180d", metalness: 0.08, roughness: 0.55,
        }));
        const strapGeom = keep(new THREE.BoxGeometry(0.06, 0.07, 0.87));
        const studGeom = keep(new THREE.CylinderGeometry(0.022, 0.022, 0.08, 12));
        const plaqueGeom = keep(new THREE.BoxGeometry(0.24, 0.07, 0.14));

        for (let st = 0; st < 4; st++) {
          const stallGroup = new THREE.Group();
          const side = st % 2 === 0 ? -1 : 1;
          const zPos = st < 2 ? -4 : 4;
          stallGroup.position.set(side * 6.5, -2.4, zPos);

          // American Walnut Desk with heavy architectural base and copper reveal
          const desk = new THREE.Mesh(keep(new THREE.BoxGeometry(3.0, 0.22, 1.4)), walnutWood);
          const deskTrim = new THREE.Mesh(keep(new THREE.BoxGeometry(3.06, 0.05, 1.46)), copperMat);
          deskTrim.position.y = -0.09;
          desk.add(deskTrim);

          const deskLegs = new THREE.Mesh(keep(new THREE.BoxGeometry(2.6, 1.6, 1.2)), darkSteel);
          deskLegs.position.y = -0.9;
          stallGroup.add(desk, deskLegs);

          // Recessed executive leather blotter resting flat on walnut surface
          const blotter = new THREE.Mesh(blotterGeom, blotterMat);
          blotter.position.set(0, 0.12, 0);
          stallGroup.add(blotter);

          // Bespoke Leather Document Portfolio with dual straps, brass studs, and monogram plaque
          const portfolio = new THREE.Mesh(portfolioGeom, portfolioMat);
          portfolio.position.set(0, 0.16, 0);
          portfolio.rotation.y = side * 0.12;

          [-0.38, 0.38].forEach((sX) => {
            const strap = new THREE.Mesh(strapGeom, blotterMat);
            strap.position.set(sX, 0.005, 0);
            const stud = new THREE.Mesh(studGeom, copperMat);
            stud.position.set(sX, 0.038, 0.38);
            portfolio.add(strap, stud);
          });

          const plaque = new THREE.Mesh(plaqueGeom, copperMat);
          plaque.position.set(0, 0.035, 0);
          portfolio.add(plaque);

          stallGroup.add(portfolio);
          dayTwo.add(stallGroup);

          // Warm architectural studio downlight on investor desk
          const investorSpot = new THREE.PointLight("#fff5ea", 70, 9, 1.8);
          investorSpot.position.set(side * 6.5, 2.2, zPos);
          dayTwo.add(investorSpot);
        }
        scene.add(dayTwo);

        // --- SCENE 5: THREE-RING TRIPTYCH (BUILD / MOVE / FUND) (Z = -116) ---
        ringTrio = new THREE.Group(); ringTrio.position.z = -116;
        const triad = [
          { x: -7.35, r: 3.5, material: darkSteel },
          { x: 0, r: 4.05, material: copperMat },
          { x: 7.35, r: 3.5, material: darkSteel },
        ];
        const triptychBeamGeom = keep(new THREE.BoxGeometry(20.5, .28, .36));
        const triptychBeam = new THREE.Mesh(triptychBeamGeom, charcoal);
        triptychBeam.position.set(0, -4.6, -.1);
        ringTrio.add(triptychBeam);

        triad.forEach((item, index) => {
          const outer = ring(item.r, .18, item.material, 0, 80);
          const inner = ring(item.r - .36, .05, darkSteel, -.18, 72);
          outer.position.x = inner.position.x = item.x;
          const bridge = new THREE.Mesh(keep(new THREE.BoxGeometry(.08, item.r * 1.7, .12)), index === 1 ? copperMat : darkSteel);
          bridge.position.set(item.x, 0, -.08);

          const pylonGeom = keep(new THREE.BoxGeometry(.22, 2.2, .24));
          const pylon = new THREE.Mesh(pylonGeom, walnutWood);
          pylon.position.set(item.x, -item.r - 0.4, -.08);

          [outer, inner, bridge, pylon].forEach((part) => {
            if (part.geometry) keep(part.geometry);
            ringTrio!.add(part);
          });
        });
        scene.add(ringTrio);

        // --- SCENE 6: FINALE MECHANICAL IRIS & CALM CHAMBER (Z = -142 to -164) ---
        finaleIris = createMechanicalAperture(scene, -142, 8.5, copperMat, darkSteel, keep);

        const endWall = new THREE.Mesh(keep(new THREE.PlaneGeometry(48, 38)), darkBackdrop);
        endWall.position.z = -164.5; scene.add(endWall);
        endPortal = new THREE.Group(); endPortal.position.z = -160.8;
        [
          ring(7.25, .18, copperMat, 0, 120),
          ring(6.75, .065, walnutWood, -.08, 120),
          ring(5.98, .04, warmPortal, -.14, 120),
        ].forEach((part) => { keep(part.geometry); endPortal!.add(part); });
        scene.add(endPortal);
        const endGlowMat = keep(new THREE.MeshBasicMaterial({
          color: "#d49b63", transparent: true, opacity: .18, side: THREE.DoubleSide,
        }));
        endGlow = new THREE.Mesh(keep(new THREE.CircleGeometry(5.82, 96)), endGlowMat);
        endGlow.position.z = -160.55; scene.add(endGlow);

        for (let i = 0; i < 7; i++) {
          const marker = new THREE.Mesh(
            keep(new THREE.BoxGeometry(.065, .035, 3.2)),
            i % 2 === 0 ? copperMat : walnutWood,
          );
          marker.position.set(0, -12.35, -139 - i * 2.4); scene.add(marker);
        }

        // Bolts
        const boltGeometry = keep(new THREE.SphereGeometry(.08, 8, 6));
        const bolts = new THREE.InstancedMesh(boltGeometry, copperMat, 128);
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

        // --- CINEMATIC EXECUTIVE CAMERA SPLINE ---
        // S-curves horizontally (X), elevates and swoops over stations (Y), banks dynamically into turns (roll Z)
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

            // Smoothly engage multi-directional camera flight as the opening gate opens (p = 0.01 -> 0.08)
            const openingFlight = smooth(0.01, 0.08, p);

            // Horizontal sway: swoops left towards Boardroom, right towards Stock Market, centers at Ring Triad & Finale
            const camX = (Math.sin(p * Math.PI * 3.2) * 1.85 + Math.sin(p * Math.PI * 1.5) * 0.95) * gateDamp * (1 - finaleCenter) * openingFlight;
            // Vertical pitch: dead center on opening iris at p=0, then elevates over gate and swoops across stations
            const camY = (Math.sin(p * Math.PI * 2.8) * 0.85 + Math.sin(p * Math.PI * 5.0) * 0.35) * gateDamp * (1 - finaleCenter) * openingFlight;
            camera!.position.set(camX, camY, camZ);

            // Dynamic look-ahead with banking & yaw towards upcoming stations, centered at Opening & Finale
            const lookTargetX = Math.sin((p + 0.04) * Math.PI * 3.2) * 1.1 * gateDamp * (1 - finaleCenter) * openingFlight;
            const lookTargetY = Math.sin((p + 0.04) * Math.PI * 2.8) * 0.45 * gateDamp * (1 - finaleCenter) * openingFlight;
            camera!.lookAt(lookTargetX, lookTargetY, camZ - 22);

            // Camera roll / bank into horizontal curves (like an aerial drone / cinematic dolly), leveling at Opening & Finale
            if (!reduced) {
              const bankAngle = -Math.cos(p * Math.PI * 3.2) * 0.075 * gateDamp * (1 - finaleCenter) * openingFlight;
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

            if (!reduced) {
              // Animate 4-point specular star glints on Gear Gate
              gearGlints.forEach((glint, idx) => {
                const toothPass = Math.sin((gear ? gear.rotation.z : 0) * 18 + idx * (Math.PI / 2));
                const flare = Math.max(0.2, toothPass);
                const s = 0.5 + flare * 0.75;
                glint.scale.set(s, s, 1);
              });
            }

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
