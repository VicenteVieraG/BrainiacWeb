import { useEffect, useRef } from "react";
import { 
    Scene as SCN,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    Mesh,
    MeshBasicMaterial
} from "three";

import type { FC } from "react";
import type { Scene as TSCN, Camera, Renderer } from "three";

interface Props {
    children?: JSX.Element;
}

const Scene: FC<Props> = ({children}): JSX.Element => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    
    useEffect(() => {
        // Initialize Scene basics.
        if(!containerRef.current) return;

        let animationFrameID: number;
        
        const scene: TSCN = new SCN;
        const camera: Camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer: Renderer = new WebGLRenderer({antialias: true});

        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        const geometry: BoxGeometry = new BoxGeometry(1, 1, 1);
        const material: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
        const cube: Mesh = new Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 5;

        // Main animation loop.
        const animate = (): void => {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();

        return (): void => {
            cancelAnimationFrame(animationFrameID); // Stop the animation
            cube.geometry.dispose(); // Dispose of the box geometry
            material.dispose(); // Dispose of the material
            containerRef.current?.removeChild(renderer.domElement); // Remove the renderer from the DOM
        }
    }, []);

    return <div ref={containerRef}/>
}

export default Scene;