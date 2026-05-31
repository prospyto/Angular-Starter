import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';
  loading$ = new BehaviorSubject<boolean>(false);

  get<T>(path: string): Observable<T> {
    this.loading$.next(true);
    return this.http.get<T>(`${this.baseUrl}${path}`).pipe(
      retry(1),
      tap(() => this.loading$.next(false)),
      catchError(err => {
        this.loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    this.loading$.next(true);
    return this.http.post<T>(`${this.baseUrl}${path}`, body).pipe(
      tap(() => this.loading$.next(false)),
      catchError(err => {
        this.loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    this.loading$.next(true);
    return this.http.patch<T>(`${this.baseUrl}${path}`, body).pipe(
      tap(() => this.loading$.next(false)),
      catchError(err => {
        this.loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  delete<T>(path: string): Observable<T> {
    this.loading$.next(true);
    return this.http.delete<T>(`${this.baseUrl}${path}`).pipe(
      tap(() => this.loading$.next(false)),
      catchError(err => {
        this.loading$.next(false);
        return throwError(() => err);
      })
    );
  }
}
