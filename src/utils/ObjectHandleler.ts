import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import type { Object3D } from "three";

interface LoadAssetOptions {
    type?: ModelType;
}

type ModelType = "obj"
    |"fbx"
    |"gltf"
    |"collada"
    |"draco"
    |"stl"
    |"ply";

type Loader = OBJLoader
    | FBXLoader
    | GLTFLoader
    | ColladaLoader
    | DRACOLoader
    | STLLoader
    | PLYLoader;

export const loadAsset = async (assetPaths: string[], options?: LoadAssetOptions): Promise<Object3D[]> => {
    const type = options?.type || "obj";

    const loadedAssets = assetPaths.map((path) => {
        let loader: Loader;

        switch(type) {
            case "obj":
                loader = new OBJLoader();
                break;
            case "fbx":
                loader = new FBXLoader();
                break;
            case "gltf":
                loader = new GLTFLoader();
                break;
            case "collada":
                loader = new ColladaLoader();
                break;
            case "draco":
                loader = new DRACOLoader();
                break;
            case "stl":
                loader = new STLLoader();
                break;
            case "ply":
                loader = new PLYLoader();
                break;
            default:
                throw new Error("Unsupported model type");
        }

        return new Promise<Object3D>((resolve, reject) => {
            loader.load(path, (object) => {
                console.log("ASSERT: ", object);
                resolve(object as Object3D);
            }, undefined, (error) => {
                console.log("ERROR: ", error)
                reject(error);
            });
        });
    });

    return Promise.all(loadedAssets);
};
