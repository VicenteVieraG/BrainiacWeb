import { DirectionalLight, HemisphereLight } from "three";

export interface Light {
    dirLight: DirectionalLight;
    hemLight: HemisphereLight;
};

export const setUpIlumination = (): Light => {
    const ilumination: Light = {
         hemLight: new HemisphereLight(0xffffff, 0x8d8d8d, 3),
         dirLight: new DirectionalLight(0xffffff, 3)
    }
    
    ilumination.hemLight.position.set(0, 1000, 0);

    ilumination.dirLight.position.set(0, 50, 0);
    ilumination.dirLight.castShadow = true;
    ilumination.dirLight.shadow.camera.top = 150;
    ilumination.dirLight.shadow.camera.bottom = -500;
    ilumination.dirLight.shadow.camera.left = -1000;
    ilumination.dirLight.shadow.camera.right = 500;
    ilumination.dirLight.shadow.camera.near = 0.1;
    ilumination.dirLight.shadow.camera.far = 150;

    return ilumination;
}