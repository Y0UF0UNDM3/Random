import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// --- INITIAL SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky Blue

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- LIGHTING ---
scene.add(new THREE.AmbientLight(0xffffff, 1.2)); // Brighten everything
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(500, 1000, 500);
scene.add(sun);

// --- ASSET LOADING ---
const loader = new OBJLoader();

loader.load('assets/models/terrain/MountainTerrain.obj', (obj) => {
    // 1. MEASURE & CENTER: This stops the "dot" problem
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the model at 0,0,0
    obj.position.x += (obj.position.x - center.x);
    obj.position.y += (obj.position.y - center.y);
    obj.position.z += (obj.position.z - center.z);

    obj.traverse((child) => {
        if (child.isMesh) {
            // Using a bright material so you can clearly see the shape
            child.material = new THREE.MeshStandardMaterial({ 
                color: 0x8B4513, // Mountain Brown
                flatShading: true 
            });
        }
    });

    scene.add(obj);

    // 2. AUTO-ZOOM: Move camera far enough to see the whole mountain
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // Position camera looking at the center
    camera.position.set(0, maxDim * 0.5, cameraZ * 1.5);
    camera.lookAt(0, 0, 0);

    console.log("Mountain size calculated and camera positioned.");
}, 
(xhr) => { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
(err) => { console.error("Could not find MountainTerrain.obj in assets/models/terrain/"); }
);

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
