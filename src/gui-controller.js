import GUI from 'lil-gui';
import { TREE_TYPES } from './main';


export class GUIManager {
    constructor( scene ) {
        this.gui = new GUI();
        this._scene = scene;
    }
    // GUI

    _AddLampController(lampValues) {
        // LAMP LIGHT

        const lamp = this.gui.addFolder("Lamp");

        lamp.add(lampValues, "x")
            .name("Lamp Position X")
            .onChange(() => this._UpdateLampLight(lampValues))
            .min(-10)
            .max(10)
            .step(0.01);

        lamp.add(lampValues, "y")
            .name("Lamp Position Y")
            .onChange(() => this._UpdateLampLight(lampValues))
            .min(-10)
            .max(10)
            .step(0.01);

        lamp.add(lampValues, "z")
            .name("Lamp Position Z")
            .onChange(() => this._UpdateLampLight(lampValues))
            .min(-10)
            .max(10)
            .step(0.01);

        lamp.add(lampValues, "intensity")
            .name("Lamp Intensity")
            .onChange(() => this._UpdateLampLight(lampValues))
            .min(0)
            .max(1)
            .step(0.001);
    }

    _AddTreesController(treeValues) {
        const trees = this.gui.addFolder("Trees");
        trees.add(treeValues, "minCircleSize")
            .name("Min Forest Size")
            .onChange(() => this._UpdateTreePositions(treeValues))
            .min(5)
            .max(20)
            .step(0.05);

        trees.add(treeValues, "maxCircleSize")
            .name("Max Forest Size")
            .onChange(() => this._UpdateTreePositions(treeValues))
            .min(5)
            .max(100)
            .step(0.5);


        trees.add(treeValues, "normalTreeX")
            .name("Normal Tree X")
            .onChange(() => this._UpdateTreePositions(treeValues))
            .min(-100)
            .max(100)
            .step(1);

        trees.add(treeValues, "normalTreeZ")
            .name("Normal Tree Z")
            .onChange(() => this._UpdateTreePositions(treeValues))
            .min(-100)
            .max(100)
            .step(1);

        trees.add(treeValues, "birchTreeX")
            .name("Birch Tree X")
            .onChange(() => this._UpdateTreePositions(treeValues))
            .min(-100)
            .max(100)
            .step(1);

        trees.add(treeValues, "birchTreeZ")
            .name("Birch Tree Z")
            .onChange(() => this._UpdateTreePositions(treeValues))
            .min(-100)
            .max(100)
            .step(1);

        trees.add(treeValues, "pineTreeX")
            .name("Pine Tree X")
            .onChange(() => this._UpdateTreePositions(treeValues))
            .min(-100)
            .max(100)
            .step(1);

        trees.add(treeValues, "pineTreeZ")
            .name("Pine Tree Z")
            .onChange(() => this._UpdateTreePositions(treeValues))
            .min(-100)
            .max(100)
            .step(1);
    }

    _UpdateTreePositions(defaultValues) {
        this._scene.traverse(function (currentObject) {
            const angle = Math.random() * Math.PI * 2;
            const radius = defaultValues.minCircleSize + Math.random() * defaultValues.maxCircleSize;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            if (currentObject.objectName === "Forest-Tree") {
                let currentX, currentZ;

                switch (currentObject.treeType.name) {
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
                );
            }
        }.bind(this));

    }

    _UpdateLampLight(lampValues) {
        let lampLight = this._scene.getObjectByName("LampLight");
        let lampLightHelper = this._scene.getObjectByName("LampLightHelper");
        lampLight.position.set(
            lampValues.x,
            lampValues.y,
            lampValues.z,
        );
        lampLightHelper.position.set(
            lampValues.x,
            lampValues.y,
            lampValues.z,
        );
        lampLight.intensity = lampValues.intensity;
    }
}