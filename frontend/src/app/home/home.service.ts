import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'
import {BehaviorSubject, Observable} from 'rxjs';
import {Bot} from '../models/bot.model';
import { CreateService } from '../create/create.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private baseUrl: string;
  bot: any;
  bots: Bot[];

  constructor(private http: HttpClient) { 
    this.baseUrl = environment.restApi.uri
   }

  getAllBots() {
    return this.http.get<any>(
      this.baseUrl + '/bot/get_bots'
    );
  }

  deleteSingleBot(botId: any) {
    return this.http.post<any>(
      this.baseUrl + '/bot/delete_bot', botId
    );
  }
}
