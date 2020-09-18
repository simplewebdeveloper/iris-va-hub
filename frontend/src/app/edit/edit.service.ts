import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class EditService {

  private baseUrl: string;

  constructor(private http: HttpClient) { 
    this.baseUrl = environment.restApi.uri
  }

  getAllBots() {
    return this.http.get<any>(
     this.baseUrl + '/bot/get_bots'
   );
 }

  getSingleBot(botId: number) {
    return this.http.post<any>(
      this.baseUrl + '/bot/get_bot', botId
    );
  }

  saveBot(data: any) {
    return this.http.post<any>(
      this.baseUrl + '/bot/update', data
    );
  }
}
