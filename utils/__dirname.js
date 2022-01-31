import path from 'path';
import { fileURLToPath } from 'url';

export const getDirname = (fileUrl) => {
    const __filename = fileURLToPath(fileUrl);
    return path.dirname(__filename);
}
