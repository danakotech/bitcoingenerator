/*!
 * direccionesbitcoin.com — Escena 3D (moneda ₿, cadena de bloques, partículas)
 * Autor: Félix Loureiro Etcheverría
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { faceCanvas, edgeCanvas } from './lib/coinart';

export interface SceneApi {
  energize(amount: number): void;
  celebrate(): void;
  setAnchorsRoot(root: ParentNode): void;
}

const ORANGE = new THREE.Color('#F7931A');
const damp = (cur: number, target: number, ease: number, dt: number) =>
  cur + (target - cur) * (1 - Math.pow(1 - ease, dt * 60));

export function createScene(canvas: HTMLCanvasElement): SceneApi | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  const isMobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#050505');
  scene.fog = new THREE.FogExp2('#050505', 0.045);

  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight('#fff1dd', 2.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.PointLight(ORANGE, 30, 12, 2);
  rim.position.set(-3, -1, -2);
  scene.add(rim);

  /* ---------- Moneda ---------- */
  const rig = new THREE.Group(); // posición/escala anclada al DOM
  const tilt = new THREE.Group(); // inclinación por ratón
  const coin = new THREE.Group(); // giro propio
  rig.add(tilt);
  tilt.add(coin);
  scene.add(rig);

  const faceMap = new THREE.CanvasTexture(faceCanvas('color'));
  faceMap.colorSpace = THREE.SRGBColorSpace;
  faceMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const faceBump = new THREE.CanvasTexture(faceCanvas('bump'));
  const edgeBump = new THREE.CanvasTexture(edgeCanvas());
  edgeBump.wrapS = THREE.RepeatWrapping;

  const faceMat = new THREE.MeshPhysicalMaterial({
    map: faceMap,
    bumpMap: faceBump,
    bumpScale: 3,
    metalness: 1,
    roughness: 0.3,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    emissive: ORANGE,
    emissiveIntensity: 0.02,
  });
  const edgeMat = new THREE.MeshPhysicalMaterial({
    color: '#e88a1c',
    bumpMap: edgeBump,
    bumpScale: 2,
    metalness: 1,
    roughness: 0.32,
    emissive: ORANGE,
    emissiveIntensity: 0.03,
  });
  const coinGeo = new THREE.CylinderGeometry(1, 1, 0.13, 160, 1);
  // Cara inferior: invertimos U para que el ₿ no salga en espejo
  const uv = coinGeo.attributes.uv;
  const pos = coinGeo.attributes.position;
  const idx = coinGeo.groups[2];
  const index = coinGeo.index!;
  const done = new Set<number>();
  for (let i = idx.start; i < idx.start + idx.count; i++) {
    const v = index.getX(i);
    if (done.has(v)) continue;
    done.add(v);
    if (pos.getY(v) < 0) uv.setX(v, 1 - uv.getX(v));
  }
  uv.needsUpdate = true;
  const coinMesh = new THREE.Mesh(coinGeo, [edgeMat, faceMat, faceMat]);
  coinMesh.rotation.x = Math.PI / 2;
  coin.add(coinMesh);

  // halo de energía
  const haloMat = new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const halo = new THREE.Mesh(new THREE.RingGeometry(1.08, 1.12, 160), haloMat);
  tilt.add(halo);

  /* ---------- Anillo de bloques (cadena) ---------- */
  const ringG = new THREE.Group();
  rig.add(ringG);
  const N = isMobile ? 10 : 16;
  const blockGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const edgeGeo = new THREE.EdgesGeometry(blockGeo);
  const blockMat = new THREE.MeshStandardMaterial({ color: '#111', metalness: 0.9, roughness: 0.35 });
  const lineMat = new THREE.LineBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.9 });
  const blocks: THREE.Mesh[] = [];
  for (let i = 0; i < N; i++) {
    const b = new THREE.Mesh(blockGeo, blockMat);
    b.add(new THREE.LineSegments(edgeGeo, lineMat));
    b.userData.a = (i / N) * Math.PI * 2;
    b.userData.r = 1.75 + (i % 3) * 0.08;
    b.userData.s = Math.random() * Math.PI * 2;
    ringG.add(b);
    blocks.push(b);
  }
  const chainGeo = new THREE.BufferGeometry();
  chainGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N + 1) * 3), 3));
  const chainLine = new THREE.Line(chainGeo, new THREE.LineBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.25 }));
  ringG.add(chainLine);
  ringG.rotation.x = 1.15;

  /* ---------- Partículas ---------- */
  const P = isMobile ? 600 : 1600;
  const pGeo = new THREE.BufferGeometry();
  const pArr = new Float32Array(P * 3);
  for (let i = 0; i < P; i++) {
    pArr[i * 3] = (Math.random() - 0.5) * 22;
    pArr[i * 3 + 1] = (Math.random() - 0.5) * 14;
    pArr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
  const dot = document.createElement('canvas');
  dot.width = dot.height = 64;
  const dg = dot.getContext('2d')!;
  const rg = dg.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, 'rgba(255,255,255,1)');
  rg.addColorStop(0.3, 'rgba(255,190,110,.6)');
  rg.addColorStop(1, 'rgba(255,150,40,0)');
  dg.fillStyle = rg;
  dg.fillRect(0, 0, 64, 64);
  const pMat = new THREE.PointsMaterial({
    size: 0.06,
    map: new THREE.CanvasTexture(dot),
    color: '#ffb05a',
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  /* ---------- Post-proceso ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight).multiplyScalar(isMobile ? 0.5 : 1), 0.5, 0.45, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- Estado ---------- */
  const st = {
    x: { c: 2, t: 2 },
    y: { c: 0, t: 0 },
    s: { c: 0.2, t: 1 },
    dim: { c: 0, t: 0 },
    tx: { c: 0, t: 0 },
    ty: { c: 0, t: 0 },
    energy: 0,
    spin: 0,
    flip: 0,
    pulse: 0,
  };
  let anchorRoot: ParentNode = document;
  let anchors: HTMLElement[] = [];
  const collect = () => (anchors = Array.from(anchorRoot.querySelectorAll<HTMLElement>('[data-coin-anchor]')));
  collect();

  const halfH = () => camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

  function updateAnchor() {
    const vh = innerHeight;
    const vw = innerWidth;
    let best: HTMLElement | null = null;
    let bestVis = 0;
    for (const a of anchors) {
      const r = a.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / Math.min(r.height, vh);
      if (vis > bestVis) {
        bestVis = vis;
        best = a;
      }
    }
    const hH = halfH();
    const hW = hH * camera.aspect;
    if (best && bestVis > 0.2) {
      const r = best.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      st.x.t = ((cx / vw) * 2 - 1) * hW;
      st.y.t = (-(cy / vh) * 2 + 1) * hH;
      const px = Math.min(r.width, r.height);
      st.s.t = Math.max(0.3, ((px / vh) * 2 * hH) / 2 / 2.05);
      st.dim.t = 0;
    } else {
      const narrow = camera.aspect < 1;
      st.x.t = hW * (narrow ? 1.6 : 0.95);
      st.y.t = hH * -0.25;
      st.s.t = narrow ? 0.35 : 0.55;
      st.dim.t = 1;
    }
  }

  addEventListener(
    'pointermove',
    (e) => {
      st.tx.t = (e.clientY / innerHeight - 0.5) * 0.7;
      st.ty.t = (e.clientX / innerWidth - 0.5) * 0.9;
    },
    { passive: true },
  );

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
    composer.setSize(innerWidth, innerHeight);
  }
  addEventListener('resize', resize);

  let visible = !document.hidden;
  document.addEventListener('visibilitychange', () => (visible = !document.hidden));

  let lastT = performance.now();
  const chainPos = chainGeo.attributes.position as THREE.BufferAttribute;
  const motion = reduced ? 0.25 : 1;
  let elapsed = 0;

  function frame() {
    requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min(Math.max((now - lastT) / 1000, 0), 0.05);
    lastT = now;
    if (!visible) return;
    elapsed += dt;
    const t = elapsed;

    updateAnchor();
    st.x.c = damp(st.x.c, st.x.t, 0.07, dt);
    st.y.c = damp(st.y.c, st.y.t, 0.07, dt);
    st.s.c = damp(st.s.c, st.s.t, 0.06, dt);
    st.dim.c = damp(st.dim.c, st.dim.t, 0.05, dt);
    st.tx.c = damp(st.tx.c, st.tx.t, 0.06, dt);
    st.ty.c = damp(st.ty.c, st.ty.t, 0.06, dt);
    st.energy = Math.max(0, st.energy - dt * 0.6);
    st.pulse = Math.max(0, st.pulse - dt * 0.9);

    rig.position.set(st.x.c, st.y.c + Math.sin(t * 0.9) * 0.04 * st.s.c, -st.dim.c * 3);
    rig.scale.setScalar(st.s.c);
    tilt.rotation.x = st.tx.c;
    tilt.rotation.y = st.ty.c;

    st.spin += dt * (0.35 + st.energy * 6) * motion;
    coin.rotation.y = st.spin + st.flip;
    coin.rotation.x = Math.sin(t * 0.5) * 0.08;

    const glow = Math.min(1.2, st.energy * 0.45 + st.pulse * 0.8);
    faceMat.emissiveIntensity = 0.02 + glow * 0.08;
    edgeMat.emissiveIntensity = 0.03 + glow * 0.18;
    haloMat.opacity = Math.min(0.55, glow * 0.45);
    halo.scale.setScalar(1 + st.pulse * 0.6);
    bloom.strength = 0.42 + Math.min(glow, 1) * 0.35;

    ringG.rotation.z += dt * (0.12 + st.energy * 1.5) * motion;
    const spread = 1 + st.pulse * 0.6;
    blocks.forEach((b, i) => {
      const a = b.userData.a as number;
      const r = (b.userData.r as number) * spread;
      b.position.set(Math.cos(a) * r, Math.sin(a) * r, Math.sin(t * 1.2 + b.userData.s) * 0.08);
      b.rotation.x += dt * 0.4 * motion;
      b.rotation.y += dt * 0.6 * motion;
      chainPos.setXYZ(i, b.position.x, b.position.y, b.position.z);
    });
    chainPos.setXYZ(N, blocks[0].position.x, blocks[0].position.y, blocks[0].position.z);
    chainPos.needsUpdate = true;
    lineMat.opacity = 0.55 + glow * 0.45;

    points.rotation.y = t * 0.012 * motion;
    points.position.y = Math.sin(t * 0.2) * 0.2;
    pMat.opacity = 0.4 + glow * 0.4;

    composer.render();
  }
  requestAnimationFrame(frame);

  return {
    energize(amount) {
      st.energy = Math.min(1.2, st.energy + amount);
    },
    celebrate() {
      st.pulse = 1.2;
      const start = st.flip;
      const target = start + Math.PI * 4;
      const t0 = performance.now();
      const dur = reduced ? 400 : 1400;
      const stepFn = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - k, 4);
        st.flip = start + (target - start) * e;
        if (k < 1) requestAnimationFrame(stepFn);
      };
      requestAnimationFrame(stepFn);
    },
    setAnchorsRoot(root) {
      anchorRoot = root;
      collect();
    },
  };
}
