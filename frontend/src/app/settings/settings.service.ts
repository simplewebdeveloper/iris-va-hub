import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment'


@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private baseUrl: string;

  constructor(private http: HttpClient) { 
    this.baseUrl = environment.restApi.uri
   }

   private options = { headers: new HttpHeaders().set('Content-Type', 'application/json') };

   wipeAndResetModels() {
    return this.http.post<any>(
      this.baseUrl + '/model/wipe_and_reset_models', this.options
    );
  }

}
