import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
  console.error('API Error:', error);
  
  let errorMessage = 'An error occurred';
  
  if (error.error instanceof ErrorEvent) {
    errorMessage = error.error.message;
  } else {
    switch (error.status) {
      case 0:
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
        break;
      case 400:
        // **هنا المشكلة: لازم تأخذ الرسالة من error.error.error**
        errorMessage = error.error?.error || error.error?.message || 'Invalid request data';
        break;
      case 401:
        errorMessage = error.error?.error || error.error?.message || 'Invalid email or password';
        break;
      case 404:
        errorMessage = 'Resource not found';
        break;
      case 500:
        errorMessage = error.error?.error || error.error?.message || 'Internal server error';
        break;
      default:
        errorMessage = error.error?.error || error.error?.message || `Error: ${error.status}`;
    }
  }
  return throwError(() => new Error(errorMessage));
}
}