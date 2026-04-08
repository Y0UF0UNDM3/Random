import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com';
import { GLTFLoader } from 'https://unpkg.com';

// --- SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky Blue
scene.fog = new THREE.Fog(0x87CEEB, 0, 200);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

// --- LIGHTING ---
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(50, 100, 50);
scene.add(sun);

// --- LOAD TERRAIN ---
const loader = new GLTFLoader();
loader.load('assets/models/terrain/terrain.glb', (gltf) => {
    const terrain = gltf.scene;
    scene.add(terrain);
    console.log("Terrain Loaded Successfully");
}, undefined, (err) => console.error("Terrain failed to load. Check path."));

// --- BUILDING SYSTEM ---
const objects = []; // List of buildable blocks
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const boxMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Wood/Dirt color

window.addEventListener('mousedown', (event) => {
    if (!controls.isLocked) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const intersect = intersects[0];

        // LEFT CLICK: Build
        if (event.button === 0) {
            const voxel = new THREE.Mesh(boxGeo, boxMat);
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            voxel.position.divideScalar(1).floor().addScalar(0.5); // Grid snapping
            scene.add(voxel);
            objects.push(voxel);
        }
        
        // RIGHT CLICK: Delete (Only blocks you built)
        if (event.button === 2) {
            if (objects.includes(intersect.object)) {
                scene.remove(intersect.object);
                objects.splice(objects.indexOf(intersect.object), 1);
            }
        }
    }
});

// Disable right-click menu
window.addEventListener('contextmenu', (e) => e.preventDefault());

// --- MOVEMENT ---
let keys = {};
document.onkeydown = (e) => keys[e.code] = true;
document.onkeyup = (e) => keys[e.code] = false;

function animate() {
    requestAnimationFrame(animate);
    
    if (controls.isLocked) {
        const speed = 0.2;
        if (keys['KeyW']) controls.moveForward(speed);
        if (keys['KeyS']) controls.moveForward(-speed);
        if (keys['KeyA']) controls.moveRight(-speed);
        if (keys['KeyD']) controls.moveRight(speed);
    }
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
