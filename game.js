import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// --- MINIMAL DIAGNOSTIC SCENE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, 2)); // Bright light

const loader = new OBJLoader();
let model;

// Load, Color, and Center
loader.load('assets/models/terrain/MountainTerrain.obj', (obj) => {
    model = obj;
    // Apply bright material to see it instantly
    model.traverse(c => c.isMesh && (c.material = new THREE.MeshNormalMaterial()));
    scene.add(model);
}, undefined, (err) => console.error("Error loading model", err));

camera.position.set(0, 50, 100);
camera.lookAt(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    // Spin it to make it obvious
    if (model) model.rotation.y += 0.02;
    renderer.render(scene, camera);
}
animate();
