import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from "moment";
import { Router, CanActivate, CanLoad } from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string;
  private httpOptions: any;
   // the actual JWT token
   public token: string;

   public userLoggedIn: boolean;
   public userLoggedOut: boolean;
 
   // the token expiration date
   public expires_at: Date;
   public expires_in: number
  
   // the username of the logged in user
   public username: string;
  
   // error messages received from the login attempt
   public errors: any = [];

   constructor(private http: HttpClient, public router: Router) { 
    this.baseUrl = environment.restApi.uri,
    this.httpOptions = {
      headers: new HttpHeaders({'content-Type': 'application/json'})
    }
   }
   login(data: any) {
    // console.log(data);
      return this.http.post(this.baseUrl + '/api-token-auth/', data, this.httpOptions).subscribe(
        (res) => {
          // console.log(res);
          this.token = res['token'];
          this.updateData(this.token);
          this.setSession(this.token, this.expires_in);
          this.userLoggedIn = this.isLoggedIn();
          this.userLoggedOut = this.isLoggedOut();
          this.router.navigate(['home']);
        },
        (err) => {
          this.errors = err.error;
        }
      )
  }

  private setSession(token, expires_in) {
    const expiresAt = moment().add(expires_in, 'second');

    localStorage.setItem('token', token);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()) );
  }

  public logout() {
    this.token = null;
    this.expires_at = null;
    this.username = null;
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
    window.alert('You are logged out !');
    this.userLoggedIn = this.isLoggedIn();
    this.userLoggedOut = this.isLoggedOut();
    if(this.userLoggedOut) {
      this.router.navigate(['login']);
    }
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }
 
  private updateData(token) {
    this.token = token;
    this.errors = [];
    // decode the token to read the username and expiration timestamp
    const token_parts = this.token.split(/\./);
    const token_decoded = JSON.parse(window.atob(token_parts[1]));
    this.expires_in = token_decoded.exp
    this.expires_at = new Date(token_decoded.exp * 1000);
    this.username = token_decoded.username;
  }
}
