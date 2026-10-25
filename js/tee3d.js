/* WFCUSTOM — visualizador de camiseta 3D com geometria procedural e fallback SVG. */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const active = new Set();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const contrast = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const linear = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
  return .2126 * linear(r) + .7152 * linear(g) + .0722 * linear(b) > .42 ? "#242424" : "#ffffff";
};

function makeTeeShape(side) {
  const shape = new THREE.Shape();
  // Front neckline is a little deeper; the back collar is higher.
  const neckY = side === "f" ? .82 : .92;
  shape.moveTo(-.265, 1.045);
  shape.bezierCurveTo(-.205, neckY, .205, neckY, .265, 1.045);
  shape.lineTo(.445, 1.085);
  shape.lineTo(.685, .955);
  shape.lineTo(.985, .525);
  shape.quadraticCurveTo(.86, .445, .68, .385);
  shape.lineTo(.49, .595);
  shape.lineTo(.49, -.94);
  shape.quadraticCurveTo(.49, -1.075, .355, -1.075);
  shape.lineTo(-.355, -1.075);
  shape.quadraticCurveTo(-.49, -1.075, -.49, -.94);
  shape.lineTo(-.49, .595);
  shape.lineTo(-.68, .385);
  shape.quadraticCurveTo(-.86, .445, -.985, .525);
  shape.lineTo(-.685, .955);
  shape.lineTo(-.445, 1.085);
  shape.closePath();
  return shape;
}

function subdivideGeometry(source, levels = 3) {
  // Add interior vertices before bending the garment so the front/back surfaces stay smoothly curved.
  let geometry = source.toNonIndexed();
  source.dispose();
  for (let level = 0; level < levels; level++) {
    const src = geometry.attributes.position.array;
    const next = [];
    const point = (i) => [src[i], src[i + 1], src[i + 2]];
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    const push = (p) => next.push(p[0], p[1], p[2]);
    for (let i = 0; i < src.length; i += 9) {
      const a = point(i), b = point(i + 3), c = point(i + 6);
      const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
      [a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca].forEach(push);
    }
    geometry.dispose();
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(next, 3));
  }
  // Re-index identical vertices so Three.js can calculate smooth normals across neighboring triangles.
  const input = geometry.attributes.position.array;
  const vertices = [], indices = [], lookup = new Map();
  for (let i = 0; i < input.length; i += 3) {
    const x = input[i], y = input[i + 1], z = input[i + 2];
    const key = `${Math.round(x * 100000)},${Math.round(y * 100000)},${Math.round(z * 100000)}`;
    let index = lookup.get(key);
    if (index === undefined) {
      index = vertices.length / 3; lookup.set(key, index); vertices.push(x, y, z);
    }
    indices.push(index);
  }
  geometry.dispose();
  const smooth = new THREE.BufferGeometry();
  smooth.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  smooth.setIndex(indices);
  return smooth;
}

function createLogoTexture(color, showLogo, logoUrl, side) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  if (showLogo) {
    const drawPlaceholder = () => {
      ctx.save();
      ctx.fillStyle = contrast(color);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `700 ${side === "f" ? 62 : 72}px Arial, sans-serif`;
      ctx.fillText("SUA LOGO", 256, 128, 470);
      ctx.restore(); texture.needsUpdate = true;
    };
    if (logoUrl) {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(460 / img.naturalWidth, 210 / img.naturalHeight);
        const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
        texture.needsUpdate = true;
      };
      img.onerror = drawPlaceholder;
      img.src = logoUrl;
    } else drawPlaceholder();
  }
  return texture;
}

function createView(root, options) {
  const color = options.color || "#161616";
  const side = options.side || "f";
  const showLogo = !!options.showLogo;
  const logoUrl = options.logoUrl || "";
  const width = Math.max(250, root.clientWidth || 400);
  const height = Math.max(250, root.clientHeight || width);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, width / height, .1, 100);
  camera.position.set(0, 0, 4.25);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  root.replaceChildren(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x777781, 1.35));
  const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(-2.8, 3.8, 4.5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, .78); fill.position.set(3.6, .6, 2.4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, .65); rim.position.set(0, 2, -3.5); scene.add(rim);

  const group = new THREE.Group(); scene.add(group);
  const extruded = new THREE.ExtrudeGeometry(makeTeeShape(side), {
    depth: .105, bevelEnabled: true, bevelSegments: 5, steps: 1,
    bevelSize: .024, bevelThickness: .027, curveSegments: 18
  });
  const geometry = subdivideGeometry(extruded, 3);
  // A gentle convex drape across the body gives the silhouette real volume without drawn-on stripes.
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const nx = clamp(1 - (x * x) / 1.08, 0, 1);
    const ny = clamp((y + 1.12) / 2.2, 0, 1);
    const bulge = .055 * nx * (0.55 + .45 * Math.sin(ny * Math.PI));
    const frontBack = clamp((z - .0525) / .0525, -1, 1);
    pos.setZ(i, z + bulge * frontBack);
  }
  geometry.computeVertexNormals();
  const fabric = new THREE.MeshStandardMaterial({ color, roughness: .92, metalness: 0, side: THREE.DoubleSide });
  const tee = new THREE.Mesh(geometry, fabric); tee.castShadow = false; tee.receiveShadow = true;
  group.add(tee);

  // A soft, unprinted color-matched collar ring; no seam strokes or fabric noise.
  const collarShape = new THREE.Shape();
  collarShape.moveTo(-.27, 1.04);
  collarShape.bezierCurveTo(-.20, side === "f" ? .80 : .90, .20, side === "f" ? .80 : .90, .27, 1.04);
  collarShape.bezierCurveTo(.20, side === "f" ? .87 : .95, -.20, side === "f" ? .87 : .95, -.27, 1.04);
  const collarGeo = new THREE.ShapeGeometry(collarShape, 24);
  collarGeo.translate(0, 0, .148);
  const collar = new THREE.Mesh(collarGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(.88), roughness: 1, side: THREE.DoubleSide }));
  group.add(collar);

  if (showLogo) {
    const tex = createLogoTexture(color, true, logoUrl, side);
    const front = side === "f";
    const chest = front;
    const planeWidth = chest ? .28 : .72;
    const planeHeight = chest ? .14 : .34;
    const printGeo = new THREE.PlaneGeometry(planeWidth, planeHeight, 8, 4);
    const pp = printGeo.attributes.position;
    for (let i = 0; i < pp.count; i++) {
      const x = pp.getX(i);
      pp.setZ(i, .009 * (1 - (x / (planeWidth / 2)) ** 2));
    }
    printGeo.computeVertexNormals();
    const print = new THREE.Mesh(printGeo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    print.position.set(front ? .285 : 0, front ? .43 : .22, front ? .185 : -.132);
    if (!front) print.rotation.y = Math.PI;
    print.renderOrder = 3;
    group.add(print);
  }

  // Rotate the rear view toward the camera. Drag horizontally to spin all the way around.
  group.rotation.y = side === "b" ? Math.PI : 0;
  group.rotation.x = -.025;
  renderer.render(scene, camera);

  let dragging = false, lastX = 0, lastY = 0, moved = false;
  const down = e => { dragging = true; moved = false; lastX = e.clientX; lastY = e.clientY; root.classList.add("dragging"); try { root.setPointerCapture(e.pointerId); } catch (_) {} };
  const move = e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    group.rotation.y += dx * .012;
    group.rotation.x = clamp(group.rotation.x + dy * .006, -.32, .32);
    lastX = e.clientX; lastY = e.clientY;
    renderer.render(scene, camera);
  };
  const up = () => { dragging = false; root.classList.remove("dragging"); };
  const cancel = () => up();
  root.addEventListener("pointerdown", down);
  root.addEventListener("pointermove", move);
  root.addEventListener("pointerup", up);
  root.addEventListener("pointercancel", cancel);
  root.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      group.rotation.y += e.key === "ArrowLeft" ? -.12 : .12;
      renderer.render(scene, camera); e.preventDefault();
    }
  });
  root.tabIndex = 0;
  root.setAttribute("aria-label", `${side === "f" ? "Frente" : "Costas"} da camiseta em 3D. Arraste para girar ou use as setas do teclado.`);

  let resizeObserver;
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      const w = Math.max(250, root.clientWidth || 400), h = Math.max(250, root.clientHeight || w);
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.render(scene, camera);
    });
    resizeObserver.observe(root);
  }
  const dispose = () => {
    resizeObserver?.disconnect();
    root.removeEventListener("pointerdown", down); root.removeEventListener("pointermove", move);
    root.removeEventListener("pointerup", up); root.removeEventListener("pointercancel", cancel);
    geometry.dispose(); fabric.dispose(); collarGeo.dispose(); collar.material.dispose();
    group.traverse(obj => { if (obj.isMesh && obj !== tee && obj !== collar) { obj.geometry?.dispose(); const mat = obj.material; if (Array.isArray(mat)) mat.forEach(m => m.dispose()); else mat?.dispose(); if (mat?.map) mat.map.dispose(); } });
    renderer.dispose(); renderer.domElement.remove();
  };
  return dispose;
}

window.WFShirt3D = {
  mount(root, options) {
    const dispose = createView(root, options);
    root.__wfTeeDispose = dispose;
    active.add(root);
  },
  disposeAll() {
    for (const root of active) {
      try { root.__wfTeeDispose?.(); } catch (_) {}
      delete root.__wfTeeDispose;
    }
    active.clear();
  }
};
window.dispatchEvent(new Event("wf-three-ready"));
