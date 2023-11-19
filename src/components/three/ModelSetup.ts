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

export { setUpBrain, setUpElectrodes, setUpMococo, setUpGround };