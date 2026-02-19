import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { authInterceptor } from "./shared/interceptors/auth.interceptor";
import { routes } from "./app.routes";
import { adminAuthInterceptor } from "./shared/interceptors/admin-auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        adminAuthInterceptor   
      ]),
      withFetch() 
    ),
    provideRouter(routes),
  ]
};