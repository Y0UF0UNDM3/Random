import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(100, 200, 100);
scene.add(sun);

// Controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

// Load OBJ Geometry
const loader = new OBJLoader();
let world = null;

loader.load('assets/models/terrain/Mountain terrain.obj', (obj) => {
    world = obj;
    world.traverse((child) => {
        if (child.isMesh) {
            // Basic clay-like material to see the shape
            child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc, flatShading: true });
        }
    });
    scene.add(world);
    console.log("Mountain Loaded");
});

// Movement Logic
let keys = {};
document.onkeydown = (e) => keys[e.code] = true;
document.onkeyup = (e) => keys[e.code] = false;

const velocity = new THREE.Vector3();
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (controls.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        const dir = new THREE.Vector3();
        dir.z = Number(keys['KeyW']) - Number(keys['KeyS']);
        dir.x = Number(keys['KeyD']) - Number(keys['KeyA']);
        dir.normalize();

        if (keys['KeyW'] || keys['KeyS']) velocity.z -= dir.z * 400.0 * delta;
        if (keys['KeyA'] || keys['KeyD']) velocity.x -= dir.x * 400.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        // Standard eye-level height
        camera.position.y = 5; 
    }
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
