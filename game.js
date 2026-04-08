import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com';

// --- INITIALIZATION ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);
const targets = [];
let score = 0;

// --- WORLD SETUP ---
scene.background = new THREE.Color(0x050505);
scene.add(new THREE.GridHelper(100, 20, 0x00ff00, 0x222222));
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
camera.position.y = 1.6;

// --- MENU FUNCTIONS ---
window.togglePanel = (id) => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    if (id) document.getElementById(id).classList.add('active');
};

document.getElementById('start-btn').addEventListener('click', () => {
    controls.lock();
});

controls.addEventListener('lock', () => {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');
});

controls.addEventListener('unlock', () => {
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('game-ui').classList.add('hidden');
});

// --- GAMEPLAY ---
function spawnTarget() {
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    cube.position.set((Math.random()-0.5)*50, 1, (Math.random()-0.5)*50);
    scene.add(cube);
    targets.push(cube);
}

for(let i=0; i<10; i++) spawnTarget();

window.addEventListener('mousedown', () => {
    if (!controls.isLocked) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(), camera);
    const hits = raycaster.intersectObjects(targets);
    
    if (hits.length > 0) {
        scene.remove(hits[0].object);
        targets.splice(targets.indexOf(hits[0].object), 1);
        score++;
        document.getElementById('score').innerText = score;
        document.getElementById('kill-count').innerText = score;
        spawnTarget();
    }
});

// --- ENGINE LOOP ---
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
