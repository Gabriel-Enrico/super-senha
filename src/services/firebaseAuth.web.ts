import { getAuth } from 'firebase/auth';
import { app } from '../../config_firebase';

export const auth = getAuth(app);
