import { useLocation } from 'react-router-dom';

function usePortalBase() {
  const { pathname } = useLocation();

  return pathname.startsWith('/officer') ? '/officer' : '/admin';
}

export { usePortalBase };
