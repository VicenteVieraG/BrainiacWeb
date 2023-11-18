import {
    Scene,
    Object3D,
    Sphere,
    SphereGeometry,
    Group,
    Vector3,
    Euler,
    Points,
    PointsMaterial,
    BufferGeometry,
    PlaneGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    MeshPhongMaterial,
    Color
} from "three";
import type { GLTF } from "three\\examples\\jsm\\loaders\\GLTFLoader.js";

// Create the colors array for the electrodes and the influenceSpheres
const colors: number[] = [
    0x32a852,
    0xa83232, // 1 Red
    0xa2a832, // 2 Yellow
    0x3ea832, // 3 Green
    0xf472b6, // 4 Pink
    0x0ea5e9, // 5 Sky
    0x1e40af, // 6 Blue
    0xf97316, // 7 Orange
    0x7e22ce, // 8 Purple
    0x64748b, // 9 Slate
    0xfafafa, // 10 White
    0x451a03, // 11 Brown
    0x0a0a0a  // 12 Black
];

const setUpBrain = (object: Object3D, gap?: number): void => {
    object.traverse(child => {
        if(child instanceof Mesh){
            child.castShadow = true;
            child.material = new MeshStandardMaterial({
                color: new Color(0xB5C6DB),
                transparent: true,
                opacity: .4,
                metalness: 1,
                roughness: .4
            });
        }
    });
    if(gap) object.position.set(gap, 0, 0);
    object.rotation.x = (3*Math.PI)/2;
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

const setUpElectrodes = (scene: Scene): Sphere[] => {
    // Getting the electrodes unitary positions
    const electrodes: Vector3[] = [
        new Vector3(0),
        new Vector3(-0.728993475,   0.63370436,     0.258819045),
        new Vector3(0.728993475,    0.63370436,     0.258819045),
        new Vector3(-0.669792097,   0.434968074,    0.601815023),
        new Vector3(0.669792097,    0.434968074,    0.601815023),
        new Vector3(-0.887887748,   0.340828174,    0.309016994),
        new Vector3(0.887887748,    0.340828174,    0.309016994),
        new Vector3(0.0,            0.390731128,    0.920504853),
        new Vector3(-0.728993475,   -0.63370436,    0.258819045),
        new Vector3(0.728993475,    -0.63370436,    0.258819045),
        new Vector3(0.0,            -0.7193398,     0.69465837),
        new Vector3(-0.999390827,   0.0,            -0.034899497),
        new Vector3(0.999390827,    0.0,            -0.034899497)
    ];

    // Scale and rotate each point to fit the size of the model
    for(const point of electrodes){
        point.multiplyScalar(55);
        point.applyEuler(new Euler((3*Math.PI)/2, 0, 0));
    }

    // Electrodes original position scaled by 50 and rotated 180°
    const points: Points = createPoints(electrodes);
    scene.add(points);

    // Create the influence zones based on the electrodes positions
    return electrodes.map(center => new Sphere(center, 10));
}

const setUPFibers = (fibers: Group, gap: number = 0): void => {
    fibers.position.set(-125 + gap, -180, 40);
    fibers.rotation.set(5, 0, 0);

    fibers.updateMatrixWorld(true);
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
        new MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
    );
    ground.rotation.x = - Math.PI / 2;
    ground.position.setY(-60);
    ground.receiveShadow = true;

    return ground;
}

export { setUpBrain, setUpElectrodes, setUPFibers, setUpMococo, setUpGround };