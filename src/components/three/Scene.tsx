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
    MeshPhongMaterial,
    MeshStandardMaterial,
    HemisphereLight,
    DirectionalLight
} from "three";
import { loadAsset } from "..\\..\\utils\\ObjectHandleler";

// ======================<-- TYPE IMPORTS -->====================================================
import type { FC } from "react";
import type { 
    Scene as TSCN,
    Camera,
    WebGLRenderer as WGLR,
    DirectionalLight as DL
} from "three";
import type { Object } from "..\\..\\utils\\ObjectHandleler";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

// ======================<-- VARIABLES IMPORT -->==========================================
import { ASSETS } from "..\\..\\utils\\resourceSrc";
import { HENRIK } from "..\\..\\utils\\resourceSrc";


// ======================<-- INTERFACES -->======================================================
interface Props {
    children?: JSX.Element;
}

const Scene: FC<Props> = (): JSX.Element => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [mococo, setAssets] = useState<GLTF[] | null>(null);
    const [brain, setBrain] = useState<Object3D | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [lastMousePosition, setLastMousePosition] = useState<{ x: number, y: number } | null>(null);
  
// =======================<-- LOAD ASSETS -->=======================================================
    useEffect(() => {
        const fetchAssets = async() => {
            const loadedAssets: Object[] = await loadAsset(ASSETS, {type: "glb"});
            const loadedBrain: Object[] = await loadAsset(HENRIK);

            setAssets(loadedAssets as GLTF[]);
            setBrain(loadedBrain[0] as Object3D);
        }
        
        fetchAssets();
    }, []);

// ==================<-- SETUP SCENE AND RENDER LOOP -->=============================================
    useEffect(() => {
        // Initialize Scene basics.
        // Check for not null objects.
        if(!(containerRef.current && mococo && brain)) return;
        
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
        dirLight.position.set(-3, 10, -10);
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
        mococo[0].scene.traverse(child => {
            if(child instanceof Mesh) child.castShadow = true;
        });
        mococo[0].scene.scale.setScalar(4);
        mococo[0].scene.position.y = 1;
        mococo[0].scene.position.z = -1;

        brain.traverse(child => {
            if(child instanceof Mesh){
                child.castShadow = true;
                child.material = new MeshStandardMaterial({
                    color: new Color(0xB5C6DB),
                    metalness: 1,
                    roughness: .4
                });
            }
        });
        brain.scale.setScalar(.01);
        brain.position.set(0, 1, 0);
        brain.rotation.set(5, 0, 0);

        // Creating an skeleton.
        const skeleton: SkeletonHelper = new SkeletonHelper(mococo[0].scene);
        skeleton.visible = true;
        
        // Add models to the scene.
        scene.add(mococo[0].scene, brain, skeleton, ilumination, dirLight, ground);

        // Camera setting.
        camera.position.set( 1, 2, -3 );
        camera.lookAt( 0, 1, 0 );

        // Main animation loop.
        const animate = (): void => {
            requestAnimationFrame(animate);
            mococo[0].scene.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();

        return (): void => {
            cancelAnimationFrame(animationFrameID);
            containerRef.current?.removeChild(renderer.domElement);
        }
    }, [mococo, brain]);

    useEffect(() => {
        const handleMouseDown = (event: MouseEvent): void => {
            setIsDragging(true);
            setLastMousePosition({ x: event.clientX, y: event.clientY });
        };
    
        const handleMouseMove = (event: MouseEvent): void => {
            if(!isDragging || !brain || !lastMousePosition) return;
    
            const deltaX: number = event.clientX - lastMousePosition.x;
            const deltaY: number = event.clientY - lastMousePosition.y;
    
            brain.rotation.z += deltaX * 0.01;
            brain.rotation.x += deltaY * -0.01;

            setLastMousePosition({ x: event.clientX, y: event.clientY });
        };
    
        const handleMouseUp = (): void => {
            setIsDragging(false);
            setLastMousePosition(null);
        };
    
        // Add event listeners to the renderer's DOM element
        const rendererElement = containerRef.current?.querySelector('canvas');
        if (rendererElement) {
            rendererElement.addEventListener('mousedown', handleMouseDown);
            rendererElement.addEventListener('mousemove', handleMouseMove);
            rendererElement.addEventListener('mouseup', handleMouseUp);
        }
    
        // Cleanup event listeners on component unmount
        return () => {
            if (rendererElement) {
                rendererElement.removeEventListener('mousedown', handleMouseDown);
                rendererElement.removeEventListener('mousemove', handleMouseMove);
                rendererElement.removeEventListener('mouseup', handleMouseUp);
            }
        };
    }, [isDragging, brain, lastMousePosition]);

    return <div ref={containerRef}/>
}

export default Scene;