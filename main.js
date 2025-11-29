import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- 1. SETUP DASAR (Kamera, Scene, Renderer) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x151515); // Abu-abu gelap elegan

// Kamera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(6, 4, 8); // Posisi awal kamera

// Renderer (Mesin Gambar)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Setting Bayangan & Warna
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Bayangan lembut
renderer.outputColorSpace = THREE.SRGBColorSpace; // Warna akurat
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Pencahayaan realistis
renderer.toneMappingExposure = 1.0; // <-- KONTROL KECERAHAN GLOBAL (Turunkan ke 0.8 jika masih silau)

document.body.appendChild(renderer.domElement);

// --- 2. KONTROL INTERAKTIF ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Gerakan halus (seperti ada inersia)
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0); // Kamera fokus melihat ke tengah ruangan

// --- 3. CAHAYA PENDUKUNG ---
// Cahaya 'fill' redup supaya bagian gelap tidak hitam pekat
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
scene.add(ambientLight);

// --- 4. LOAD MODEL 3D ---
const loader = new GLTFLoader();

loader.load(
  '/models/ruanganfix.glb', // Pastikan nama file ini sesuai dengan yang di folder public/models/
  (gltf) => {
    const model = gltf.scene;

    // Diagnosa Ukuran (Cek Console Browser untuk melihat ukuran asli)
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    console.log("Ukuran Model:", size);

    // Loop untuk memperbaiki Material & Lampu dari Blender
    model.traverse((child) => {
      
      // A. Jika Objek Benda (Mesh)
      if (child.isMesh) {
        child.castShadow = true;    // Menghasilkan bayangan
        child.receiveShadow = true; // Menerima bayangan
        
        // Mencegah dinding hilang saat dilihat dari dalam
        if (child.material) {
          child.material.side = THREE.DoubleSide; 
        }
      }

      // B. Jika Objek Lampu (Light) dari Blender
      if (child.isLight) {
        child.castShadow = true;
        child.shadow.bias = -0.0005; // Mengurangi error garis-garis pada bayangan
        child.shadow.mapSize.width = 2048; // Kualitas bayangan tajam
        child.shadow.mapSize.height = 2048;

        // --- PENGATURAN KECERAHAN LAMPU ---
        // Di sini kita atur manual agar tidak over-exposure (putih semua)
        // Kita set ke angka 2. Jika masih gelap, naikkan ke 3 atau 4.
        // Jika masih silau, turunkan ke 1.
        child.intensity = 2; 
        
        // Opsional: Batas jarak cahaya biar performa ringan
        child.distance = 10; 
      }
    });

    scene.add(model);
    console.log('Model berhasil dimuat!');
  },
  (xhr) => {
    // Progress loading
    console.log((xhr.loaded / xhr.total * 100) + '% terload');
  },
  (error) => {
    console.error('Terjadi error saat memuat model:', error);
  }
);

// --- 5. ANIMASI LOOP ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// --- 6. RESPONSIF WINDOW ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});