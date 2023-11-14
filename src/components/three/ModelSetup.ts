import {
    Scene,
    Object3D,
    Sphere,
    Group,
    Vector3,
    Box3,
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

interface Connections {
    C5: number;C6: number;
    CP3: number;CP4: number;
    F5: number;F6: number;
    FC3: number;FC4: number;
    FC5: number;FC6: number;FCz: number;
    P5: number;P6: number;Pz: number;T7: number;T8: number;
};

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
    object.rotation.set(5, 0, 0);
}

// {
//     0'C5':
//     1'C6':
//     2'CP3':
//     3'CP4':
//     4'F5':
//     5'F6':
//     6'FC3':
//     7'FC4':
//     8'FC5':
//     9'FC6':
//     10'FCz':
//     11'P5':
//     12'P6':
//     13'Pz':
//     14'T7':
//     15'T8':
// }

const setUpElectrodes = (brain: Object3D, scene: Scene): void => {
    const boundingBox: Box3 = new Box3().setFromObject(brain);

    const center: Vector3 = new Vector3;
    boundingBox.getCenter(center);

    const electrodes: Vector3[] = [
        center,
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

    for(const point of electrodes) point.multiplyScalar(50);

    const geometry: BufferGeometry = new BufferGeometry().setFromPoints(electrodes);
    const pointMaterial: PointsMaterial = new PointsMaterial({
        color: 0xfc0328,
        size: 10,
        depthTest: false
    });

    const points: Points = new Points(geometry, pointMaterial);
    points.rotateX(180);

    scene.add(points);
}

const setUPFibers = (fibers: Group, gap: number = 0): void => {
    fibers.position.set(-125 + gap, -180, 40);
    fibers.rotation.set(5, 0, 0);
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
    ground.position.setY(-50)
    ground.receiveShadow = true;

    return ground;
}

export { setUpBrain, setUpElectrodes, setUPFibers, setUpMococo, setUpGround };