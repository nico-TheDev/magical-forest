import GUI from 'lil-gui';
import * as THREE from "three";
import { TREE_TYPES } from './constants';

export class GUIManager {
    constructor(scene) {
        this.gui = new GUI();
        this._scene = scene;
    }
    // GUI

    _AddLampController(lampValues) {
        // LAMP LIGHT

        const lamp = this.gui.addFolder("Lamp");
        const fire = this.gui.addFolder("Campfire");
        const campfire = this._scene.getObjectByName("campfire")
        const lampLight = this._scene.getObjectByName("LampLight")

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
            .max(10)
            .step(0.001);

        lamp.add(lampLight, "power")
            .name("Lamp Power")
            .min(1)
            .max(100)
            .step(0.01);


        fire.add(campfire.position, "x")
            .name("Campfire Position X")
            .min(-10)
            .max(10)
            .step(0.01);

        fire.add(campfire.position, "y")
            .name("Campfire Position Y")
            .min(-10)
            .max(10)
            .step(0.01);

        fire.add(campfire.position, "z")
            .name("Campfire Position Z")
            .min(-10)
            .max(10)
            .step(0.01);

        
    }

    _AddMoonController() {
        // MOON LIGHT
        const moonLight = this._scene.getObjectByName("Moon");
        const ambientLight = this._scene.getObjectByName("AmbientLight");
        const fireflies = this._scene.getObjectByName("fireflies");

        const moon = this.gui.addFolder("Moon");
        const envLight = this.gui.addFolder("Ambient Light");
        const fireflyFolder = this.gui.addFolder("Fireflies");

        moon.add(moonLight.position, "x")
            .name("Moon Position X")
            .min(-10)
            .max(10)
            .step(0.01);

        moon.add(moonLight.position, "y")
            .name("Moon Position Y")
            .min(-10)
            .max(10)
            .step(0.01);

        moon.add(moonLight.position, "z")
            .name("Moon Position Z")
            .min(-10)
            .max(10)
            .step(0.01);

        moon.add(moonLight, "intensity")
            .name("Moon Intensity")
            .min(0)
            .max(1)
            .step(0.001);

        envLight.add(ambientLight, "intensity")
            .name("Env Light Intensity")
            .min(0)
            .max(1)
            .step(0.001);

        envLight.addColor(ambientLight, "color")
            .onChange((color) => {
                ambientLight.color = color;
            });

        fireflyFolder.add(fireflies.material, "size")
            .name("Size")
            .min(-5)
            .max(5)
            .step(0.001);

        fireflyFolder.add(fireflies.material, "sizeAttenuation");
        let count = 500, spacing = 10;
        fireflyFolder.add({ count: 500 }, "count")
            .min(100)
            .max(500000)
            .step(1)
            .name("Count")
            .onChange((value) => {
                count = value;
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

                fireflies.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3)); 
                fireflies.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
            });

        fireflyFolder.add({ spacing: 10 }, "spacing")
            .min(0)
            .max(100)
            .step(0.05)
            .name("Spacing")
            .onChange((value) => {
                spacing = value;
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

                fireflies.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
                fireflies.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
            });



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

    _AddCabinController(cabinValues) {
        const cabin = this.gui.addFolder("Cabin");
        const cabinModel = this._scene.getObjectByName("Cabin");
        console.log(cabinModel.position);
        cabin.add(cabinModel.position, "x")
            .min(-10)
            .max(10)
            .step(0.001);
        cabin.add(cabinModel.position, "y")
            .min(-10)
            .max(10)
            .step(0.001);
        cabin.add(cabinModel.position, "z")
            .min(-10)
            .max(10)
            .step(0.001);
    }

    _AddDogController(dogValues) {
        const dog = this.gui.addFolder("Dog");
        const dogModel = this._scene.getObjectByName("Shiba Inu");

        if (!dogModel) return;

        dog.add(dogModel.position, "x")
            .min(-10)
            .max(10)
            .step(0.01)
            .name("Position X");
        dog.add(dogModel.position, "y")
            .min(-10)
            .max(10)
            .step(0.01)
            .name("Position Y");
        dog.add(dogModel.position, "z")
            .min(-10)
            .max(10)
            .step(0.01)
            .name("Position Z");

        dog.add(dogModel.rotation, "x")
            .min(-10)
            .max(10)
            .step(0.01)
            .name("Rotation X");
        dog.add(dogModel.rotation, "y")
            .min(-10)
            .max(10)
            .step(0.01)
            .name("Rotation Y");
        dog.add(dogModel.rotation, "z")
            .min(-10)
            .max(10)
            .step(0.01)
            .name("Rotation Z");

        dog.add(dogModel.scale, "x")
            .min(-10)
            .max(10)
            .step(0.01)
            .name("Scale")
            .onChange((scaleValue) => {
                dogModel.scale.setScalar(scaleValue);
            });



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