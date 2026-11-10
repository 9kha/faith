"use client";

import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { Box, Download, Loader2 } from "lucide-react";

export type Model3DFormat = "glb" | "gltf" | "obj" | "stl";

interface Model3DFileCanvasProps {
  src: string;
  fileName: string;
  /** Changing this key reloads the scene (e.g. camera reset button). */
  loadKey?: number;
}

export function modelFormatFromFileName(fileName: string): Model3DFormat | null {
  const ext = fileName.toLowerCase().split(".").pop();
  if (ext === "glb" || ext === "gltf" || ext === "obj" || ext === "stl") {
    return ext;
  }
  return null;
}

export function Model3DFileCanvas({
  src,
  fileName,
  loadKey = 0,
}: Model3DFileCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [state, setState] = useState<{
    status: "loading" | "ready" | "error";
    src: string;
    key: number;
    message?: string;
  }>({ status: "loading", src, key: loadKey });

  // Derive-in-render reset: a new src or bumped loadKey restarts loading.
  if (state.src !== src || state.key !== loadKey) {
    setState({ status: "loading", src, key: loadKey });
  }

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch(src);
        if (cancelled) return;
        if (!res.ok) {
          setState({
            status: "error",
            src,
            key: loadKey,
            message:
              res.status === 404
                ? "Stored 3D file not found on server storage. Re-upload it to generate a preview."
                : `Could not load the 3D model (HTTP ${res.status}).`,
          });
          return;
        }

        const buffer = await res.arrayBuffer();
        if (cancelled) return;

        const THREE = await import("three");
        if (cancelled) return;

        const container = containerRef.current;
        if (!container) return;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.touchAction = "none";

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
          40,
          container.clientWidth / Math.max(container.clientHeight, 1),
          0.001,
          100000
        );

        scene.add(new THREE.HemisphereLight(0xbcd7ff, 0x16233f, 1.15));
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
        keyLight.position.set(1, 1.4, 1);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0x9ec5ff, 0.5);
        fillLight.position.set(-1.2, 0.6, -0.8);
        scene.add(fillLight);

        const root = new THREE.Group();
        scene.add(root);

        const format = modelFormatFromFileName(fileName);
        if (!format) throw new Error("Unsupported 3D format.");

        if (format === "glb" || format === "gltf") {
          const { GLTFLoader } = await import(
            "three/examples/jsm/loaders/GLTFLoader.js"
          );
          const loader = new GLTFLoader();
          const gltf = await new Promise<{ scene: Group }>((resolve, reject) => {
            try {
              if (format === "glb") {
                loader.parse(buffer, "", (parsed) => resolve(parsed), reject);
              } else {
                loader.parse(
                  new TextDecoder().decode(buffer),
                  "",
                  (parsed) => resolve(parsed),
                  reject
                );
              }
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)));
            }
          });
          root.add(gltf.scene);
        } else if (format === "obj") {
          const { OBJLoader } = await import(
            "three/examples/jsm/loaders/OBJLoader.js"
          );
          const object = new OBJLoader().parse(
            new TextDecoder().decode(buffer)
          );
          if (!object || object.children.length === 0) {
            throw new Error("OBJ file contained no geometry.");
          }
          const objMaterial = new THREE.MeshStandardMaterial({
            color: 0x8fb7d9,
            roughness: 0.55,
            metalness: 0.15,
          });
          object.traverse((child) => {
            if ((child as { isMesh?: boolean }).isMesh) {
              (child as unknown as { material: unknown }).material = objMaterial;
            }
          });
          root.add(object);
        } else {
          const { STLLoader } = await import(
            "three/examples/jsm/loaders/STLLoader.js"
          );
          const geometry = new STLLoader().parse(buffer);
          geometry.computeVertexNormals();
          const mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({
              color: 0x9ec5ff,
              roughness: 0.45,
              metalness: 0.2,
            })
          );
          root.add(mesh);
        }

        if (cancelled) return;

        // Frame the camera on the model bounds and re-centre at origin.
        const box = new THREE.Box3().setFromObject(root);
        if (box.isEmpty()) {
          throw new Error("Model has no visible geometry to render.");
        }
        const center = box.getCenter(new THREE.Vector3());
        const sizeVec = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
        const minY = box.min.y - center.y;

        root.position.sub(center);

        camera.near = maxDim / 100;
        camera.far = maxDim * 50;
        camera.position.set(maxDim * 0.85, maxDim * 0.6, maxDim * 1.05);
        camera.updateProjectionMatrix();

        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = maxDim * 0.12;
        controls.maxDistance = maxDim * 8;
        controls.target.set(0, maxDim * 0.08, 0);

        const grid = new THREE.GridHelper(
          maxDim * 2.4,
          24,
          0x274b71,
          0x152638
        );
        grid.position.y = minY;
        scene.add(grid);

        let frame = 0;
        const tick = () => {
          frame = requestAnimationFrame(tick);
          controls.update();
          renderer.render(scene, camera);
        };
        tick();

        const resize = () => {
          if (!containerRef.current) return;
          const width = containerRef.current.clientWidth;
          const height = Math.max(containerRef.current.clientHeight, 1);
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(container);

        cleanupRef.current = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          controls.dispose();
          scene.traverse((node) => {
            const mesh = node as {
              isMesh?: boolean;
              geometry?: { dispose?: () => void };
              material?: unknown;
            };
            if (mesh.isMesh) {
              mesh.geometry?.dispose?.();
              const material = mesh.material;
              if (Array.isArray(material)) {
                material.forEach((m) => (m as { dispose?: () => void }).dispose?.());
              } else {
                (material as { dispose?: () => void } | undefined)?.dispose?.();
              }
            }
          });
          grid.geometry?.dispose?.();
          ((grid.material as unknown as { dispose?: () => void }) || null)?.dispose?.();
          renderer.dispose();
          renderer.domElement.remove();
        };

        if (cancelled) {
          cleanupRef.current?.();
          cleanupRef.current = null;
          return;
        }
        setState({ status: "ready", src, key: loadKey });
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : String(error || "unknown error");
        setState({
          status: "error",
          src,
          key: loadKey,
          message: `Could not render this 3D model. ${message}`.slice(0, 240),
        });
      }
    };

    void run();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [src, fileName, loadKey]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {state.status === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#060a14]/70 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/90 px-5 py-3 shadow-xl">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            <div className="text-xs">
              <p className="font-bold text-white">Loading 3D model…</p>
              <p className="text-slate-400 font-mono">{fileName}</p>
            </div>
          </div>
        </div>
      )}

      {state.status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
              <Box className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <p className="font-bold text-base text-white">{state.message}</p>
              <p className="text-xs text-slate-400 break-all font-mono">{fileName}</p>
            </div>
            <a
              href={src}
              download
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all text-xs"
            >
              <Download className="h-4 w-4" />
              <span>Download 3D file</span>
            </a>
          </div>
        </div>
      )}

      {state.status === "ready" && (
        <div className="absolute bottom-2 left-2 z-10 hidden md:flex items-center gap-2 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-700/60 px-2.5 py-1.5 text-[10px] font-mono text-slate-400 shadow">
          <span className="text-cyan-400">◍ drag to orbit</span>
          <span className="text-slate-500">| scroll to zoom | right-drag to pan</span>
        </div>
      )}
    </div>
  );
}
