import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';

// --- 1. SETUP CLEAN SCENE ---
const scene = new THREE.Scene();
// Warna Langit Biru Cerah (Natural Light)
scene.background = new THREE.Color(0x87CEEB);
// Opsi lain: 0xf0f0f0 (Putih bersih) atau 0x202020 (Gelap elegan)

// Kamera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const initialCameraPosition = new THREE.Vector3(8, 6, 10);
camera.position.copy(initialCameraPosition); // Posisi "Drone View"

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

// --- SETUP GUI ---
const gui = new GUI();
const defaults = {
  exposure: 0.9,
  background: 0x87CEEB,
  ambientIntensity: 0.6,
  sunIntensity: 3,
  autoRotate: false,
  rotateSpeed: 2.0,
};

const folderRenderer = gui.addFolder('Renderer');
folderRenderer.add(renderer, 'toneMappingExposure', 0, 2).name('Exposure').listen();
folderRenderer.addColor(new validateColor(scene.background), 'color').name('Background').onChange((val) => {
  scene.background.set(val);
}).listen();

function validateColor(color) {
  this.color = color.getHex();
}

document.body.appendChild(renderer.domElement);

// --- 3. PENCAHAYAAN ALAMI (NATURAL) ---

// A. Hemisphere Light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemiLight);

const folderEnvironment = gui.addFolder('Ambient Light');
folderEnvironment.add(hemiLight, 'intensity', 0, 2).name('Intensity').listen();

// B. Matahari

// --- 4. KONTROL ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Gerakan halus
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0); // Fokus ke tengah ruangan

const folderControls = gui.addFolder('Controls');
folderControls.add(controls, 'autoRotate').name('Auto Rotate').listen();
folderControls.add(controls, 'autoRotateSpeed', 0, 10).name('Rotate Speed').listen();

// Store Sun reference
let sunLight = null;
let initialSunPosition = new THREE.Vector3();

const obj = {
  resetAll: function () {
    // 1. Reset Camera & Controls
    camera.position.copy(initialCameraPosition);
    controls.target.set(0, 1, 0);
    controls.autoRotate = defaults.autoRotate;
    controls.autoRotateSpeed = defaults.rotateSpeed;
    controls.update();

    // 2. Reset Renderer
    renderer.toneMappingExposure = defaults.exposure;
    scene.background.setHex(defaults.background);

    // Manual update for color controller because .listen() works on direct properties, 
    // but our color helper is an object wrapper. We need to iterate controllers.
    // For simplicity, we just set the scene and let the user see the change in view.

    // 3. Reset Lights
    hemiLight.intensity = defaults.ambientIntensity;

    if (sunLight) {
      sunLight.intensity = defaults.sunIntensity;
      sunLight.position.copy(initialSunPosition);
    }
  },
};

folderControls.add(obj, 'resetAll').name('Reset All Settings');

// --- 5. LOAD MODEL ---
const loadingManager = new THREE.LoadingManager();

const loadingContainer = document.getElementById('loading-container');
const loadingText = document.getElementById('loading-text');

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const progress = (itemsLoaded / itemsTotal) * 100;
  loadingText.innerText = `Loading Model... ${Math.round(progress)}%`;
};

loadingManager.onLoad = () => {
  console.log('Loading Complete');
  // Fade out loading screen
  loadingContainer.style.opacity = '0';
  setTimeout(() => {
    loadingContainer.style.display = 'none';
  }, 500);
};

loadingManager.onError = (url) => {
  console.error('There was an error loading ' + url);
  loadingText.innerText = 'Error Loading Model';
  loadingText.style.color = 'red';
};

const loader = new GLTFLoader(loadingManager);

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

        // Kualitas Bayangan Matahari (2K Shadow - Optimized)
        child.shadow.mapSize.width = 2048;
        child.shadow.mapSize.height = 2048;
        child.shadow.bias = -0.0001; // Mengurangi error garis-garis

        // Memperluas area jangkauan matahari agar mencakup seluruh kelas
        const d = 20;
        child.shadow.camera.left = -d;
        child.shadow.camera.right = d;
        child.shadow.camera.top = d;
        child.shadow.camera.bottom = -d;

        // Kekuatan Matahari (Sesuaikan jika terlalu terang/gelap)
        child.intensity = 3;

        // Capture for Reset
        sunLight = child;
        initialSunPosition.copy(child.position);

        const folderSun = gui.addFolder('Sun Light');
        folderSun.add(child, 'intensity', 0, 10).name('Intensity').listen();
        folderSun.add(child.position, 'x', -50, 50).name('Pos X').listen();
        folderSun.add(child.position, 'y', 0, 100).name('Pos Y').listen();
        folderSun.add(child.position, 'z', -50, 50).name('Pos Z').listen();
      }
    });

    scene.add(model);
    console.log('Model Ready');
  },
  undefined,
  (error) => {
    console.error('Error:', error);
  }
);

// --- 6. ANIMASI ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// --- 7. RESPONSIF ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});