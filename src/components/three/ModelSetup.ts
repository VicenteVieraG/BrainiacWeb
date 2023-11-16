import { IncomingMessage } from "http";
import {
    Scene,
    Object3D,
    Sphere,
    SphereGeometry,
    Group,
    Vector3,
    Box3,
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
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
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

const setInfluenceZonePosition = (zone: Group, id: number, offset: Vector3): void => {
    const {x, y, z} = zone.children[id].position;

    zone.children[id].position.set(x + offset.x, y + offset.y, z + offset.z);
}

const setUpElectrodes = (scene: Scene): void => {
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

    // Scale each point to fit the size of the model
    for(const point of electrodes) point.multiplyScalar(50);

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

    // Create the buffer to hold the electrodes as points and its material
    const geometry: BufferGeometry = new BufferGeometry().setFromPoints(electrodes);
    const pointMaterial: PointsMaterial = new PointsMaterial({
        color: 0xfc0328,
        size: 10,
        depthTest: false
    });

    const points: Points = new Points(geometry, pointMaterial);
    points.rotateX(180);

    scene.add(points);

    // Create the influence zones of each electrode represented as Spheres
    const influenceZones: Mesh[] = electrodes.map((electrode, i) => {
        const sphereGeometry: SphereGeometry = new SphereGeometry(10);
        const meshBasicMaterial: MeshBasicMaterial = new MeshBasicMaterial({
            color: colors[i],
            opacity: .9
        });

        const {x, y, z} = electrode;
        const mesh: Mesh = new Mesh(sphereGeometry, meshBasicMaterial);
        mesh.position.set(x, y, z);

        return mesh;
    });

    // Group all the incluence zones into a one Group
    const influenceGroup: Group = new Group;
    for(const zone of influenceZones) influenceGroup.add(zone);

    // Setup each zone into the correct place
    influenceGroup.rotateX(180);
    setInfluenceZonePosition(influenceGroup, 3, new Vector3(15, 5, 50));
    setInfluenceZonePosition(influenceGroup, 4, new Vector3(-10, 5, 50));
    setInfluenceZonePosition(influenceGroup, 5, new Vector3(15, -30, 35))
    setInfluenceZonePosition(influenceGroup, 6, new Vector3(-15, -30, 35))

    scene.add(influenceGroup);
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