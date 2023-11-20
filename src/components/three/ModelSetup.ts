import {
    Scene,
    Object3D,
    Sphere,
    Vector3,
    Euler,
    Points,
    PointsMaterial,
    BufferGeometry,
    PlaneGeometry,
    Mesh,
    MeshStandardMaterial,
    MeshPhongMaterial,
    Color
} from "three";
import type { GLTF } from "three\\examples\\jsm\\loaders\\GLTFLoader.js";

// Map with Electrode-Position
const electrodes: Map<string, number[]> = new Map();
    electrodes.set("C5", [11, 5]);
    electrodes.set("C6", [12, 9]);
    electrodes.set("CP3",[6, 7]);
    electrodes.set("CP4",[3, 7]);
    electrodes.set("F5", [9, 3]);
    electrodes.set("F6", [8, 1]);
    electrodes.set("FC3",[9, 6]);
    electrodes.set("FC4",[9, 6]);
    electrodes.set("FC5",[9, 5]);
    electrodes.set("FC6",[9, 5]);
    electrodes.set("FCz",[9, 5]);
    electrodes.set("P5", [1, 4]);
    electrodes.set("P6", [1, 5]);
    electrodes.set("Pz", [2, 6]);
    electrodes.set("T7", [8, 2]);
    electrodes.set("T8", [4, 2]);

// Electrode-Connectivity Map
const connectivity: Map<string, number> = new Map();
    connectivity.set("C5", 0);
    connectivity.set("C6", 1);
    connectivity.set("CP3", 2);
    connectivity.set("CP4", 3);
    connectivity.set("F5", 4);
    connectivity.set("F6", 5);
    connectivity.set("FC3", 6);
    connectivity.set("FC4", 7);
    connectivity.set("FC5", 8);
    connectivity.set("FC6", 9);
    connectivity.set("FCz", 10);
    connectivity.set("P5", 11);
    connectivity.set("P6", 12);
    connectivity.set("Pz", 13);
    connectivity.set("T7", 14);
    connectivity.set("T8", 15);

const setUpBrain = (brain: Object3D, number: number, gap: number): Object3D[] => {
    const brains: Object3D[] = [];

    for(let i=0; i<number; i++){
        const brainCopy: Object3D = brain.clone(true);

        // Configure the brains properties
        brainCopy.position.set(i*-gap, 0, 0);
        brainCopy.rotation.x = (3*Math.PI)/2;
    
        brainCopy.traverse(child => {
            if(child instanceof Mesh){
                child.castShadow = true;
                child.material = new MeshStandardMaterial({
                    color: new Color(0xB5C6DB),
                    transparent: true,
                    opacity: .3,
                    metalness: 1,
                    roughness: .4
                });
            }
        });
        
        brains.push(brainCopy);
    }

    return brains;
}

const createPoints = (vertices: Vector3[], color: number = 0xfc0328): Points => {
    const geometry: BufferGeometry = new BufferGeometry().setFromPoints(vertices);
    const pointMaterial: PointsMaterial = new PointsMaterial({
        color: color,
        size: 10,
        depthTest: false
    });

    return new Points(geometry, pointMaterial);
}

const setUpElectrodes = (scene: Scene, number: number, gap: number): Sphere[][] => {
    // Getting the electrodes unitary positions
    const electrodes: Vector3[] = [
        new Vector3(-0.933580426, 0.0, 0.35836795),
        new Vector3(0.933580426, 0.0, 0.35836795), 
        new Vector3(-0.660881426, -0.429181416, 0.615661475), 
        new Vector3(0.660881426, -0.429181416, 0.615661475), 
        new Vector3(-0.728993475, 0.63370436, 0.258819045), 
        new Vector3(0.728993475, 0.63370436, 0.258819045), 
        new Vector3(-0.669792097, 0.434968074, 0.601815023), 
        new Vector3(0.669792097, 0.434968074, 0.601815023), 
        new Vector3(-0.887887748, 0.340828174, 0.309016994), 
        new Vector3(0.887887748, 0.340828174, 0.309016994), 
        new Vector3(0.0, 0.390731128, 0.920504853), 
        new Vector3(-0.728993475, -0.63370436, 0.258819045), 
        new Vector3(0.728993475, -0.63370436, 0.258819045), 
        new Vector3(0.0, -0.7193398, 0.69465837), 
        new Vector3(-0.999390827, 0.0, -0.034899497), 
        new Vector3(0.999390827, 0.0, -0.034899497)
    ];

    // Scale and rotate each point to fit the size of the model
    for(const point of electrodes){
        point.multiplyScalar(55);
        point.applyEuler(new Euler((3*Math.PI)/2, 0, 0));
    }

    // Create the electrodes Array for each brain
    const electrodesArray: Vector3[][] = [];

    for(let i = 0; i < number; i++){
        const vectors: Vector3[] = [];
        for(const electrode of electrodes){
            vectors.push(electrode.clone().add(new Vector3(i * -gap, 0, 0)));
        }
        electrodesArray.push(vectors);
    }

    const points: Points[] = electrodesArray.map(electrodeArray => createPoints(electrodeArray));
    for(const pointArray of points) scene.add(pointArray);

    // Create the influence zones based on the electrodes positions and 
    // connectivity
    const influenceZonesArray: Sphere[][] = [];

    for(const electrodeArray of electrodesArray){
        const influenceZones: Sphere[] = [];
        for(const center of electrodeArray){
            influenceZones.push(new Sphere(center, 10));
        }
        influenceZonesArray.push(influenceZones);
    }
    return influenceZonesArray;
}

const setUpMococo = (model: GLTF): void => {
    model.scene.traverse(child => (child instanceof Mesh)? child.castShadow = true : null);
    model.scene.position.y = 1;
    model.scene.position.z = -1;
    model.scene.scale.setScalar(30);
}

const setUpGround = (): Mesh => {
    const ground: Mesh = new Mesh(
        new PlaneGeometry(4000, 4000),
        new MeshPhongMaterial({ color: 0x6b7280, depthWrite: false })
    );
    ground.rotation.x = - Math.PI / 2;
    ground.position.setY(-60);
    ground.receiveShadow = true;

    return ground;
}

export { setUpBrain, setUpElectrodes, setUpMococo, setUpGround };