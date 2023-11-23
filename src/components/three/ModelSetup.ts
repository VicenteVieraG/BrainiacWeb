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

// Electrode-Connectivity Map
const connectivity: Map<number, number[]> = new Map();
    connectivity.set(0,     [11, 5]);
    connectivity.set(1,     [12, 9]);
    connectivity.set(2,     [6, 7]);
    connectivity.set(3,     [3, 7]);
    connectivity.set(4,     [9, 3]);
    connectivity.set(5,     [8, 1]);
    connectivity.set(6,     [9, 6]);
    connectivity.set(7,     [9, 6]);
    connectivity.set(8,     [9, 5]);
    connectivity.set(9,     [9, 5]);
    connectivity.set(10,    [9, 5]);
    connectivity.set(11,    [1, 4]);
    connectivity.set(12,    [1, 5]);
    connectivity.set(13,    [2, 6]);
    connectivity.set(14,    [8, 2]);
    connectivity.set(15,    [4, 2]);


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
                    opacity: .2,
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

    for(let i = 0; i < number; i++){
        const modelsInfluenceZones: Sphere[] = [];
        for(let j = 0; j < electrodesArray[i].length; j++){
            const connections: number[] = connectivity.get(j) as number[];

            modelsInfluenceZones.push(
                new Sphere(electrodesArray[i][j],
                    connections[i]
                )
            );
        }
        influenceZonesArray.push(modelsInfluenceZones);
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