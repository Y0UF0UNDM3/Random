import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// --- ENGINE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 100, 2000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- LIGHTING ---
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(100, 500, 100);
scene.add(sun);

// --- CONTROLS ---
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

// --- LOADING MOUNTAIN ---
const textureLoader = new THREE.TextureLoader();
const objLoader = new OBJLoader();
let mountain = null;

// Adjusting to your specific filenames
textureLoader.load('assets/models/terrain/MountainTerrain.jpg', (texture) => {
    objLoader.load('assets/models/terrain/MountainTerrain.obj', (obj) => {
        mountain = obj;
        mountain.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({ map: texture });
            }
        });
        scene.add(mountain);
        console.log("Mountain loaded successfully!");
    });
});

// --- MOVEMENT ---
let keys = {};
document.onkeydown = (e) => keys[e.code] = true;
document.onkeyup = (e) => keys[e.code] = false;

const velocity = new THREE.Vector3();
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 1000);

// Starting position high in the air to avoid spawning inside the ground
camera.position.set(0, 100, 0);

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (controls.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        const moveSpeed = keys['ShiftLeft'] ? 1200.0 : 500.0;
        const dir = new THREE.Vector3();
        dir.z = Number(keys['KeyW']) - Number(keys['KeyS']);
        dir.x = Number(keys['KeyD']) - Number(keys['KeyA']);
        dir.normalize();

        if (keys['KeyW'] || keys['KeyS']) velocity.z -= dir.z * moveSpeed * delta;
        if (keys['KeyA'] || keys['KeyD']) velocity.x -= dir.x * moveSpeed * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        // GROUND SNAPPING (Stay on the mountain)
        if (mountain) {
            raycaster.ray.origin.copy(camera.position);
            raycaster.ray.origin.y += 100; // Ray origin above head
            const hits = raycaster.intersectObject(mountain, true);
            if (hits.length > 0) {
                camera.position.y = hits[0].point.y + 2.0; 
            }
        }
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
