import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { Sky } from 'three/addons/objects/Sky.js';
import GUI from 'lil-gui';  
import { GUIManager } from "./gui-controller";
let _APP = null

export const TREE_TYPES = {
    NORMAL:{
        name:"Trees",
        order:1,
        size:{
            min:100,
            max:120,
        },
        center:{
            x:0,
            z:0
        }
},  
    BIRCH:{
        name:"Birch Trees",
        order:2,
        size:{
            min:100,
            max:130,
        },
        center:{
            x:- 25,
            z:- 0
        }
},  
    PALM:{
        name:"Palm Trees",
        order:3,
        size:{
            min:130,
            max:150,
        },
        center:{
            x:25,
            z:25
        }
},  
    MAPLE:{
        name:"Maple Trees",
        order:4,
        size:{
            min:100,
            max:120,
        },
        center:{
            x:25,
            z:25
        }
},  
    PINE:{
        name:"Pine Trees",
        order:5,
        size:{
            min:200,
            max:250,
        },
        center:{
            x:0,
            z:0
        }
},  
    DEAD:{
        name:"Dead Trees",
        order:6,
        size:{
            min:100,
            max:120,
        },
        center:{
            x:25,
            z:25
        }
}   
}
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
        this._DefaultGUI = {
            minCircleSize: 8,
            maxCircleSize: 40,
            normalTreeX: TREE_TYPES.NORMAL.center.x,
            normalTreeZ: TREE_TYPES.NORMAL.center.z,
        }
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
        this._DebugManager = new GUIManager(this._DefaultGUI,this._scene);

        // MODELS

        // LOADER RELATED

        const loadingManager = new THREE.LoadingManager();

        loadingManager.onLoad = () => {
            console.log("LOADED")
        }
        this._loader = new GLTFLoader(loadingManager);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
        this._loader.setDRACOLoader(dracoLoader);


        this._LoadForest();

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
        const directionLightHelper = new THREE.DirectionalLightHelper( light, 10 );
        this._scene.add(light);
        this._scene.add(directionLightHelper);

        light = new THREE.AmbientLight("yellow",1);
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

    _LoadSky(){
        const sky = new Sky();
        sky.scale.setScalar( 10000 );
        this._scene.add(sky);

        const skyUniforms = sky.material.uniforms;

		skyUniforms[ 'turbidity' ].value = 10;
		skyUniforms[ 'rayleigh' ].value = 2;
		skyUniforms[ 'mieCoefficient' ].value = 0.005;
		skyUniforms[ 'mieDirectionalG' ].value = 0.8
		const parameters = {
			elevation: 2,
			azimuth: 180
		};

    }

    _LoadForest(){
        this._LoadCabin();
        this._LoadDefaultTrees(TREE_TYPES.NORMAL);
        // this._LoadDefaultTrees(TREE_TYPES.MAPLE);
        // this._LoadDefaultTrees(TREE_TYPES.PINE);
        // this._LoadDefaultTrees(TREE_TYPES.BIRCH);
    }

    _LoadCabin(){
        this._loader.load("./resources/Cabin.glb",
        function(glb){
            const cabin = glb.scene;
            cabin.position.set(0,1.1,0)
            let scale = 1 * 0.005
            cabin.scale.set(scale,scale,scale)
            cabin.receiveShadow = true;
            cabin.castShadow = true;
            this._scene.add(cabin);
        }.bind(this));
    }

    _LoadDefaultTrees(treeType){
    
        this._loader.load(`./resources/${treeType.name}.glb`,
        function(model){
            const scene = model.scene;
            const rootNode = scene.children[0];
            // ADD THE DEFAULT TREES
            const trees = rootNode.children.map(tree => tree);

            for(let treeCount = 0; treeCount < 200; treeCount++){
                const angle = Math.random() * Math.PI * 2
                const radius = this._DefaultGUI.minCircleSize + Math.random() * this._DefaultGUI.maxCircleSize

                const x = Math.sin(angle) * radius;
                const z = Math.cos(angle) * radius;

                let tree = trees[Math.floor(Math.random() * 5)].clone();

                tree.objectName = "Forest-Tree"
                tree.treeType = treeType;
                tree.renderOrder = treeType.order
                let size = Math.random() * (treeType.size.max - treeType.size.min) + treeType.size.min;
                tree.scale.set(size,size,size);
                tree.position.set(
                    x + treeType.center.x,
                    0,
                    z + treeType.center.z
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