import { useState, useEffect, useRef } from "react";
import { 
    Scene as SCN,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    Texture
} from "three";
import { loadAsset, loadTextures } from "..\\..\\utils\\ObjectHandleler";
import type { FC } from "react";
import type { Scene as TSCN, Camera, Renderer } from "three";

interface Props {
    children?: JSX.Element;
}

const ASSETS: string[] = [".\\src\\assets\\models\\Mococo_pose.fbx"];

const Scene: FC<Props> = ({children}): JSX.Element => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [assets, setAssets] = useState<Object3D[] | null>(null);

    console.log("ASSETS: ", assets);
    //const [textures, setTextures] = useState<Texture[]>([]);
    
    useEffect(() => {
        const fetchAssets = async() => {
            const loadedAssets: Object3D[] = await loadAsset(ASSETS, {type: "fbx"});
            //const TEXTURES: string[] | null = await getFilePaths(".\\src\\assets\\textures\\mococo");
            //const loadedTextures: Texture[] = await loadTextures(TEXTURES as string[]);

            setAssets(loadedAssets);
            //setTextures(loadedTextures);
        }
        
        fetchAssets();
    }, []);

    useEffect(() => {
        // Initialize Scene basics.
        if(!containerRef.current) return;
        if(!assets) return;

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