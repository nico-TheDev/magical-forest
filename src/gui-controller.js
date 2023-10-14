import GUI from 'lil-gui';


export class GUIManager {
    constructor(defaultValues,scene){
        this._Init(defaultValues,scene);
    }

    _Init(defaultValues,scene){
        this.gui = new GUI();

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
                .min(5)
                .max(100)
                .step(0.5)

        

    }

    _UpdateTreePositions(scene,defaultValues){
        scene.traverse(function(currentObject){
            const angle = Math.random() * Math.PI * 2
            const radius = defaultValues.minCircleSize + Math.random() * defaultValues.maxCircleSize
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            if(currentObject.objectName === "Forest-Tree"){

                currentObject.position.set(
                    x + currentObject.treeType.center.x,
                    0,
                    z + currentObject.treeType.center.z
                )
            }
        }.bind(this))

    }
}