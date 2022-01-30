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

  /** DELETE: delete the person from the server */
  deletePerson(id: number): Observable<Person> {
      const url = `${this.personsUrl}/delete_person/${id}`;
  
      return this.http.delete<Person>(url, this.httpOptions).pipe(
        tap(_ => console.log(`deleted person id=${id}`)),
        catchError(this.handleError<Person>('deletePerson'))
      );
    }

  /** POST: add a new person to the server */
  addPerson(person: Person): Observable<Person> {
    const url = `${this.personsUrl}/add_person`;
    console.log({"name": person.name, "age": person.age});
    return this.http.post<Person>(url, 
      {"name": person.name, "age": person.age}, 
      this.httpOptions).pipe(
        tap((newPerson: Person) => console.log(`added person w/ id=${newPerson.person_id}`)),
        catchError(this.handleError<Person>('addPerson'))
    );
  }

  /** PUT: update the person on the server */
  updatePerson(person: Person): Observable<any> {
    const url = `${this.personsUrl}/update_person/${person.person_id}`;
    
    return this.http.put(url, 
      {"name": person.name, "age": person.age}
      , this.httpOptions).pipe(
      tap(_ => console.log(`updated person id=${person.person_id}`)),
      catchError(this.handleError<any>('updatePerson'))
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