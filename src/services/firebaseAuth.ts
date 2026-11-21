import { getAuth } from 'firebase/auth';
import { app } from '../../config_firebase';

// Fallback para ferramentas TypeScript. Metro usa os arquivos .web/.native.
export const auth = getAuth(app);
