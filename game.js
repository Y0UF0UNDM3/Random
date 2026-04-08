import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(100, 1000, 100);
scene.add(sun);

const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

const objLoader = new OBJLoader();

objLoader.load('assets/models/terrain/MountainTerrain.obj', (obj) => {
    // 1. Center the model and find its size
    const box = new THREE.Box3().setFromObject(obj);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Reposition the mountain so its center is at (0,0,0)
    obj.position.x -= center.x;
    obj.position.y -= center.y;
    obj.position.z -= center.z;

    obj.traverse((child) => {
        if (child.isMesh) {
            // Using MeshNormalMaterial so you see the shape even without textures
            child.material = new THREE.MeshNormalMaterial(); 
        }
    });

    scene.add(obj);

    // 2. Automatically position camera to see the WHOLE mountain
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(0, maxDim * 0.5, maxDim * 1.5);
    camera.lookAt(0, 0, 0);

    console.log("Mountain centered and visible.");
}, (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, (err) => {
    console.error("Check your path: assets/models/terrain/MountainTerrain.obj");
});

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
