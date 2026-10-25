import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

let renderer, scene, camera, controls, shirt, shirtMaterial, currentHex = '#161616';
let active = false;
const canvas = document.getElementById('wf3d-canvas');
if (canvas) {
  try { init(); } catch (err) { console.error('Não foi possível iniciar o visualizador 3D:', err); }
}
function init(){
  scene = new THREE.Scene(); scene.background = new THREE.Color('#f7f7f5');
  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100); camera.position.set(0, 0.15, 6.4);
  renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b8b8, 2.0));
  const key = new THREE.DirectionalLight(0xffffff, 3.1); key.position.set(-3, 5, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 1.45); fill.position.set(4, 1, -4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(0, 4, -3); scene.add(rim);
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .065; controls.minDistance=4.4; controls.maxDistance=8.5; controls.minPolarAngle=Math.PI*.27; controls.maxPolarAngle=Math.PI*.73; controls.target.set(0,0,0);
  shirt = new THREE.Group(); scene.add(shirt);
  shirtMaterial = new THREE.MeshStandardMaterial({color:currentHex, roughness:.86, metalness:0, side:THREE.DoubleSide});
  const seam = new THREE.MeshStandardMaterial({color:'#343434', roughness:.95, side:THREE.DoubleSide});
  // Flat extruded silhouette with a small depth, so the model reads as a rotating shirt.
  const shape = new THREE.Shape();
  shape.moveTo(-.68,1.45); shape.lineTo(-1.08,1.62); shape.lineTo(-1.68,1.17); shape.lineTo(-1.38,.28); shape.lineTo(-1.08,.43); shape.lineTo(-1.08,-1.72); shape.quadraticCurveTo(-1.08,-1.82,-.96,-1.82); shape.lineTo(.96,-1.82); shape.quadraticCurveTo(1.08,-1.82,1.08,-1.72); shape.lineTo(1.08,.43); shape.lineTo(1.38,.28); shape.lineTo(1.68,1.17); shape.lineTo(1.08,1.62); shape.lineTo(.68,1.45); shape.quadraticCurveTo(.48,1.68,.30,1.64); shape.lineTo(-.30,1.64); shape.quadraticCurveTo(-.48,1.68,-.68,1.45); shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape,{depth:.075,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:10});
  const body = new THREE.Mesh(geo,shirtMaterial); body.position.z=-.04; shirt.add(body);
  // Collar ring is placed on both sides, and turns with the shirt.
  const collarMat = new THREE.MeshStandardMaterial({color:'#333333',roughness:.9,side:THREE.DoubleSide});
  const collar = new THREE.Mesh(new THREE.RingGeometry(.26,.37,48),collarMat); collar.position.set(0,1.43,.045); collar.scale.y=.54; shirt.add(collar);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(.258,48),new THREE.MeshStandardMaterial({color:'#f7f7f5',side:THREE.DoubleSide})); hole.position.set(0,1.43,.047); hole.scale.y=.54; shirt.add(hole);
  // Fine seams on hem and sleeves.
  const lineMat = new THREE.LineBasicMaterial({color:'#777777',transparent:true,opacity:.48});
  const addLine = pts => shirt.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(p[0],p[1],.065))),lineMat));
  addLine([[-1.01,-1.64],[1.01,-1.64]]); addLine([[-1.48,.77],[-1.30,.31]]); addLine([[1.48,.77],[1.30,.31]]);
  // Subtle folds, kept low contrast for a clean catalog look.
  const foldMat = new THREE.LineBasicMaterial({color:'#888888',transparent:true,opacity:.16});
  for(let i=0;i<5;i++){const x=-.62+i*.31;shirt.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,.18,.066),new THREE.Vector3(x+.035,-.16,.066),new THREE.Vector3(x,-.55,.066)]),foldMat));}
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.35,64),new THREE.MeshBasicMaterial({color:'#000000',transparent:true,opacity:.07,depthWrite:false})); shadow.rotation.x=-Math.PI/2; shadow.scale.set(1.15,.22,1); shadow.position.set(0,-1.96,0); scene.add(shadow);
  const resize = () => {const r=canvas.getBoundingClientRect(); if(!r.width||!r.height)return; renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();};
  new ResizeObserver(resize).observe(canvas); resize(); active=true;
  document.querySelectorAll('[data-wf3d-color]').forEach(b=>b.addEventListener('click',()=>setColor(b.dataset.wf3dColor)));
  document.querySelectorAll('[data-wf3d-view]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.wf3dView;if(v==='front'){shirt.rotation.y=0;setPressedView('front');}else if(v==='back'){shirt.rotation.y=Math.PI;setPressedView('back');}else{shirt.rotation.y=0;camera.position.set(0,.15,6.4);controls.target.set(0,0,0);controls.update();setPressedView('front');}}));
  document.addEventListener('wf3d:color',e=>{if(e.detail?.hex)setColor(e.detail.hex,false);});
  // Read selected color from the site's existing product configurator on initial load.
  const selected = document.querySelector('[data-act="cor"][aria-pressed="true"]');
  if(selected){const sw=selected.querySelector('i');const hex=sw?.style.backgroundColor; if(hex){const m=hex.match(/\d+/g);if(m&&m.length>=3)setColor('#'+m.slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join(''),false);}}
  animate();
}
function setColor(hex,mark=true){currentHex=hex;shirtMaterial.color.set(hex);const isWhite=hex.toLowerCase()==='#f7f7f7'||hex.toLowerCase()==='#ffffff';document.querySelectorAll('[data-wf3d-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wf3dColor.toLowerCase()===hex.toLowerCase())));const collar=shirt.children.find(o=>o.geometry?.type==='RingGeometry');if(collar)collar.material.color.set(isWhite?'#d4d4d4':'#333333');}
function setPressedView(v){document.querySelectorAll('[data-wf3d-view]').forEach(b=>{if(b.dataset.wf3dView==='front'||b.dataset.wf3dView==='back')b.setAttribute('aria-pressed',String(b.dataset.wf3dView===v));});}
function animate(){if(!active)return;requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}
