import { useEffect, useRef } from "react";

type JourneyRefs = {
  progressRef: { current: number };
  reducedMotionRef: { current: boolean };
};

const MODEL_SOURCES = {
  door: "https://raw.githubusercontent.com/ToxSam/cc0-models-Polygonal-Mind/main/projects/aero-system/Aero_Door_01.glb",
  ring: "https://raw.githubusercontent.com/ToxSam/cc0-models-Polygonal-Mind/main/projects/aero-system/Aero_Station_Ring_Art.glb",
  lamp: "https://raw.githubusercontent.com/ToxSam/cc0-models-Polygonal-Mind/main/projects/aero-system/Aero_Lampost_01.glb",
};

export function TunnelModels({ progressRef, reducedMotionRef }: JourneyRefs) {
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
    let THREE: any;
    const disposableItems: any[] = [];

    const boot = async () => {
      try {
        const [threeModule, loaderModule] = await Promise.all([
          import(/* @vite-ignore */ "https://esm.sh/three@0.180.0"),
          import(/* @vite-ignore */ "https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js"),
        ]);
        if (cancelled) return;
        THREE = threeModule;

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: window.innerWidth >= 768,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 0.9 : 1.2));
        renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(new THREE.Color("#080a09"), 0.008);
        camera = new THREE.PerspectiveCamera(66, window.innerWidth / Math.max(1, window.innerHeight), 0.1, 230);
        scene.add(new THREE.AmbientLight(0xb7c9bc, 1.05));

        const addPointLight = (color: string, intensity: number, distance: number, x: number, y: number, z: number) => {
          const light = new THREE.PointLight(new THREE.Color(color), intensity, distance, 2);
          light.position.set(x, y, z);
          scene.add(light);
        };
        addPointLight("#1b9a65", 25, 36, -2.7, 1.5, -12);
        addPointLight("#b8734a", 20, 34, 2.5, -1.4, -31);
        addPointLight("#236b4b", 22, 36, 0.5, 2, -55);
        addPointLight("#b8734a", 15, 35, -1.8, -1.3, -81);

        // A continuous interior shell and ring ribs create a full-frame 3D tunnel.
        const shellGeometry = new THREE.CylinderGeometry(5.15, 5.15, 132, 48, 1, true);
        shellGeometry.rotateX(Math.PI / 2);
        const shellMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#0b3d2e"),
          emissive: new THREE.Color("#09251b"),
          emissiveIntensity: 0.2,
          metalness: 0.72,
          roughness: 0.46,
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        });
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        shell.position.z = -56;
        scene.add(shell);
        disposableItems.push(shellGeometry, shellMaterial);

        const copperMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#8d5b3d"),
          emissive: new THREE.Color("#3d1c0b"),
          emissiveIntensity: 0.62,
          metalness: 0.84,
          roughness: 0.3,
        });
        const ivoryMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#a0aea3"),
          emissive: new THREE.Color("#203d30"),
          emissiveIntensity: 0.32,
          metalness: 0.78,
          roughness: 0.36,
        });
        const emeraldMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#245a43"),
          emissive: new THREE.Color("#0c462e"),
          emissiveIntensity: 0.54,
          metalness: 0.74,
          roughness: 0.38,
        });
        disposableItems.push(copperMaterial, ivoryMaterial, emeraldMaterial);

        for (let i = 0; i < 43; i++) {
          const ringGeometry = new THREE.TorusGeometry(
            i % 4 === 0 ? 4.82 : 4.98,
            i % 4 === 0 ? 0.082 : 0.031,
            8,
            56,
          );
          const ring = new THREE.Mesh(ringGeometry, i % 4 === 0 ? copperMaterial : i % 2 === 0 ? ivoryMaterial : emeraldMaterial);
          ring.position.z = 4.6 - i * 2.85;
          ring.rotation.z = (i % 3) * 0.03;
          scene.add(ring);
          disposableItems.push(ringGeometry);
        }

        for (let railIndex = 0; railIndex < 12; railIndex++) {
          const angle = (railIndex / 12) * Math.PI * 2;
          const radius = 4.66;
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 5.4),
            new THREE.Vector3(Math.cos(angle + 0.025) * radius, Math.sin(angle + 0.025) * radius, -119),
          ]);
          const railGeometry = new THREE.TubeGeometry(curve, 88, railIndex % 3 === 0 ? 0.07 : 0.037, 6, false);
          const rail = new THREE.Mesh(railGeometry, railIndex % 3 === 0 ? copperMaterial : emeraldMaterial);
          scene.add(rail);
          disposableItems.push(railGeometry);
        }

        const braceGeometry = new THREE.BoxGeometry(0.13, 0.15, 0.54);
        const braces = new THREE.InstancedMesh(braceGeometry, ivoryMaterial, 24 * 12);
        const temporaryObject = new THREE.Object3D();
        let instance = 0;
        for (let segment = 0; segment < 24; segment++) {
          const z = 3.1 - segment * 4.5;
          for (let part = 0; part < 12; part++) {
            const angle = (part / 12) * Math.PI * 2;
            temporaryObject.position.set(Math.cos(angle) * 4.72, Math.sin(angle) * 4.72, z);
            temporaryObject.rotation.set(0, 0, angle);
            temporaryObject.updateMatrix();
            braces.setMatrixAt(instance++, temporaryObject.matrix);
          }
        }
        braces.instanceMatrix.needsUpdate = true;
        scene.add(braces);
        disposableItems.push(braceGeometry, braces);

        const loader = new loaderModule.GLTFLoader();
        const loadModel = (
          url: string,
          placements: Array<{ position: [number, number, number]; size: number; rotation?: [number, number, number] }>,
        ) =>
          new Promise<void>((resolve) => {
            loader.load(
              url,
              (gltf: any) => {
                if (cancelled) return resolve();
                const model = gltf.scene;
                model.updateMatrixWorld(true);
                const bounds = new THREE.Box3().setFromObject(model);
                const center = bounds.getCenter(new THREE.Vector3());
                const dimensions = bounds.getSize(new THREE.Vector3());
                const maxDimension = Math.max(dimensions.x, dimensions.y, dimensions.z, 0.001);
                model.position.sub(center);

                model.traverse((node: any) => {
                  if (!node.isMesh) return;
                  node.castShadow = false;
                  node.receiveShadow = false;
                  const sourceMaterials = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
                  const tintedMaterials = sourceMaterials.map((material: any) => {
                    const tinted = material.clone();
                    if (tinted.color) tinted.color.lerp(new THREE.Color("#2e5748"), 0.18);
                    if ("metalness" in tinted) tinted.metalness = Math.max(tinted.metalness || 0, 0.42);
                    if ("roughness" in tinted) tinted.roughness = Math.min(tinted.roughness ?? 0.7, 0.52);
                    disposableItems.push(tinted);
                    return tinted;
                  });
                  node.material = Array.isArray(node.material) ? tintedMaterials : tintedMaterials[0];
                });

                for (const placement of placements) {
                  const wrapper = new THREE.Group();
                  wrapper.add(model.clone(true));
                  wrapper.scale.setScalar(placement.size / maxDimension);
                  wrapper.position.set(...placement.position);
                  if (placement.rotation) wrapper.rotation.set(...placement.rotation);
                  scene.add(wrapper);
                }
                resolve();
              },
              undefined,
              (error: unknown) => {
                console.warn("A public CC0 3D asset could not be loaded:", url, error);
                resolve();
              },
            );
          });

        await Promise.all([
          loadModel(MODEL_SOURCES.ring, [
            { position: [0, 0, -12], size: 10.5 },
            { position: [0.25, -0.08, -42], size: 10.5, rotation: [0, 0, 0.1] },
            { position: [-0.22, 0.05, -73], size: 10.5, rotation: [0, 0, -0.08] },
          ]),
          loadModel(MODEL_SOURCES.door, [
            { position: [-2.95, -0.45, -25], size: 3.5 },
            { position: [2.95, -0.45, -54], size: 3.5, rotation: [0, Math.PI, 0] },
            { position: [-2.95, -0.45, -83], size: 3.5 },
          ]),
          loadModel(MODEL_SOURCES.lamp, [
            { position: [-3.55, -1.28, -18], size: 2.75 },
            { position: [3.55, -1.28, -32], size: 2.75 },
            { position: [-3.55, -1.28, -47], size: 2.75 },
            { position: [3.55, -1.28, -62], size: 2.75 },
            { position: [-3.55, -1.28, -77], size: 2.75 },
            { position: [3.55, -1.28, -92], size: 2.75 },
          ]),
        ]);

        const resize = () => {
          if (cancelled || !renderer || !camera) return;
          const width = Math.max(1, canvas.clientWidth || window.innerWidth);
          const height = Math.max(1, canvas.clientHeight || window.innerHeight);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 0.9 : 1.2));
          renderer.setSize(width, height, false);
        };
        resize();
        window.addEventListener("resize", resize);

        const render = (now: number) => {
          if (cancelled) return;
          if (!document.hidden && now - lastFrame >= 1000 / 40) {
            lastFrame = now;
            const progress = progressRef.current;
            const reduced = reducedMotionRef.current;
            const travel = progress * (reduced ? 74 : 98);
            camera.position.set(Math.sin(progress * 5.5) * 0.2, Math.sin(progress * 6.5) * 0.13, 6.5 - travel);
            camera.lookAt(Math.sin(progress * 5.5) * 0.14, 0, camera.position.z - 20);
            renderer.render(scene, camera);
          }
          frame = window.requestAnimationFrame(render);
        };
        frame = window.requestAnimationFrame(render);
        (canvas as HTMLCanvasElement & { __faModelsCleanup?: () => void }).__faModelsCleanup =
          () => window.removeEventListener("resize", resize);
      } catch (error) {
        console.warn("3D model layer initialization failed; the procedural background remains active.", error);
      }
    };

    void boot();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      const canvasWithCleanup = canvas as HTMLCanvasElement & { __faModelsCleanup?: () => void };
      canvasWithCleanup.__faModelsCleanup?.();
      if (scene) {
        scene.traverse((node: any) => {
          if (node.geometry && !disposableItems.includes(node.geometry)) node.geometry.dispose?.();
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach((material: any) => {
              if (material.map) material.map.dispose?.();
              if (!disposableItems.includes(material)) material.dispose?.();
            });
          }
        });
      }
      disposableItems.forEach((item) => item.dispose?.());
      renderer?.dispose?.();
    };
  }, [progressRef, reducedMotionRef]);

  return <canvas ref={canvasRef} className="fa-models-canvas" aria-hidden="true" />;
}
