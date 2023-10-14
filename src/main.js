import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let _APP = null

class MagicalForest {
    constructor(){
        this._Initialize();
    }

    _Initialize(){
        this._threejs = new THREE.WebGLRenderer({
            antialias: true
        })
        this._threejs.shadowMap.enabled = true;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth,window.innerHeight);
        this._threejs.domElement.id = "threejs";

        document.body.appendChild(this._threejs.domElement);

        window.addEventListener("resize",() => {
            this._OnWindowResize();
        },false)

        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000;
        
        this._camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
        this._camera.position.set(60,20,0);

        this._scene = new THREE.Scene();

        // MODELS

        this._DefaultTrees = [];

        // LOADER RELATED

        const loadingManager = new THREE.LoadingManager();
        this._loader = new GLTFLoader(loadingManager);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
        this._loader.setDRACOLoader(dracoLoader);


        this._LoadDefaultTrees();

        // HELPERS

        const axesHelper = new THREE.AxesHelper( 5 );
        axesHelper.position.set(0,10,0)
        this._scene.add(axesHelper);

        let light = new THREE.DirectionalLight(0xffffff,1.0);
        light.position.set(20,40,10);
        light.target.position.set(0,0,0);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;

        light.shadow.camera.left = 100;
        light.shadow.camera.right = 100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = 100;
        const directionLightHelper = new THREE.DirectionalLightHelper( light, 5 );
        this._scene.add(light);
        this._scene.add(directionLightHelper);

        light = new THREE.AmbientLight(0x101010);
        this._scene.add(light);

        const controls = new OrbitControls(this._camera,this._threejs.domElement);
        controls.target.set(0,20,0);
        controls.update();

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100,100,10,10),
            new THREE.MeshStandardMaterial({
                color:"#27ae60",
            })
        )
        plane.castShadow = true;
        plane.receiveShadow = true;
        plane.rotation.x = - Math.PI / 2;
        this._scene.add(plane)


        this._RAF();

    }

    _LoadDefaultTrees(){
        this._loader.load("./resources/Trees.glb",function(model){
            const scene = model.scene;
            const rootNode = scene.children[0];
            // ADD THE DEFAULT TREES

            const trees = rootNode.children.map(tree => tree);


            for(let treeCount = 0; treeCount < 100; treeCount++){
                const angle = Math.random() * Math.PI * 2
                const radius = 3 + Math.random() * 40

                const x = Math.sin(angle) * radius;
                const z = Math.cos(angle) * radius;

                let tree = trees[Math.floor(Math.random() * 5)].clone();
                console.log(tree.scale);
                let size = Math.random() * (120 - 100) + 100;
                tree.scale.set(size,size,size);
                tree.position.set(
                    x,
                    0,
                    z
                )
                tree.castShadow = true;
                tree.receiveShadow = true;
                this._scene.add(tree);
            }


        }.bind(this));
    }
    

    _OnWindowResize(){
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth,window.innerHeight);
    }

    _RAF(){
        requestAnimationFrame(()=>{
            this._threejs.render(this._scene,this._camera);
            this._RAF();
        })
    }
}


window.addEventListener("DOMContentLoaded",() =>{
    _APP = new MagicalForest();
})