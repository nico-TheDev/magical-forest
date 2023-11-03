import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GUIManager } from "./gui-controller";
import { TREE_TYPES } from "./constants";

import * as TWEEN from "@tweenjs/tween.js";
let _APP = null;


export class MagicalForest {
    constructor() {
        this._Initialize();
    }

    _Initialize() {
        this._clock = new THREE.Clock();
        this._threejs = new THREE.WebGLRenderer({
            antialias: true
        });
        this._threejs.shadowMap.enabled = true;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);
        this._threejs.domElement.id = "threejs";
        this._DefaultGUI = {
            initialTreeValues: {
                minCircleSize: 8,
                maxCircleSize: 40,
                normalTreeX: TREE_TYPES.NORMAL.center.x,
                normalTreeZ: TREE_TYPES.NORMAL.center.z,
                birchTreeX: TREE_TYPES.BIRCH.center.x,
                birchTreeZ: TREE_TYPES.BIRCH.center.z,
                pineTreeX: TREE_TYPES.PINE.center.x,
                pineTreeZ: TREE_TYPES.PINE.center.z,
            },
            lampLight: {
                x: 0,
                y: 0,
                z: 0,
                color: "",
                intensity: 0
            }
        };
        this._mixers = [];
        document.body.appendChild(this._threejs.domElement);

        window.addEventListener("resize", () => {
            this._OnWindowResize();
        }, false);

        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000;

        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(7, 1.5, 5);

        this._scene = new THREE.Scene();
        this._scene.fog = new THREE.Fog("#7f8c8d", 5, 50);


        // MODELS

        // LOADER RELATED

        const loadingManager = new THREE.LoadingManager();

        loadingManager.onLoad = () => {
            const loaderContainer = document.querySelector("div.loader-container");
            loaderContainer.style.display = "none";

            if (window.location.pathname.includes("debug")) {
                this._DebugManager = new GUIManager(this._scene);
                this._DebugManager._AddTreesController(this._DefaultGUI.initialTreeValues);
                this._DebugManager._AddLampController(this._DefaultGUI.lampLight);
                this._DebugManager._AddCabinController();
                this._DebugManager._AddMoonController();
                this._DebugManager._AddDogController();

            }
        };

        loadingManager.onProgress = (url, loadedAssets, totalAssets) => {
            const loaderText = document.querySelector("h6#load-percentage");
            const loaderBar = document.querySelector("div.loader-main");
            // console.log(`LOADED ${loadedAssets} / ${totalAssets}`);       
            const percentage = Math.floor((loadedAssets / totalAssets) * 100);
            loaderText.textContent = percentage + "%";
            loaderBar.style.width = percentage + "%";
            // console.log("Loaded " + percentage + "%");
        };
        this._loader = new GLTFLoader(loadingManager);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
        this._loader.setDRACOLoader(dracoLoader);


        this._LoadForest();

        // HELPERS

        const axesHelper = new THREE.AxesHelper(5);
        axesHelper.position.set(0, 10, 0);

        let light = new THREE.DirectionalLight("white", 1.5);
        light.name = "Moon";
        light.position.set(0, 5, 10);
        light.intensity = 0.08;
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;

        light.shadow.camera.left = 100;
        light.shadow.camera.right = 100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = 100;
        const directionLightHelper = new THREE.DirectionalLightHelper(light, 10);
        this._scene.add(light);

        light = new THREE.AmbientLight("#2c3e50", 1);
        light.name = "AmbientLight";
        this._scene.add(light);

        light = new THREE.PointLight("#e67e22", 1, 100);
        light.castShadow = true;
        light.receiveShadow = true;
        light.shadow.mapSize.width = 256;
        light.shadow.mapSize.height = 256;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 10;
        light.distance = 10;
        light.power = 100;

        const pointLightHelper = new THREE.PointLightHelper(light, 1);
        light.position.set(3.5, 0.9, 1.8);
        light.name = "LampLight";
        pointLightHelper.name = "LampLightHelper";
        this._scene.add(light);

        window.location.pathname.includes("debug") && this._scene.add(axesHelper, directionLightHelper, pointLightHelper);

        const controls = new OrbitControls(this._camera, this._threejs.domElement);
        controls.target.set(0, 1, 0);
        controls.maxDistance = 15;
        controls.update();

        this._LoadGround();

        this._RAF();

    }

    _LoadSky() {
        const cubeTextureLoader = new THREE.CubeTextureLoader();

        const nightSkyTexture = cubeTextureLoader
            .setPath("./textures/night-sky/")
            .load([
                'px.png', "nx.png",
                'py.png', "ny.png",
                'pz.png', "nz.png",
            ]);


        this._scene.background = nightSkyTexture;

    }

    async _LoadFireflies(count = 500, spacing = 38, size = 0.2, sizeAttenuation = true) {
        const textureLoader = new THREE.TextureLoader();
        const fireflyTexture = await textureLoader.loadAsync("./resources/particles/firefly.png");

        const particleGeometry = new THREE.BufferGeometry();

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * spacing;
            colors[i] = Math.random();
        }
        // MODIFY Y
        for (let i = 0; i < count * 3; i++) {
            const i3 = i * 3;
            const y = i3 + 1;
            positions[y] = (Math.random() - 0.5) + 1;
        }

        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial();
        particleMaterial.transparent = true;
        particleMaterial.alphaMap = fireflyTexture;
        particleMaterial.size = size;
        particleMaterial.sizeAttenuation = sizeAttenuation;
        // particleMaterial.depthTest = true;
        particleMaterial.depthWrite = false;
        particleMaterial.vertexColors = true;
        particleMaterial.blending = THREE.AdditiveBlending;

        const fireflies = new THREE.Points(particleGeometry, particleMaterial);
        fireflies.name = "fireflies";

        this._scene.add(fireflies);
    }

    _LoadGround() {
        const textureLoader = new THREE.TextureLoader();

        this.groundColorTexture = textureLoader.load("./textures/ground/ground-color.jpg");

        this.groundAmbientOcclusionTexture = textureLoader.load("./textures/ground/ground-ambientOcclusion.jpg");
        this.groundHeightTexture = textureLoader.load("./textures/ground/ground-height.png");
        this.groundNormalTexture = textureLoader.load("./textures/ground/ground-normal.jpg");
        this.groundRoughnessTexture = textureLoader.load("./textures/ground/ground-roughness.jpg");

        let repeatCount = 20;
        this.groundColorTexture.repeat.set(repeatCount, repeatCount);
        this.groundAmbientOcclusionTexture.repeat.set(repeatCount, repeatCount);
        this.groundHeightTexture.repeat.set(repeatCount, repeatCount);
        this.groundNormalTexture.repeat.set(repeatCount, repeatCount);
        this.groundRoughnessTexture.repeat.set(repeatCount, repeatCount);

        this.groundColorTexture.wrapS = THREE.RepeatWrapping;
        this.groundAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
        this.groundHeightTexture.wrapS = THREE.RepeatWrapping;
        this.groundNormalTexture.wrapS = THREE.RepeatWrapping;
        this.groundRoughnessTexture.wrapS = THREE.RepeatWrapping;

        this.groundColorTexture.wrapT = THREE.RepeatWrapping;
        this.groundAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
        this.groundHeightTexture.wrapT = THREE.RepeatWrapping;
        this.groundNormalTexture.wrapT = THREE.RepeatWrapping;
        this.groundRoughnessTexture.wrapT = THREE.RepeatWrapping;


        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({
                map: this.groundColorTexture,
                aoMap: this.groundAmbientOcclusionTexture,
                normalMap: this.groundNormalTexture,
                roughnessMap: this.groundRoughnessTexture,
                displacementMap: this.groundHeightTexture,
                displacementScale: 0.2,
            })
        );
        plane.castShadow = true;
        plane.receiveShadow = true;
        plane.rotation.x = - Math.PI / 2;
        this._scene.add(plane);


    }

    async _LoadAnimals() {
        this._LoadDog();
        this._LoadDeer();
        const model = await this._LoadDeer({ x: -4, y: 0.1, z: 3 }, 1);
        model.rotation.set(0, -1, 0);
    }

    async _LoadDog() {
        const dogScene = await this._loader.loadAsync("./resources/Shiba Inu.glb");
        const dogClips = dogScene.animations;
        // console.log(dogClips);
        const dog = dogScene.scene.children[0];
        const scale = 0.2;

        dog.scale.setScalar(scale);
        dog.position.set(-3, 0.1, 3.35);
        dog.rotation.set(0, 1.5, 0);
        dog.name = "Shiba Inu";

        const walkForwardTween = new TWEEN.Tween(dog.position);
        const rotateTween = new TWEEN.Tween(dog.rotation);
        const rotateBackTween = new TWEEN.Tween(dog.rotation);
        const walkBackTween = new TWEEN.Tween(dog.position);

        walkForwardTween.to({ x: 3 }, 5000);
        rotateTween.to({ y: -1.5 }, 2000);
        walkBackTween.to({ x: -3 }, 5000);
        rotateTween.to({ y: -1.5 }, 2000);
        rotateBackTween.to({ y: 1.5 }, 2000);

        // TWEEN 

        walkForwardTween.chain(rotateTween);
        rotateTween.chain(walkBackTween);
        walkBackTween.chain(rotateBackTween);
        rotateBackTween.chain(walkForwardTween);

        const mixer = new THREE.AnimationMixer(dog);
        this._mixers.push(mixer);
        const clip = THREE.AnimationClip.findByName(dogClips, "Walk");
        const idle = mixer.clipAction(clip);
        this._scene.add(dog);
        walkForwardTween.start(2000);
        idle.play();


    }

    async _LoadDeer(position = { x: -3, y: 0.1, z: 5 }, delay = 0) {
        const deerFile = await this._loader.loadAsync("./resources/Deer.glb");
        const deerModel = deerFile.scene.getObjectByName("RootNode");
        const deerAnims = deerFile.animations;

        deerModel.name = "Deer";
        deerModel.scale.setScalar(0.3);
        deerModel.position.set(position.x, position.y, position.z);
        deerModel.rotation.set(0, -1.5, 0);

        console.log(deerAnims);

        const mixer = new THREE.AnimationMixer(deerModel);
        this._mixers.push(mixer);

        const eatClip = THREE.AnimationClip.findByName(deerAnims, "Eating");
        const eating = mixer.clipAction(eatClip);
        if (delay) eating.startAt(delay);

        eating.play();

        this._scene.add(deerModel);

        return deerModel;

    }


    async _LoadForest() {
        this._LoadSky();
        this._LoadFoliage();
        this._LoadCabin();
        this._LoadAnimals();
        this._LoadFireflies();
        this._LoadDefaultTrees(TREE_TYPES.NORMAL, 200);
        this._LoadDefaultTrees(TREE_TYPES.MAPLE, 40);
        this._LoadDefaultTrees(TREE_TYPES.PINE, 50);
        this._LoadDefaultTrees(TREE_TYPES.BIRCH, 150);
    }

    async _LoadCabin() {
        const glb = await this._loader.loadAsync("./resources/Cabin.glb")
        const fireGLB = await this._loader.loadAsync("./resources/Campfire.glb");
        const campfire = fireGLB.scene;
        campfire.name = "campfire";
        campfire.position.set(3.35,0.3,1.6);
        const fireScale = 0.5
        campfire.scale.setScalar(fireScale)


        const cabin = glb.scene;
        cabin.children[0].castShadow = true;
        cabin.children[0].receiveShadow = true;
        cabin.children[1].castShadow = true;
        cabin.children[1].receiveShadow = true;
        cabin.position.set(0, -0.222, 0);
        let scale = 1 * 0.005;
        cabin.scale.set(scale, scale, scale);
        cabin.receiveShadow = true;
        cabin.castShadow = true;
        cabin.name = "Cabin";
        this._scene.add(cabin,campfire);
    
    }
           

    _LoadDefaultTrees(treeType, treeAmount = 200) {

        this._loader.load(`./resources/${treeType.name}.glb`,
            function (model) {
                const scene = model.scene;
                const rootNode = scene.children[0];
                let trees, maxTreeCount;
                // ADD THE DEFAULT TREES
                if (treeType.name === TREE_TYPES.PINE.name) {
                    trees = rootNode.children.filter(tree => tree.name !== "PineTree_4");
                    maxTreeCount = 4;
                } else {
                    trees = rootNode.children.map(tree => tree);
                    maxTreeCount = 5;
                }

                for (let treeCount = 0; treeCount < treeAmount; treeCount++) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = this._DefaultGUI.initialTreeValues.minCircleSize + Math.random() * this._DefaultGUI.initialTreeValues.maxCircleSize;

                    const x = Math.sin(angle) * radius;
                    const z = Math.cos(angle) * radius;

                    let tree = trees[Math.floor(Math.random() * maxTreeCount)].clone();

                    tree.children.forEach(item => {
                        item.castShadow = true;
                        item.receiveShadow = true;
                    });

                    tree.objectName = "Forest-Tree";
                    tree.treeType = treeType;
                    tree.renderOrder = treeType.order;
                    let size = Math.random() * (treeType.size.max - treeType.size.min) + treeType.size.min;
                    tree.scale.set(size, size, size);
                    tree.position.set(
                        x + treeType.center.x,
                        0,
                        z + treeType.center.z
                    );
                    tree.castShadow = true;
                    tree.receiveShadow = true;
                    this._scene.add(tree);
                }


            }.bind(this));
    }

    async _LoadFoliage() {
        const rocksScene = await this._loader.loadAsync("./resources/Rocks.glb");
        const bushesScene = await this._loader.loadAsync("./resources/Bushes.glb");
        const grassScene = await this._loader.loadAsync("./resources/Grass.glb");
        const flowersScene = await this._loader.loadAsync("./resources/Flowers.glb");

        const rocks = rocksScene.scene.children[0].children;
        const bushes = bushesScene.scene.children[0].children;
        const grass = grassScene.scene.children[0].children;
        const flowers = flowersScene.scene.children[0].children;

        // LOAD GRASS
        this._LoadMultipleAssets(grass, 10000, 40);
        // LOAD ROCKS
        this._LoadMultipleAssets(rocks, 20, 10);
        // LOAD BUSH
        this._LoadMultipleAssets(bushes, 100, 20);
        // LOAD FLOWERS
        this._LoadMultipleAssets(flowers, 1000, 10);
    }

    _LoadMultipleAssets(currentAsset, assetCount, radiusMultiplier,) {
        for (let i = 0; i < assetCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * radiusMultiplier;

            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            let asset = currentAsset[Math.floor(Math.random() * currentAsset.length)].clone();

            asset.position.set(
                x,
                0,
                z,
            );

            this._scene.add(asset);
        }
    }


    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    }

    _Step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        if (this._mixers) {
            this._mixers.map(m => m.update(timeElapsedS));
        }

        if (this._controls) {
            this._controls.Update(timeElapsedS);
        }
    }

    _RAF() {
        requestAnimationFrame((t) => {
            if (this._previousRAF === null) {
                this._previousRAF = t;
            }

            const elapsedTime = this._clock.getElapsedTime();

            this._RAF();
            TWEEN.update();

            this._threejs.render(this._scene, this._camera);
            this._Step(t - this._previousRAF);
            this._previousRAF = t;
        });
    }


}


window.addEventListener("DOMContentLoaded", () => {
    _APP = new MagicalForest();
});