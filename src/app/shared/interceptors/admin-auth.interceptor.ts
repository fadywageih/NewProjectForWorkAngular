import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../../environments/environment";

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Check if this is an admin API request
  const isAdminApi = req.url.includes('/api/admin');
  
  console.log('🔍 Interceptor Check:', {
    url: req.url,
    isAdminApi: isAdminApi,
    hasToken: !!localStorage.getItem('admin_token')
  });
  
  if (isAdminApi) {
    const adminToken = localStorage.getItem('admin_token');
    
    if (adminToken) {
      console.log('✅ Adding Authorization header to request');
      req = req.clone({
        setHeaders: { 
          Authorization: `Bearer ${adminToken}` 
        }
      });
    } else {
      console.warn('⚠️ Admin API request but no token found in localStorage');
    }
  }
  
  return next(req);
};