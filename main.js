import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- 1. SETUP CLEAN SCENE ---
const scene = new THREE.Scene();
// Warna Langit Biru Cerah (Natural Light)
scene.background = new THREE.Color(0x87CEEB); 
// Opsi lain: 0xf0f0f0 (Putih bersih) atau 0x202020 (Gelap elegan)

// Kamera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8, 6, 10); // Posisi "Drone View"

// Renderer (Mesin Gambar)
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Antialias ON
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Setting Kualitas Visual (High Quality)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9; // Kecerahan kamera (0.8 - 1.2)
document.body.appendChild(renderer.domElement);

// --- 2. PENCAHAYAAN ALAMI (NATURAL) ---

// A. Hemisphere Light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemiLight);

// B. Matahari

// --- 3. KONTROL ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Gerakan halus
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0); // Fokus ke tengah ruangan

// --- 4. LOAD MODEL ---
const loader = new GLTFLoader();

loader.load(
  '/models/ruanganfix.glb', 
  (gltf) => {
    const model = gltf.scene;

    model.traverse((child) => {
      // 1. Setting Material & Bayangan Fisik
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Mencegah dinding hilang kalau dilihat dari dalam
        if (child.material) {
            child.material.side = THREE.DoubleSide;
        }
      }

      // 2. Setting Lampu Matahari (Directional Light) dari Blender
      if (child.isLight && child.isDirectionalLight) {
        child.castShadow = true;
        
        // Kualitas Bayangan Matahari (4K Shadow)
        child.shadow.mapSize.width = 4096;
        child.shadow.mapSize.height = 4096;
        child.shadow.bias = -0.0001; // Mengurangi error garis-garis
        
        // Memperluas area jangkauan matahari agar mencakup seluruh kelas
        const d = 20; 
        child.shadow.camera.left = -d;
        child.shadow.camera.right = d;
        child.shadow.camera.top = d;
        child.shadow.camera.bottom = -d;
        
        // Kekuatan Matahari (Sesuaikan jika terlalu terang/gelap)
        child.intensity = 3; 
      }
    });

    scene.add(model);
    console.log('Model Siap & Bersih!');
  },
  undefined,
  (error) => {
    console.error('Error:', error);
  }
);

// --- 5. ANIMASI ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// --- 6. RESPONSIF ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});