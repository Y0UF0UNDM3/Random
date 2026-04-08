import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const textureLoader = new THREE.TextureLoader();
const objLoader = new OBJLoader();

// Load the textures manually as there is no .mtl file
const baseTexture = textureLoader.load('assets/models/terrain/MountainTerrain.jpg');
const secondaryTexture = textureLoader.load('assets/models/terrain/Mountain_Terrain.png');

objLoader.load('assets/models/terrain/MountainTerrain.obj', (obj) => {
    
    // Automatically center and scale the mountain to fit the screen
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    obj.position.x -= center.x;
    obj.position.y -= center.y;
    obj.position.z -= center.z;

    obj.traverse((child) => {
        if (child.isMesh) {
            // Mapping your JPG to the mountain surface
            child.material = new THREE.MeshStandardMaterial({ 
                map: baseTexture,
                normalMap: secondaryTexture // Using PNG for extra detail
            });
        }
    });

    scene.add(obj);

    // Zoom the camera so the mountain fills the screen
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(0, maxDim * 0.5, maxDim * 1.5);
    camera.lookAt(0, 0, 0);

}, undefined, (err) => {
    console.error("Path error! Ensure files are in: assets/models/terrain/");
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
