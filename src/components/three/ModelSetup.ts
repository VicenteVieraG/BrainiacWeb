import {
    Scene,
    Object3D,
    Sphere,
    SphereGeometry,
    Group,
    Vector3,
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

const setInfluenceZonePosition = (zone: Group, id: number, offset: Vector3): void => {
    const {x, y, z} = zone.children[id].position;

    zone.children[id].position.set(x + offset.x, y + offset.y, z + offset.z);
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

    // Scale each point to fit the size of the model
    for(const point of electrodes){
        console.log("Original: ",point)
        point.multiplyScalar(100);
        console.log("ESCALADO",point)
    }

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
    const influenceZonesVisualization: Mesh[] = electrodes.map((electrode, i) => {
        const sphereGeometry: SphereGeometry = new SphereGeometry(10);
        const meshBasicMaterial: MeshBasicMaterial = new MeshBasicMaterial({
            color: colors[i],
            opacity: 1,

        });

        const {x, y, z} = electrode;
        const mesh: Mesh = new Mesh(sphereGeometry, meshBasicMaterial);
        mesh.position.set(x, y, z);

        return mesh;
    });

    // Group all the influence zones Visuals into a one Group
    const influenceGroupVisual: Group = new Group;
    for(const zone of influenceZonesVisualization) influenceGroupVisual.add(zone);

    // Setup each zone into the correct place
    influenceGroupVisual.rotateX(180);
    setInfluenceZonePosition(influenceGroupVisual, 3, new Vector3(15, 5, 50));
    setInfluenceZonePosition(influenceGroupVisual, 4, new Vector3(-10, 5, 50));
    setInfluenceZonePosition(influenceGroupVisual, 5, new Vector3(15, -30, 35));
    setInfluenceZonePosition(influenceGroupVisual, 6, new Vector3(-15, -30, 35));

    scene.add(influenceGroupVisual);

    // Creating the actual Spheres for calculations
    const influenceGroup: Sphere[] = influenceGroupVisual.children.map(zone => {
        const xd = new Sphere(zone.position, 10);
        console.log("Zone: ", zone.position, "Sphere: ", xd.center)

        return xd
    });

    return influenceGroup;
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
    ground.position.setY(-50);
    ground.receiveShadow = true;

    return ground;
}

export { setUpBrain, setUpElectrodes, setUPFibers, setUpMococo, setUpGround };