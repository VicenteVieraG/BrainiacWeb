import {
    Object3D,
    Group,
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
    object.rotation.set(5, 0, 0);
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

export { setUpBrain, setUPFibers, setUpMococo, setUpGround };