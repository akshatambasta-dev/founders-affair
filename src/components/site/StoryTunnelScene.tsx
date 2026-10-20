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

        // --- HIGH-CONTRAST PALETTE FOR 3D ENVIRONMENT ---
        // --- PURE GREEN & BLACK PALETTE FOR 3D ENVIRONMENT ---
        // Dark Green: Deep Emerald (#0b3d2e), Deep Forest Patina (#08241b)
        // Accent Green: Luminous Pine Emerald (#1aa072 / #116345)
        // Set against deep Obsidian Black (#0A0A0A) & Charcoal (#141816)
        // --- GATE SPECIFIC HIGH-CONTRAST MATERIALS ---
        // Lighter, luminous greens for gates: Mint-Emerald (#3db88f / #52d6a4) against Charcoal/Black (#0a0a0a / #18201c)
        // This ensures opening iris aperture blades, rotating gear gate teeth/spokes, and C-suite gates are clearly visible during motion
        const gateMint = keep(new THREE.MeshStandardMaterial({
          color: "#3db88f", metalness: .4, roughness: .22,
          emissive: "#1b6b4e", emissiveIntensity: 1.35,
        }));
        const gateLuminous = keep(new THREE.MeshStandardMaterial({
          color: "#52d6a4", metalness: .3, roughness: .18,
          emissive: "#28946c", emissiveIntensity: 1.6,
        }));
        const gateTeal = keep(new THREE.MeshStandardMaterial({
          color: "#105666", metalness: .65, roughness: .32,
          emissive: "#093844", emissiveIntensity: .65,
        }));
        const darkSteel = keep(new THREE.MeshStandardMaterial({
          color: "#18201c", map: metalMap, metalness: .88, roughness: .42,
        }));
        const charcoal = keep(new THREE.MeshStandardMaterial({
          color: "#141816", map: metalMap, metalness: .82, roughness: .5,
        }));
        const deepBlack = keep(new THREE.MeshStandardMaterial({
          color: "#0a0a0a", metalness: .9, roughness: .6,
        }));
        const emerald = keep(new THREE.MeshStandardMaterial({
          color: "#0b3d2e", metalness: .78, roughness: .35,
          emissive: "#051f17", emissiveIntensity: .85,
        }));
        const emeraldGlow = keep(new THREE.MeshStandardMaterial({
          color: "#1aa072", metalness: .35, roughness: .2,
          emissive: "#116345", emissiveIntensity: 1.5,
        }));
        const sage = keep(new THREE.MeshStandardMaterial({
          color: "#08241b", metalness: .75, roughness: .38,
          emissive: "#04140f", emissiveIntensity: .65,
        }));
        const metal = keep(new THREE.MeshStandardMaterial({
          color: "#0b3d2e", map: metalMap, metalness: .85, roughness: .28,
        }));
        const floorMaterial = keep(new THREE.MeshStandardMaterial({
          color: "#060e0a", map: floorMap, metalness: .75, roughness: .3, side: THREE.DoubleSide,
        }));
        const warmPortal = keep(new THREE.MeshBasicMaterial({ color: "#0b3d2e" }));
        const darkBackdrop = keep(new THREE.MeshBasicMaterial({ color: "#040705", side: THREE.DoubleSide }));

        // --- ATMOSPHERIC DARK EMERALD & PINE LIGHTING ---
        scene.add(new THREE.HemisphereLight(0x1aa072, 0x040705, 1.55));

        const key = new THREE.DirectionalLight(0x0b3d2e, 2.4);
        key.position.set(-8, 10, 12); scene.add(key);

        const edge = new THREE.DirectionalLight(0x1aa072, 2.8);
        edge.position.set(8, -2, -20); scene.add(edge);

        openingWarmLight = new THREE.PointLight("#1aa072", 140, 48, 2);
        openingWarmLight.position.set(0, 0, 24);
        scene.add(openingWarmLight);

        const addLight = (color: string, power: number, distance: number, pos: [number, number, number]) => {
          const light = new THREE.PointLight(color, power, distance, 2);
          light.position.set(...pos); scene.add(light);
        };
        addLight("#0b3d2e", 110, 36, [0, 1.6, -5]);
        addLight("#1aa072", 95, 42, [-5, 4, -30]);
        addLight("#0b3d2e", 85, 36, [0, 0, -52]);
        addLight("#1aa072", 92, 38, [0, 2, -64]);
        addLight("#0b3d2e", 80, 32, [0, 0, -74]);
        addLight("#1aa072", 95, 40, [0, 3, -94]);
        addLight("#0b3d2e", 100, 40, [-7, 0, -118]);
        addLight("#0b3d2e", 105, 50, [0, 2.5, -148]);
        addLight("#1aa072", 75, 32, [0, 0, -159]);

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
            milestone ? emerald : darkSteel,
            z,
          );
          keep(rib.geometry); scene.add(rib);
          if (milestone) {
            const inner = ring(11.86, .04, emeraldGlow, z - .11);
            keep(inner.geometry); scene.add(inner);
            const milestoneGlow = new THREE.PointLight("#0b3d2e", 18, 12, 2);
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
          scene.add(new THREE.Mesh(geom, j % 4 === 0 ? sage : emerald));
        }

        // --- SCENE 1: OPENING MECHANICAL IRIS APERTURE (Z = 28) ---
        // Light mint green blades against dark black steel housing so opening animation is clearly visible
        openingIris = createMechanicalAperture(scene, 28, 8.2, gateMint, darkSteel, keep);

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
        // High-contrast luminous lighter green with black so rotating motion is sharply visible
        gear = new THREE.Group(); gear.position.z = -6.6;
        const gateRings = [
          ring(10.6, .32, deepBlack, 0),
          ring(9.9, .15, gateLuminous, -.18),
          ring(7.6, .22, gateMint, -.38),
          ring(5.4, .16, darkSteel, -.56),
          ring(3.4, .09, gateLuminous, -.82),
        ];
        gateRings.forEach((item) => { keep(item.geometry); gear!.add(item); });
        
        // High-visibility luminous lighter green drive teeth that pop crisply against obsidian space
        const toothGeometry = keep(new THREE.BoxGeometry(1.2, .48, .85));
        const teeth = new THREE.InstancedMesh(toothGeometry, gateLuminous, 36);
        const tooth = new THREE.Object3D();
        for (let i = 0; i < 36; i++) {
          const a = (i / 36) * Math.PI * 2;
          tooth.position.set(Math.cos(a) * 10.7, Math.sin(a) * 10.7, 0);
          tooth.rotation.set(0, 0, a);
          tooth.updateMatrix();
          teeth.setMatrixAt(i, tooth.matrix);
        }
        teeth.instanceMatrix.needsUpdate = true; gear.add(teeth);

        // Heavy counter-rotating inner spoke hub in high-contrast Mint & Luminous Green
        const spokeGeometry = keep(new THREE.BoxGeometry(4.2, .18, .28));
        for (let i = 0; i < 8; i++) {
          const spoke = new THREE.Mesh(spokeGeometry, i % 2 === 0 ? gateMint : gateLuminous);
          const a = (i / 8) * Math.PI * 2;
          spoke.position.set(Math.cos(a) * 4.1, Math.sin(a) * 4.1, -.28);
          spoke.rotation.z = a;
          gear.add(spoke);
        }
        scene.add(gear);

        // --- 4-POINT SPECULAR STAR GLINTS (Ten Pound Feather optical glints) ---
        // Sharp 4-ray optical glints reflecting off rotating metal drive teeth and gate keystones
        const starMat = keep(new THREE.MeshBasicMaterial({
          color: "#52d6a4",
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

        // --- SCENE 4: FIVE DISTINCT C-SUITE GATES (Z = -45 to -68) ---
        // Lighter green with black so each gate architecture and animation is strongly visible
        const roleZ = [-46, -51.5, -57, -62.5, -68] as const;
        const roleNames = ["CEO", "CFO", "CMO", "COO", "CTO"] as const;

        // 4 cardinal glints stationed around the Gear Gate rim (top, bottom, left, right)
        const gearGlints: THREE.Group[] = [];
        const gearGlintAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
        gearGlintAngles.forEach((angle) => {
          const glint = createStarGlint(0.85);
          glint.position.set(Math.cos(angle) * 10.7, Math.sin(angle) * 10.7, -6.5);
          scene!.add(glint);
          gearGlints.push(glint);
        });

        // 5 keystone glints placed on the apex of each C-Suite portal
        const roleGlints: THREE.Group[] = [];
        for (let r = 0; r < 5; r++) {
          const glint = createStarGlint(0.72);
          glint.position.set(0, 5.8, roleZ[r] ?? -50);
          scene!.add(glint);
          roleGlints.push(glint);
        }

        for (let r = 0; r < 5; r++) {
          const rz = roleZ[r] ?? -50;
          const roleGroup = new THREE.Group();
          roleGroup.position.z = rz;

          // Dedicated overhead spotlight for each C-suite gate in luminous green
          const roleSpot = new THREE.PointLight(r % 2 === 0 ? "#52d6a4" : "#3db88f", 55, 18, 2);
          roleSpot.position.set(0, 5.5, rz + 1);
          scene.add(roleSpot);

          // Horizontal architectural floor support beam
          const beamGeom = keep(new THREE.BoxGeometry(14, .32, .45));
          const beam = new THREE.Mesh(beamGeom, deepBlack);
          beam.position.set(0, -6.5, 0);
          roleGroup.add(beam);

          // Heavy vertical portal pillars
          const pillarGeom = keep(new THREE.BoxGeometry(.45, 13, .55));
          const leftPillar = new THREE.Mesh(pillarGeom, gateMint);
          leftPillar.position.set(-6.8, 0, 0);
          const rightPillar = new THREE.Mesh(pillarGeom, gateMint);
          rightPillar.position.set(6.8, 0, 0);
          roleGroup.add(leftPillar, rightPillar);

          if (r === 0) {
            // CEO: Royal Crest diamond gate
            const diamondGeom = keep(new THREE.TorusGeometry(5.8, .28, 4, 4));
            diamondGeom.rotateZ(Math.PI / 4);
            const diamond = new THREE.Mesh(diamondGeom, gateLuminous);
            const innerRing = ring(4.5, .08, deepBlack, -.12, 64);
            roleGroup.add(diamond, innerRing);
          } else if (r === 1) {
            // CFO: Hexagonal Valuation Vault gate
            const hexGeom = keep(new THREE.TorusGeometry(5.6, .3, 6, 6));
            const hex = new THREE.Mesh(hexGeom, gateMint);
            const innerTicker = ring(4.5, .09, gateLuminous, -.12, 64);
            roleGroup.add(hex, innerTicker);
          } else if (r === 2) {
            // CMO: Waveform Broadcast aperture
            const waveRing = ring(5.6, .26, deepBlack, 0, 72);
            for (let b = 0; b < 8; b++) {
              const fin = new THREE.Mesh(keep(new THREE.BoxGeometry(.22, 2.6, .12)), gateLuminous);
              const angle = (b / 8) * Math.PI * 2;
              fin.position.set(Math.cos(angle) * 5.4, Math.sin(angle) * 5.4, -.06);
              fin.rotation.z = angle;
              roleGroup.add(fin);
            }
            roleGroup.add(waveRing);
          } else if (r === 3) {
            // COO: Clockwork Meshed Gear Train gate
            const gearRing = ring(5.5, .32, deepBlack, 0, 72);
            for (let g = 0; g < 24; g++) {
              const cog = new THREE.Mesh(keep(new THREE.BoxGeometry(.5, .25, .35)), gateLuminous);
              const angle = (g / 24) * Math.PI * 2;
              cog.position.set(Math.cos(angle) * 5.6, Math.sin(angle) * 5.6, 0);
              cog.rotation.z = angle;
              roleGroup.add(cog);
            }
            roleGroup.add(gearRing);
          } else {
            // CTO: Octagonal Tech Grid Matrix
            const octGeom = keep(new THREE.TorusGeometry(5.6, .28, 8, 8));
            const oct = new THREE.Mesh(octGeom, gateMint);
            const coreSpokeX = new THREE.Mesh(keep(new THREE.BoxGeometry(10.5, .14, .14)), gateLuminous);
            const coreSpokeY = new THREE.Mesh(keep(new THREE.BoxGeometry(.14, 10.5, .14)), gateLuminous);
            roleGroup.add(oct, coreSpokeX, coreSpokeY);
          }

          scene.add(roleGroup);
          roleGates.push(roleGroup);
        }

        // --- SCENE 4b: DAY 1 - STOCK MARKET & BOARDROOM CRISIS (Z = -74) ---
        // 3D Volumetric Financial Candlestick / Order-Book Depth Terrain in Emerald & Sage
        dayOne = new THREE.Group(); dayOne.position.z = -74;

        // Central Floor Market Arch
        const marketArch = ring(4.8, .16, sage, 0, 64);
        dayOne.add(marketArch);

        // 3D Financial Candlestick / Volumetric Depth bars flanked on both sides of corridor
        const candleGeom = keep(new THREE.BoxGeometry(.42, 1, .42));
        const barHeights = [2.2, 4.1, 1.6, 5.4, 3.2, 4.8, 2.7, 6.1, 3.8, 5.0];
        for (let i = 0; i < barHeights.length; i++) {
          const h = barHeights[i];
          const isUp = i % 3 !== 1;
          const barMesh = new THREE.Mesh(candleGeom, isUp ? emerald : sage);
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
        dayTwo = new THREE.Group(); dayTwo.position.z = -94;

        const conclavePortal = ring(4.8, .22, emerald, 0, 80);
        const innerConclaveRing = ring(4.2, .08, sage, -.15, 80);
        dayTwo.add(conclavePortal, innerConclaveRing);

        // 6 Vertical architectural illuminated light columns in Sage & Emerald
        const colGeom = keep(new THREE.BoxGeometry(.28, 11.5, .32));
        for (let c = 0; c < 6; c++) {
          const colMesh = new THREE.Mesh(colGeom, c % 2 === 0 ? sage : emerald);
          const x = (c - 2.5) * 2.8;
          colMesh.position.set(x, 0, -.3);
          dayTwo.add(colMesh);
        }
        scene.add(dayTwo);

        // --- SCENE 5: THREE-RING TRIPTYCH (BUILD / MOVE / FUND) (Z = -116) ---
        ringTrio = new THREE.Group(); ringTrio.position.z = -116;
        const triad = [
          { x: -7.35, r: 3.5, material: sage },
          { x: 0, r: 4.05, material: emerald },
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
          const bridge = new THREE.Mesh(keep(new THREE.BoxGeometry(.08, item.r * 1.7, .12)), index === 1 ? sage : darkSteel);
          bridge.position.set(item.x, 0, -.08);

          const pylonGeom = keep(new THREE.BoxGeometry(.22, 2.2, .24));
          const pylon = new THREE.Mesh(pylonGeom, emerald);
          pylon.position.set(item.x, -item.r - 0.4, -.08);

          [outer, inner, bridge, pylon].forEach((part) => {
            if (part.geometry) keep(part.geometry);
            ringTrio!.add(part);
          });
        });
        scene.add(ringTrio);

        // --- SCENE 6: FINALE MECHANICAL IRIS & CALM CHAMBER (Z = -142 to -164) ---
        finaleIris = createMechanicalAperture(scene, -142, 8.5, gateMint, darkSteel, keep);

        const endWall = new THREE.Mesh(keep(new THREE.PlaneGeometry(48, 38)), darkBackdrop);
        endWall.position.z = -164.5; scene.add(endWall);
        endPortal = new THREE.Group(); endPortal.position.z = -160.8;
        [
          ring(7.25, .18, emerald, 0, 120),
          ring(6.75, .065, sage, -.08, 120),
          ring(5.98, .04, warmPortal, -.14, 120),
        ].forEach((part) => { keep(part.geometry); endPortal!.add(part); });
        scene.add(endPortal);
        const endGlowMat = keep(new THREE.MeshBasicMaterial({
          color: "#0b3d2e", transparent: true, opacity: .18, side: THREE.DoubleSide,
        }));
        endGlow = new THREE.Mesh(keep(new THREE.CircleGeometry(5.82, 96)), endGlowMat);
        endGlow.position.z = -160.55; scene.add(endGlow);

        for (let i = 0; i < 7; i++) {
          const marker = new THREE.Mesh(
            keep(new THREE.BoxGeometry(.065, .035, 3.2)),
            i % 2 === 0 ? sage : emerald,
          );
          marker.position.set(0, -12.35, -139 - i * 2.4); scene.add(marker);
        }

        // Bolts
        const boltGeometry = keep(new THREE.SphereGeometry(.08, 8, 6));
        const bolts = new THREE.InstancedMesh(boltGeometry, sage, 128);
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

            // Animate Dynamic Financial Candlestick Pulses (Stock Market fluctuation)
            if (!reduced && stockBars.length > 0) {
              for (let s = 0; s < stockBars.length; s++) {
                const bar = stockBars[s];
                if (bar) {
                  const pulse = 1 + Math.sin(t * 2.4 + s * 1.1) * 0.12;
                  bar.scale.y = pulse * (2 + (s % 4));
                }
              }
            }

            // Animate Role Gates subtly on approach
            roleGates.forEach((gate, gIdx) => {
              gate.rotation.z = reduced ? 0 : Math.sin(t * 0.8 + gIdx) * 0.08;
            });

            // Animate 4-point specular star glints (optical sparkle on gear teeth & portals)
            if (!reduced) {
              gearGlints.forEach((glint, idx) => {
                const toothPass = Math.sin((gear ? gear.rotation.z : 0) * 18 + idx * (Math.PI / 2));
                const flare = Math.max(0.2, toothPass);
                const s = 0.5 + flare * 0.75;
                glint.scale.set(s, s, 1);
              });

              roleGlints.forEach((glint, rIdx) => {
                const targetZ = roleZ[rIdx] ?? -50;
                const dist = Math.abs(camZ - targetZ);
                const prox = Math.max(0, 1 - dist / 18);
                const flare = prox * (0.4 + Math.sin(t * 3.2 + rIdx * 1.4) * 0.5);
                glint.scale.set(flare, flare, 1);
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
