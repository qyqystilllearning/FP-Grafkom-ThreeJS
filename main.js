import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import GUI from 'lil-gui';

// Setup
const scene = new THREE.Scene();

// Default background color
const defaultBackgroundColor = 0x87CEEB;
scene.background = new THREE.Color(defaultBackgroundColor);

// Kamera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const initialCameraPosition = new THREE.Vector3(8, 6, 10);
camera.position.copy(initialCameraPosition);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
document.body.appendChild(renderer.domElement);

// HDRI Setup
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Store references to textures and lights
let exrTexture = null; 
let sunLight = null;
let initialSunPosition = new THREE.Vector3();

// Configuration for GUI
const envConfig = {
    useHDRI: false, 
    exrPath: '/models/noon_grass_4k.exr'
};

// Lil-gui setup
const gui = new GUI();
const defaults = {
    exposure: 0.9,
    background: defaultBackgroundColor,
    ambientIntensity: 0.6,
    sunIntensity: 3,
    autoRotate: false,
    rotateSpeed: 2.0,
};

// For switching lighting between ThreeJS default and HDRI
function updateLightingMode() {
  // HDRI  
  if (envConfig.useHDRI) {
        // Hide Standard Lights
        hemiLight.visible = false;
        if (sunLight) sunLight.visible = false;

        // Load EXR if not loaded yet
        if (!exrTexture) {
            new EXRLoader()
                .setDataType(THREE.HalfFloatType) 
                .load(envConfig.exrPath, (texture) => {
                    exrTexture = texture;
                    exrTexture.mapping = THREE.EquirectangularReflectionMapping;
                    
                    // Apply immediately after loading
                    scene.background = exrTexture;
                    scene.environment = exrTexture;
                }, undefined, (err) => console.error("EXR doesn't exist!", err));
        } else {
            // Apply if already loaded
            scene.background = exrTexture;
            scene.environment = exrTexture;
        }

    } else {
        // Default Lighting
        
        scene.background = new THREE.Color(defaults.background);
        scene.environment = null;
        hemiLight.visible = true;
        if (sunLight) sunLight.visible = true;
    }
}

// GUI Folders
const folderRenderer = gui.addFolder('Renderer');
folderRenderer.add(renderer, 'toneMappingExposure', 0, 2).name('Exposure').listen();
folderRenderer.addColor(new validateColor(scene.background), 'color').name('Background Color').onChange((val) => {
    if(!envConfig.useHDRI) {
        scene.background.set(val);
        defaults.background = val; // Update default reference
    }
}).listen();

// Toggle for HDRI
folderRenderer.add(envConfig, 'useHDRI').name('Use HDRI Skybox').onChange(updateLightingMode);

function validateColor(color) {
    this.color = color.isColor ? color.getHex() : color;
}

// Built-in Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemiLight);

const folderLights = gui.addFolder('Standard Lights');
folderLights.add(hemiLight, 'intensity', 0, 2).name('Ambient Intensity').listen();


// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);

const folderControls = gui.addFolder('Controls');
folderControls.add(controls, 'autoRotate').name('Auto Rotate').listen();
folderControls.add(controls, 'autoRotateSpeed', 0, 10).name('Rotate Speed').listen();

const obj = {
    resetAll: function () {
        camera.position.copy(initialCameraPosition);
        controls.target.set(0, 1, 0);
        controls.autoRotate = defaults.autoRotate;
        controls.autoRotateSpeed = defaults.rotateSpeed;
        controls.update();

        renderer.toneMappingExposure = defaults.exposure;
        
        // Reset Logic
        envConfig.useHDRI = false;
        updateLightingMode(); // This triggers the revert
        
        defaults.background = defaultBackgroundColor;
        scene.background.setHex(defaultBackgroundColor);

        hemiLight.intensity = defaults.ambientIntensity;

        if (sunLight) {
            sunLight.intensity = defaults.sunIntensity;
            sunLight.position.copy(initialSunPosition);
            sunLight.visible = true;
        }
    },
};

folderControls.add(obj, 'resetAll').name('Reset All Settings');

// Load Model
const loadingManager = new THREE.LoadingManager();
const loadingContainer = document.getElementById('loading-container');
const loadingText = document.getElementById('loading-text');

if(loadingManager && loadingText) {
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const progress = (itemsLoaded / itemsTotal) * 100;
        loadingText.innerText = `Loading Model... ${Math.round(progress)}%`;
    };

    loadingManager.onLoad = () => {
        console.log('Loading Complete');
        if(loadingContainer) {
            loadingContainer.style.opacity = '0';
            setTimeout(() => { loadingContainer.style.display = 'none'; }, 500);
        }
    };
}

const loader = new GLTFLoader(loadingManager);

loader.load(
    '/models/ruanganfix.glb',
    (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) child.material.side = THREE.DoubleSide;
            }

            if (child.isLight && child.isDirectionalLight) {
                child.castShadow = true;
                child.shadow.mapSize.set(2048, 2048);
                child.shadow.bias = -0.0001;
                const d = 20;
                child.shadow.camera.left = -d;
                child.shadow.camera.right = d;
                child.shadow.camera.top = d;
                child.shadow.camera.bottom = -d;
                child.intensity = 3;

                // Capture Sun Ref
                sunLight = child;
                initialSunPosition.copy(child.position);

                const folderSun = gui.addFolder('Sun Light');
                folderSun.add(child, 'intensity', 0, 10).name('Intensity').listen();
                folderSun.add(child.position, 'x', -50, 50).name('Pos X').listen();
                folderSun.add(child.position, 'y', 0, 100).name('Pos Y').listen();
                folderSun.add(child.position, 'z', -50, 50).name('Pos Z').listen();
                
                // Ensure visibility respects current mode on load
                child.visible = !envConfig.useHDRI;
            }
        });

        scene.add(model);
        console.log('Model Ready');
    },
    undefined,
    (error) => console.error('Error:', error)
);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});