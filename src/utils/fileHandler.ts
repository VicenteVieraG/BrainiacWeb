import { resolve, join } from "path";
import { readdirSync } from "fs";
import { readdir, stat } from "fs/promises";

/** 
 * @description
 * Returns an string array containig the names of all  the 
 * files in the specified directory (path).
 * @param path 
 * String reperesenting the relative path of the directory.
*/
export const getDirFilesNames = async(path: string): Promise<string[]> => {
    try {
        // Get the absolute path.
        const absolutePath: string = resolve(path);
        const directoryContent: string[] = await readdir(absolutePath);
        
        // Filter only the file´s names.
        const fileNames = await Promise.all(directoryContent.map(async item => {
            const itemPath: string = join(absolutePath, item);
            const stats = await stat(itemPath);

            return stats.isFile()? item : null;
        }));

        return fileNames.filter(Boolean) as string[];
    }catch(err){
        return new Promise<string[]>((resolve, rejects) => err? rejects(err) : resolve([]));
    }
}

export const getFilePaths = async(relativePath: string = '.'): Promise<string[]> => {
    const absolutePath = resolve(relativePath);
    const filenames = await readdir(absolutePath);
    return filenames.map(filename => join(absolutePath, filename));
  }
  