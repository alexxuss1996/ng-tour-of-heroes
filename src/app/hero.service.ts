import { Injectable } from "@angular/core";
import { Hero } from "./hero";
import { HEROES } from "./mock-heroes";
import { Observable, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";

import { HttpClient, HttpHeaders } from "@angular/common/http";

import { MessageService } from "./message.service";

const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/json" })
};

@Injectable({
  providedIn: "root"
})
export class HeroService {
  private heroesUrl = "api/heroes";

  getHeroes(): Observable<Hero[]> {
    // TODO: send the message _after_ fetching the heroes
    // this.messageService.add("HeroService: fetching heroes");
    return this.httpInt.get<Hero[]>(this.heroesUrl).pipe(
      tap(_ => this.log("fetched heroes")),
      catchError(this.handleError("getHeroes", []))
    );
  }
  /** GET hero by id. return `undefined` when id not found */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.httpInt.get<Hero[]>(url).pipe(
      map(heroes => heroes[0]), // returns {0|1} elements array
      tap(h => {
        const outcome = h ? "fetched" : "did not find";
        this.log(`${outcome} hero id=${id}`);
      })
    );
  }

  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.httpInt.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }
  updateHero(hero: Hero): Observable<any> {
    return this.httpInt.put<Hero>(this.heroesUrl, hero, httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>("updateHero"))
    );
  }

  /** POST: add a new hero to the server. */
  addHero(hero: Hero): Observable<Hero> {
    return this.httpInt.post<Hero>(this.heroesUrl, hero, httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero /w id=${newHero.id}`)),
      catchError(this.handleError<Hero>("addHero"))
    );
  }

  /** DELETE: delete the hero from the server */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === "number" ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;
    return this.httpInt.delete<Hero>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>("deleteHero"))
    );
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // If not search hero term, return empty hero array.
      return of([]);
    }
    return this.httpInt.get<Hero[]>(`${this.heroesUrl}/?=name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>("searchHeroes", []))
    );
  }
  /**
   * Handle http operation that failed.
   * Let the app continue
   * @param operation - name of operation that failed
   * @param result - optional value to return as the observable result.
   */
  public handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // Log to console instead

      // TODO: better job of transforming  error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
  /** Log a HeroService message with the messageService  */
  private log(message: string) {
    this.messageService.add(`Heroes service: ${message}`);
  }

  constructor(private messageService: MessageService, private httpInt: HttpClient) {}
}
