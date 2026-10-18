import { useEffect, useRef } from "react";

type SceneRefs = {
  progressRef: { current: number };
  reducedMotionRef: { current: boolean };
};

const THREE_URL = "https://esm.sh/three@0.185.0";
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / Math.max(0.0001, b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function makePattern(THREE: any, kind: "weave" | "metal" | "floor") {
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
    const g = x.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, "#3a413a"); g.addColorStop(.5, "#171c18"); g.addColorStop(1, "#303831");
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 3) {
      x.strokeStyle = i % 18 === 0 ? "rgba(205,213,193,.1)" : "rgba(0,0,0,.16)";
      x.lineWidth = i % 18 === 0 ? 1.4 : .7;
      x.beginPath(); x.moveTo(0, i); x.lineTo(512, i - 1); x.stroke();
    }
    for (let i = 0; i < 120; i++) {
      x.strokeStyle = i % 2 ? "rgba(184,115,74,.14)" : "rgba(231,226,210,.1)";
      x.beginPath(); x.moveTo((i * 97) % 512, (i * 179) % 512); x.lineTo((i * 97) % 512 + 3 + i % 16, (i * 179) % 512 + i % 7 - 2); x.stroke();
    }
  } else {
    x.fillStyle = "#111611"; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 8) {
      x.strokeStyle = i % 32 === 0 ? "rgba(184,115,74,.16)" : "rgba(255,255,255,.025)";
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i - 80, 512); x.stroke();
    }
    for (let i = 0; i < 64; i++) {
      x.fillStyle = "rgba(0,0,0,.13)";
      x.beginPath(); x.ellipse((i * 83) % 512, (i * 139) % 512, 8 + i % 21, 1 + i % 4, .08, 0, Math.PI * 2); x.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function ring(THREE: any, radius: number, tube: number, material: any, z: number, segments = 88) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, segments), material);
  mesh.position.z = z;
  return mesh;
}

function curtain(THREE: any, scene: any, cfg: {
  width: number; height: number; centerX: number; z: number; side: number;
  role: "opening" | "finale"; material: any;
}) {
  const geometry = new THREE.PlaneGeometry(cfg.width, cfg.height, 72, 56);
  const attr = geometry.attributes.position;
  const base = new Float32Array(attr.array as Float32Array);
  const mesh = new THREE.Mesh(geometry, cfg.material);
  mesh.position.set(cfg.centerX, 0, cfg.z);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return { mesh, base, side: cfg.side, width: cfg.width, role: cfg.role };
}

function animateCurtain(THREE: any, item: ReturnType<typeof curtain>, p: number, time: number, reduced: boolean) {
  const attr = item.mesh.geometry.attributes.position;
  const arr = attr.array as Float32Array;
  const slide = item.role === "opening" ? smooth(.045, .22, p) * 16 : smooth(.81, .95, p) * 18;
  const t = reduced ? 0 : time * .65;
  for (let i = 0; i < item.base.length / 3; i++) {
    const k = i * 3;
    const bx = item.base[k], by = item.base[k + 1];
    const worldX = bx + item.mesh.position.x;
    const weight = item.side < 0
      ? smooth(-item.width, 0, worldX)
      : 1 - smooth(0, item.width, worldX);
    arr[k] = bx + item.side * slide * weight;
    arr[k + 1] = by + Math.sin(worldX * .33 + p * 16) * .12 * weight;
    arr[k + 2] = Math.sin(worldX * .78 + t + by * .08) * .34
      + Math.sin(worldX * 1.7 - by * .13 + t * .5) * .11;
  }
  attr.needsUpdate = true;
  item.mesh.geometry.computeVertexNormals();
}

export function StoryTunnelScene({ progressRef, reducedMotionRef }: SceneRefs) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let frame = 0;
    let lastFrame = 0;
    let renderer: any;
    let scene: any;
    let camera: any;
    let gear: any;
    let dayOne: any;
    let dayTwo: any;
    let ringTrio: any;
    let endPortal: any;
    let endGlow: any;
    const cloths: Array<ReturnType<typeof curtain>> = [];
    const resources = new Set<any>();
    const keep = <T,>(item: T): T => {
      if (item && (typeof item === "object" || typeof item === "function")) resources.add(item);
      return item;
    };

    const boot = async () => {
      try {
        const THREE = await import(/* @vite-ignore */ THREE_URL) as any;
        if (cancelled) return;
        const small = window.innerWidth < 768;
        renderer = new THREE.WebGLRenderer({
          canvas, alpha: true, antialias: !small, powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? .82 : 1.25));
        renderer.setSize(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight, false);
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(new THREE.Color("#080a08"), .004);
        camera = new THREE.PerspectiveCamera(76, innerWidth / Math.max(1, innerHeight), .1, 320);
        camera.position.set(0, 0, 38);
        camera.lookAt(0, 0, 18);

        const weaveMap = keep(makePattern(THREE, "weave"));
        const metalMap = keep(makePattern(THREE, "metal"));
        const floorMap = keep(makePattern(THREE, "floor"));
        if (weaveMap) weaveMap.repeat.set(3, 2);
        if (metalMap) metalMap.repeat.set(2, 4);
        if (floorMap) floorMap.repeat.set(2, 8);

        const metal = keep(new THREE.MeshStandardMaterial({
          color: "#899184", map: metalMap, metalness: .82, roughness: .38,
        }));
        const darkSteel = keep(new THREE.MeshStandardMaterial({
          color: "#29312c", map: metalMap, metalness: .82, roughness: .5,
        }));
        const copper = keep(new THREE.MeshStandardMaterial({
          color: "#a66d48", metalness: .78, roughness: .29,
          emissive: "#3e190b", emissiveIntensity: .42,
        }));
        const copperGlow = keep(new THREE.MeshStandardMaterial({
          color: "#b8734a", metalness: .34, roughness: .24,
          emissive: "#b8734a", emissiveIntensity: 1.4,
        }));
        const emerald = keep(new THREE.MeshStandardMaterial({
          color: "#245c43", metalness: .72, roughness: .38,
          emissive: "#0b3d2e", emissiveIntensity: .52,
        }));
        const ivoryMetal = keep(new THREE.MeshStandardMaterial({
          color: "#c8c1ad", metalness: .54, roughness: .44,
          emissive: "#4c493d", emissiveIntensity: .24,
        }));
        const woven = keep(new THREE.MeshPhysicalMaterial({
          color: "#ede7d9", map: weaveMap, roughness: .92, metalness: .02,
          side: THREE.DoubleSide, clearcoat: .02,
        }));
        const floorMaterial = keep(new THREE.MeshStandardMaterial({
          color: "#1a211c", map: floorMap, metalness: .58, roughness: .28, side: THREE.DoubleSide,
        }));
        const warmPortal = keep(new THREE.MeshBasicMaterial({ color: "#d8c8a6" }));
        const darkBackdrop = keep(new THREE.MeshBasicMaterial({ color: "#10120f", side: THREE.DoubleSide }));

        scene.add(new THREE.HemisphereLight(0xd5d8c8, 0x0a100c, 1.45));
        const key = new THREE.DirectionalLight(0xe1d4b8, 2.2);
        key.position.set(-8, 10, 12); scene.add(key);
        const edge = new THREE.DirectionalLight(0x3e8a65, 2.2);
        edge.position.set(8, -2, -20); scene.add(edge);
        const addLight = (color: string, power: number, distance: number, pos: [number, number, number]) => {
          const light = new THREE.PointLight(color, power, distance, 2);
          light.position.set(...pos); scene.add(light);
        };
        addLight("#b8734a", 86, 30, [0, 1.6, -7]);
        addLight("#246b4c", 58, 38, [-5, 4, -36]);
        addLight("#b8734a", 48, 30, [0, 0, -72]);
        addLight("#2e5748", 55, 34, [0, 2, -94]);
        addLight("#b8734a", 72, 34, [-7, 0, -118]);
        addLight("#e1cda8", 78, 44, [0, 2.5, -159]);

        // Continuous shell: ribs and rails share this same centreline and fill the camera frame.
        const shellGeometry = keep(new THREE.CylinderGeometry(12.7, 12.7, 138, 64, 1, true));
        shellGeometry.rotateX(Math.PI / 2);
        const shellMaterial = keep(new THREE.MeshStandardMaterial({
          color: "#17241b", map: metalMap, metalness: .74, roughness: .51,
          side: THREE.BackSide, emissive: "#061b12", emissiveIntensity: .55,
        }));
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        shell.position.z = -65; scene.add(shell);

        const floorGeometry = keep(new THREE.PlaneGeometry(25.2, 146));
        floorGeometry.rotateX(-Math.PI / 2);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(0, -12.52, -61); scene.add(floor);

        // One rib every 4.28 units; every fourth becomes a visible copper milestone collar.
        for (let i = 0; i < 31; i++) {
          const z = -4 - i * 4.28;
          const milestone = i % 4 === 0;
          const rib = ring(THREE, milestone ? 12.12 : 12.34, milestone ? .135 : .055, milestone ? copper : darkSteel, z);
          keep(rib.geometry); scene.add(rib);
          if (milestone) {
            const inner = ring(THREE, 11.86, .025, copperGlow, z - .11);
            keep(inner.geometry); scene.add(inner);
          }
          // Twelve equally spaced brackets repeat on alternate ribs.
          if (i % 2 === 0) {
            const geom = keep(new THREE.BoxGeometry(.26, .98, .4));
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

        // Twenty axial rails create a continuous vanishing point; four are copper.
        for (let j = 0; j < 20; j++) {
          const a0 = j / 20 * Math.PI * 2;
          const points = [];
          for (let k = 0; k <= 9; k++) {
            const z = -2 - k * 14.6;
            const a = a0 + Math.sin(k * .7 + j * .12) * .045;
            points.push(new THREE.Vector3(Math.cos(a) * 11.9, Math.sin(a) * 11.9, z));
          }
          const curve = new THREE.CatmullRomCurve3(points);
          const geom = keep(new THREE.TubeGeometry(curve, 110, j % 4 === 0 ? .072 : .034, 5, false));
          scene.add(new THREE.Mesh(geom, j % 4 === 0 ? copper : emerald));
        }

        // Scene 2: one centered gear gate, with evenly indexed teeth and concentric machined rings.
        gear = new THREE.Group(); gear.position.z = -6.6;
        const gateRings = [
          ring(THREE, 10.1, .24, darkSteel, 0),
          ring(THREE, 9.46, .095, copper, -.24),
          ring(THREE, 7.2, .15, metal, -.48),
          ring(THREE, 5.15, .1, emerald, -.66),
          ring(THREE, 3.35, .055, copperGlow, -.98),
        ];
        gateRings.forEach((item) => { keep(item.geometry); gear.add(item); });
        const toothGeometry = keep(new THREE.BoxGeometry(.82, .32, .7));
        const teeth = new THREE.InstancedMesh(toothGeometry, copper, 48);
        const tooth = new THREE.Object3D();
        for (let i = 0; i < 48; i++) {
          const a = i / 48 * Math.PI * 2;
          tooth.position.set(Math.cos(a) * 10.22, Math.sin(a) * 10.22, 0);
          tooth.rotation.set(0, 0, a); tooth.updateMatrix(); teeth.setMatrixAt(i, tooth.matrix);
        }
        teeth.instanceMatrix.needsUpdate = true; gear.add(teeth);
        const spokeGeometry = keep(new THREE.BoxGeometry(3.6, .095, .16));
        for (let i = 0; i < 12; i++) {
          const spoke = new THREE.Mesh(spokeGeometry, metal);
          spoke.position.set(Math.cos(i / 12 * Math.PI * 2) * 3.7, Math.sin(i / 12 * Math.PI * 2) * 3.7, -.36);
          spoke.rotation.z = i / 12 * Math.PI * 2; gear.add(spoke);
        }
        scene.add(gear);

        // Scene 4: five gates at fixed depth intervals, mapped to the five C-suite roles.
        const roleColors = [copperGlow, emerald, ivoryMetal, copper, emerald];
        for (let i = 0; i < 5; i++) {
          const z = -43 - i * 4.5;
          const outer = ring(THREE, 4.4 + (i % 2) * .42, .12, roleColors[i], z, 72);
          const inner = ring(THREE, 3.78 + (i % 2) * .42, .035, darkSteel, z - .14, 72);
          keep(outer.geometry); keep(inner.geometry); scene.add(outer, inner);
        }

        // Scene 4b: Day 1 station with three decision rings on one shared plane.
        dayOne = new THREE.Group(); dayOne.position.z = -74;
        for (let i = -1; i <= 1; i++) {
          const outer = ring(THREE, i === 0 ? 3.15 : 2.45, .11, i === 0 ? copperGlow : metal, 0, 72);
          const inner = ring(THREE, i === 0 ? 2.85 : 2.17, .025, emerald, -.16, 64);
          outer.position.x = inner.position.x = i * 5.4;
          keep(outer.geometry); keep(inner.geometry); dayOne.add(outer, inner);
        }
        scene.add(dayOne);

        // Scene 4c: Day 2 converges into a larger marketplace portal.
        dayTwo = new THREE.Group(); dayTwo.position.z = -94;
        const dayTwoParts = [
          ring(THREE, 4.2, .16, copper, 0, 80),
          ring(THREE, 3.7, .055, copperGlow, -.18, 80),
          ring(THREE, 2.1, .09, emerald, -.1, 64),
          ring(THREE, 2.1, .09, emerald, -.1, 64),
        ];
        dayTwoParts[2].position.x = -4.15; dayTwoParts[3].position.x = 4.15;
        dayTwoParts.forEach((part) => { keep(part.geometry); dayTwo.add(part); });
        scene.add(dayTwo);

        // Scene 5: the three rings for Build / Move / Fund form one intentional triptych.
        ringTrio = new THREE.Group(); ringTrio.position.z = -116;
        const triad = [
          { x: -7.35, r: 3.5, material: copperGlow },
          { x: 0, r: 4.05, material: emerald },
          { x: 7.35, r: 3.5, material: ivoryMetal },
        ];
        triad.forEach((item, index) => {
          const outer = ring(THREE, item.r, .16, item.material, 0, 80);
          const inner = ring(THREE, item.r - .36, .04, darkSteel, -.18, 72);
          outer.position.x = inner.position.x = item.x;
          const bridge = new THREE.Mesh(keep(new THREE.BoxGeometry(.08, item.r * 1.7, .12)), index === 1 ? copperGlow : darkSteel);
          bridge.position.set(item.x, 0, -.08);
          [outer, inner, bridge].forEach((part) => {
            if (part.geometry) keep(part.geometry);
            ringTrio.add(part);
          });
        });
        scene.add(ringTrio);

        // Scene 6: a quiet chamber and a single warm portal beyond the parted curtains.
        const endWall = new THREE.Mesh(keep(new THREE.PlaneGeometry(48, 38)), darkBackdrop);
        endWall.position.z = -164.5; scene.add(endWall);
        endPortal = new THREE.Group(); endPortal.position.z = -160.8;
        [
          ring(THREE, 7.25, .18, copper, 0, 120),
          ring(THREE, 6.75, .055, copperGlow, -.08, 120),
          ring(THREE, 5.98, .035, warmPortal, -.14, 120),
        ].forEach((part) => { keep(part.geometry); endPortal.add(part); });
        scene.add(endPortal);
        endGlow = new THREE.Mesh(keep(new THREE.CircleGeometry(5.82, 96)), keep(new THREE.MeshBasicMaterial({
          color: "#b69e79", transparent: true, opacity: .16, side: THREE.DoubleSide,
        })));
        endGlow.position.z = -160.55; scene.add(endGlow);
        for (let i = 0; i < 7; i++) {
          const marker = new THREE.Mesh(
            keep(new THREE.BoxGeometry(.065, .035, 3.2)),
            i % 2 === 0 ? copperGlow : emerald,
          );
          marker.position.set(0, -12.35, -139 - i * 2.4); scene.add(marker);
        }

        const openingClothMaterial = keep(new THREE.MeshPhysicalMaterial({
          color: "#ede7d9", map: weaveMap, roughness: .88, metalness: .02, side: THREE.DoubleSide,
        }));
        cloths.push(
          curtain(THREE, scene, { width: 27, height: 36, centerX: -13.5, z: 17, side: -1, role: "opening", material: openingClothMaterial }),
          curtain(THREE, scene, { width: 27, height: 36, centerX: 13.5, z: 17, side: 1, role: "opening", material: openingClothMaterial }),
        );
        const finaleClothMaterial = keep(new THREE.MeshPhysicalMaterial({
          color: "#bfb39a", map: weaveMap, roughness: .88, metalness: .01,
          side: THREE.DoubleSide, transparent: true, opacity: .98,
        }));
        cloths.push(
          curtain(THREE, scene, { width: 17.5, height: 35, centerX: -8.75, z: -142, side: -1, role: "finale", material: finaleClothMaterial }),
          curtain(THREE, scene, { width: 17.5, height: 35, centerX: 8.75, z: -142, side: 1, role: "finale", material: finaleClothMaterial }),
        );

        const boltGeometry = keep(new THREE.SphereGeometry(.07, 8, 6));
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

        const onResize = () => {
          if (!renderer || !camera || cancelled) return;
          const w = Math.max(1, canvas.clientWidth || innerWidth);
          const h = Math.max(1, canvas.clientHeight || innerHeight);
          camera.aspect = w / h; camera.updateProjectionMatrix();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? .82 : 1.25));
          renderer.setSize(w, h, false);
        };
        window.addEventListener("resize", onResize);
        (canvas as HTMLCanvasElement & { __cleanup?: () => void }).__cleanup = () => window.removeEventListener("resize", onResize);

        const render = (now: number) => {
          if (cancelled) return;
          const reduced = reducedMotionRef.current;
          const fpsInterval = window.innerWidth < 768 ? 1000 / 30 : 1000 / 45;
          if (!document.hidden && now - lastFrame >= fpsInterval) {
            lastFrame = now;
            const p = progressRef.current;
            const t = reduced ? 0 : now / 1000;
            camera.position.set(Math.sin(p * Math.PI * 2.2) * .32, Math.sin(p * Math.PI * 2.8) * .22, 38 - p * 190);
            camera.lookAt(Math.sin(p * Math.PI * 2.2) * .18, .08 * Math.sin(p * 5), camera.position.z - 20);
            gear.rotation.z = reduced ? 0 : p * Math.PI * 4.2;
            dayOne.rotation.z = reduced ? 0 : smooth(.52, .65, p) * .035;
            dayTwo.rotation.z = reduced ? 0 : -smooth(.62, .76, p) * .045;
            ringTrio.rotation.z = reduced ? 0 : smooth(.68, .84, p) * .035;
            endPortal.rotation.z = reduced ? 0 : smooth(.82, 1, p) * .04;
            endGlow.material.opacity = .08 + smooth(.85, .99, p) * .28;
            for (const item of cloths) {
              if ((item.role === "opening" && p < .28) || (item.role === "finale" && p > .76)) animateCurtain(THREE, item, p, t, reduced);
            }
            renderer.render(scene, camera);
          }
          frame = window.requestAnimationFrame(render);
        };
        frame = window.requestAnimationFrame(render);
      } catch (error) {
        console.warn("3D scene initialisation failed; keeping the CSS backdrop visible.", error);
        canvas.style.display = "none";
      }
    };

    void boot();
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      (canvas as HTMLCanvasElement & { __cleanup?: () => void }).__cleanup?.();
      if (scene) scene.traverse((object: any) => {
        if (object.geometry && !resources.has(object.geometry)) object.geometry.dispose?.();
      });
      resources.forEach((resource) => resource?.dispose?.());
      renderer?.dispose?.();
    };
  }, [progressRef, reducedMotionRef]);

  return <canvas ref={canvasRef} className="fa-story-canvas" aria-hidden="true" />;
}
