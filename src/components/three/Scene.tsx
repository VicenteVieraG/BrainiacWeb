import { useState, useEffect, useRef } from "react";
import { 
    WebGLRenderer,
    Scene as SCN,
    Color,
    Fog,
    PerspectiveCamera,
    Mesh,
    PlaneGeometry,
    Object3D,
    SkeletonHelper,
    MeshStandardMaterial,
    MeshPhongMaterial,
    HemisphereLight,
    DirectionalLight
} from "three";
import { loadAsset } from "..\\..\\utils\\ObjectHandleler";

// ======================<-- TYPE IMPORTS -->====================================================
import type { FC } from "react";
import type { Scene as TSCN, Camera, WebGLRenderer as WGLR, DirectionalLight as DL } from "three";

// ======================<-- VARIABLES IMPORT -->==========================================
import { ASSETS } from "../../utils/resourceSrc";


// ======================<-- INTERFACES -->======================================================
interface Props {
    children?: JSX.Element;
}

const Scene: FC<Props> = (): JSX.Element => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [assets, setAssets] = useState<Object3D[] | null>(null);
    
    useEffect(() => {
        const fetchAssets = async() => {
            const loadedAssets: Object3D[] = await loadAsset(ASSETS, {type: "fbx"});

            setAssets(loadedAssets);
        }
        
        fetchAssets();
    }, []);

    useEffect(() => {
        // Initialize Scene basics.
        // Check for not null objects.
        if(!(containerRef.current && assets)) return;

        let animationFrameID: number;
        
        // Set Scene parameters.
        const scene: TSCN = new SCN;
        if(scene.background) scene.background = new Color(0xa0a0a0);
        scene.fog = new Fog(0xa0a0a0, 10, 50);
        const camera: Camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
        const renderer: WGLR = new WebGLRenderer({antialias: true});
        
        // Ilumination
        const ilumination: HemisphereLight = new HemisphereLight(0xffffff, 0x8d8d8d, 3);
        ilumination.position.set(0, 20, 0);

        const dirLight: DL = new DirectionalLight(0xffffff, 3);
        dirLight.position.set( - 3, 10, - 10 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 2;
        dirLight.shadow.camera.bottom = - 2;
        dirLight.shadow.camera.left = - 2;
        dirLight.shadow.camera.right = 2;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 40;

        // Creating the ground.
        const ground: Mesh = new Mesh(
            new PlaneGeometry(100, 100),
            new MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
        );
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;

        // Rendering config and add it to the Scene main tag.
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        // Setting the models properties.
        const meshStandardMaterial: MeshStandardMaterial = new MeshStandardMaterial(
                {color: 0x86868A, metalness: 1}
            );
        assets[0].traverse(child => {
            if(child instanceof Mesh){
                child.material = meshStandardMaterial;
                child.castShadow = true;
            }
        });

        // Creating an skeleton.
        const skeleton: SkeletonHelper = new SkeletonHelper(assets[0]);
        skeleton.visible = true;
        
        // Add models to the scene.
        assets[0].scale.setScalar(1);
        scene.add(assets[0], skeleton, ilumination, dirLight, ground);

        // Camera setting.
        camera.position.set( 1, 2, - 3 );
        camera.lookAt( 0, 1, 0 );

        // Main animation loop.
        const animate = (): void => {
            requestAnimationFrame(animate);
            assets[0].rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();

        return (): void => {
            cancelAnimationFrame(animationFrameID);
            containerRef.current?.removeChild(renderer.domElement);
        }
    }, [assets]);

    return <div ref={containerRef}/>
}

export default Scene;