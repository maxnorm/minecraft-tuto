import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { World } from './world.js';
import { createUI } from './ui.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

// Stats Setup
const stats = new Stats();
document.body.appendChild(stats.dom);

// Renderer Setup
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x4fa4bc);
document.body.appendChild(renderer.domElement);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(-32, 16, -32);

// Scene Setup
const scene = new THREE.Scene();

const world = new World();
world.generate();

// Controls Setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(world.size.width / 2, 0, world.size.width / 2);
controls.update();

scene.add(world);

// Lights Setup
function setupLights() {
  const light1 = new THREE.DirectionalLight();
  light1.position.set(1, 1, 1);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight();
  light2.position.set(-1, -1, -0.5);
  scene.add(light2);

  const ambientLight = new THREE.AmbientLight();
  ambientLight.intensity = 0.1;
  scene.add(ambientLight);
}

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setupLights();
createUI(world);
animate();