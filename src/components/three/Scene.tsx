import { useState, useEffect, useRef } from "react";
import { 
    Scene as SCN,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    Mesh,
    MeshBasicMaterial,
    Object3D
} from "three";
import { loadAsset } from "..\\..\\utils\\ObjectHandleler";

// ======================<-- TYPE IMPORTS -->====================================================
import type { FC } from "react";
import type { Scene as TSCN, Camera, Renderer } from "three";

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
        
        const scene: TSCN = new SCN;
        const camera: Camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer: Renderer = new WebGLRenderer({antialias: true});

        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        const geometry: BoxGeometry = new BoxGeometry(10, 10, -10);
        const material: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
        const cube: Mesh = new Mesh(geometry, material);
        //scene.add(cube);
        
        assets[0].scale.setScalar(.2);
        scene.add(assets[0], cube);

        camera.position.z = 5;

        // Main animation loop.
        const animate = (): void => {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            assets[0].rotation.x += 0.01;
            assets[0].rotation.y += 0.01;
            assets[0].rotation.z += 0.01;
            renderer.render(scene, camera);
        }
        animate();

        return (): void => {
            cancelAnimationFrame(animationFrameID);
            cube.geometry.dispose();
            material.dispose();
            containerRef.current?.removeChild(renderer.domElement);
        }
    }, [assets]);

    return <div ref={containerRef}/>
}

export default Scene;