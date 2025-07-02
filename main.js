import * as THREE from 'three';
import { getFirstObjectWithName } from './raycaster.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

let collider, mixer, actionIdle, actionInteraction;

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setControls(controls, minDistance, maxDistance, minPolarAngle, maxPolarAngle) {
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    controls.minPolarAngle = minPolarAngle;
    controls.maxPolarAngle = maxPolarAngle;
    controls.autoRotate = false;
    controls.target = new THREE.Vector3(0, 0.5, 0);
}

function onClick (event) {
    // Substituir ##### pelo nome do objeto a ser clicado
    const isCollider = getFirstObjectWithName(event, window, camera, scene, '#####');
    if(isCollider){
        scene.remove(collider);
        actionInteraction.clampWhenFinished = true;
        actionInteraction.loop = THREE.LoopOnce;
        actionIdle.crossFadeTo(actionInteraction.play(), 5, false);
    }
    listener.context.resume().then(idleSound.play());
}

function animate() {
    requestAnimationFrame(animate);
    if(mixer) {
        mixer.update(clock.getDelta());
    }    
    controls.update();
    // se quiser usar efeitos, trocar renderer por composer
    composer.render(scene, camera);
}

// RENDERER //
const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);


// SCENE //
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, (window.innerWidth / window.innerHeight), 1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
const ambientLight = new THREE.AmbientLight(0xffffff, 5);
const spotLight = new THREE.SpotLight(0xffffff, 100, 100, 1, 0.1, 1);
const pointLight = new THREE.PointLight(0xffffff, 5, 10, 0.2);
const gltfLoader = new GLTFLoader().setPath('public/models/');
//const hdrTextureURL = new URL('public/images/', import.meta.url);
const textureLoader = new RGBELoader();
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
const idleSound = new THREE.Audio(listener);
const interactionSound = new THREE.Audio(listener);

/*
textureLoader.load(hdrTextureURL, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
    scene.backgroundIntensity = 1.5;
    scene.environmentIntensity = 0.8;
})
*/
scene.background = new THREE.Color(1,1,1);

camera.add(listener);
camera.position.set(0, 2, 4);

setControls(controls, 3, 20, -1, 10);
controls.update();

pointLight.position.set(1 ,4, 3);
pointLight.castShadow = true;
pointLight.shadow.bias = -0.003;
pointLight.shadow.mapSize = new THREE.Vector2(1024,1024);
spotLight.position.set(0, 25, 0);
scene.add(pointLight);
scene.add(ambientLight);

//substituir ##### pelo nome do arquivo com terminação do formato
/*
audioLoader.load('public/sounds/#####', (buffer) => {
	idleSound.setBuffer(buffer);
	idleSound.setLoop(true);
	idleSound.setVolume(0.85);
    idleSound.autoplay = true;
    idleSound.play();
});

//substituir ##### pela pasta onde o arquivo @@@@@@ está com a terminação do formato
gltfLoader.load('#####/@@@@@@', (gltf) => {
    const mesh = gltf.scene;
    mesh.traverse((child) => {
        if(child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
    mesh.position.set(0, 0.5, 0);
    mesh.scale.set(2, 2, 2);
    scene.add(mesh);
    console.log(mesh);
    
    mixer = new THREE.AnimationMixer(mesh);
    const clips = gltf.animations;
    const clipIdle = THREE.AnimationClip.findByName(clips, 'Idle');
    const clipInteraction = THREE.AnimationClip.findByName(clips, 'Interaction');
    actionIdle = mixer.clipAction(clipIdle);
    actionInteraction = mixer.clipAction(clipInteraction);
    //actionInteraction.clampWhenFinished = true;
    actionIdle.play();
    console.log(clipIdle);
})
*/

//substituir ##### pela pasta onde o arquivo @@@@@@ está com a terminação do formato
gltfLoader.load('billboard/billboard.glb', (gltf) => {
    const mesh = gltf.scene;
    mesh.traverse((child) => {
        if(child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
    mesh.position.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
    scene.add(mesh);
    console.log('added');
})

// COMPOSER //
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
composer.renderToScreen = true;

// PASSES //
const effectPass = new UnrealBloomPass(1, 0.12, 0.15, 0.9);
composer.addPass(effectPass);

const effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms['resolution'].value.set(1 / (window.innerWidth), 1 / (window.innerHeight));
//composer.addPass(effectFXAA);

const outputPass = new OutputPass();
composer.addPass(outputPass);

animate();

//window.addEventListener('click', onClick);
window.addEventListener('resize', onWindowResize);
