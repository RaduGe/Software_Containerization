import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Person } from './person';

@Injectable({ providedIn: 'root' })
export class RestDataService {

  private personsUrl = 'http://10.152.183.81:8081/api';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient) { }

  /** GET heroes from the server */
  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.personsUrl + '/get_person')
      .pipe(
        catchError(this.handleError<Person[]>('getPersons', []))
      );
  }

  /** DELETE: delete the hero from the server */
  deletePerson(id: number): Observable<Person> {
      const url = `${this.personsUrl}/delete_person/${id}`;
  
      return this.http.delete<Person>(url, this.httpOptions).pipe(
        tap(_ => console.log(`deleted person id=${id}`)),
        catchError(this.handleError<Person>('deletePerson'))
      );
    }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}