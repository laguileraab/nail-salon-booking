import { useAuth as originalUseAuth } from '../contexts/AuthContext';

export function useAuth() {
  return originalUseAuth();
}
