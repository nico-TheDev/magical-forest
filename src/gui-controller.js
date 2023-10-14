import GUI from 'lil-gui';
import { TREE_TYPES } from './main';


export class GUIManager {
    constructor(defaultValues,scene){
        this.gui = new GUI();
        this._Init(defaultValues,scene);
    }

    _Init(defaultValues,scene){

        // MINIMUM CIRCLE SIZE CONTROLLER
        this.gui.add(defaultValues,"minCircleSize")
                .name("Min Forest Size")
                .onChange(() => this._UpdateTreePositions(scene,defaultValues))
                .min(5)
                .max(20)
                .step(0.05)

        this.gui.add(defaultValues,"maxCircleSize")
                .name("Max Forest Size")
                .onChange(() => this._UpdateTreePositions(scene,defaultValues))
                .min(5)
                .max(100)
                .step(0.5)
                

        this.gui.add(defaultValues,"normalTreeX")
                .name("Normal Tree X")
                .onChange(() => this._UpdateTreePositions(scene,defaultValues))
                .min(-100)
                .max(100)
                .step(1)

        this.gui.add(defaultValues,"normalTreeZ")
                .name("Normal Tree Z")
                .onChange(() => this._UpdateTreePositions(scene,defaultValues))
                .min(-100)
                .max(100)
                .step(1)

        this.gui.add(defaultValues,"birchTreeX")
                .name("Birch Tree X")
                .onChange(() => this._UpdateTreePositions(scene,defaultValues))
                .min(-100)
                .max(100)
                .step(1)

        this.gui.add(defaultValues,"birchTreeZ")
                .name("Birch Tree Z")
                .onChange(() => this._UpdateTreePositions(scene,defaultValues))
                .min(-100)
                .max(100)
                .step(1)

        this.gui.add(defaultValues,"pineTreeX")
                .name("Pine Tree X")
                .onChange(() => this._UpdateTreePositions(scene,defaultValues))
                .min(-100)
                .max(100)
                .step(1)

        this.gui.add(defaultValues,"pineTreeZ")
                .name("Pine Tree Z")
                .onChange(() => this._UpdateTreePositions(scene,defaultValues))
                .min(-100)
                .max(100)
                .step(1)

        // LAMP LIGHT

        this.gui.add(defaultValues.lampLight,"x")
        .name("Lamp Position X")
        .onChange(() => this._UpdateLampLight(scene,defaultValues))
        .min(-10)
        .max(10)
        .step(0.01)

        this.gui.add(defaultValues.lampLight,"y")
        .name("Lamp Position Y")
        .onChange(() => this._UpdateLampLight(scene,defaultValues))
        .min(-10)
        .max(10)
        .step(0.01)

        this.gui.add(defaultValues.lampLight,"z")
        .name("Lamp Position Z")
        .onChange(() => this._UpdateLampLight(scene,defaultValues))
        .min(-10)
        .max(10)
        .step(0.01)

        this.gui.add(defaultValues.lampLight,"intensity")
        .name("Lamp Intensity")
        .onChange(() => this._UpdateLampLight(scene,defaultValues))
        .min(0)
        .max(1)
        .step(0.001)


    }

    _UpdateTreePositions(scene,defaultValues){
        scene.traverse(function(currentObject){
            const angle = Math.random() * Math.PI * 2
            const radius = defaultValues.minCircleSize + Math.random() * defaultValues.maxCircleSize
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            if(currentObject.objectName === "Forest-Tree"){
                let currentX, currentZ;

                switch(currentObject.treeType.name){
                    case TREE_TYPES.NORMAL.name:
                        currentX = x + defaultValues.normalTreeX;
                        currentZ = z + defaultValues.normalTreeZ;
                        break;
                    case TREE_TYPES.BIRCH.name:
                        currentX = x + defaultValues.birchTreeX;
                        currentZ = z + defaultValues.birchTreeZ;
                        break;
                    case TREE_TYPES.PINE.name:
                        currentX = x + defaultValues.pineTreeX;
                        currentZ = z + defaultValues.pineTreeZ;
                        break;
                }
              
                currentObject.position.set(
                    currentX,
                    0,
                    currentZ
                )
            }
        }.bind(this))

    }

    _UpdateLampLight(scene,defaultValues){
        let lampLight = scene.getObjectByName("LampLight");
        let lampLightHelper = scene.getObjectByName("LampLightHelper");
        lampLight.position.set(
            defaultValues.lampLight.x,
            defaultValues.lampLight.y,
            defaultValues.lampLight.z,
            )
        lampLightHelper.position.set(
            defaultValues.lampLight.x,
            defaultValues.lampLight.y,
            defaultValues.lampLight.z,
            )
        lampLight.intensity = defaultValues.lampLight.intensity;
    }
}