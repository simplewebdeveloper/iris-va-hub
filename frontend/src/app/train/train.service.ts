import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TrainService {
  
  private baseUrl: string;

  constructor(private http: HttpClient) { 
    this.baseUrl = environment.restApi.uri
   }
  private options = { headers: new HttpHeaders().set('Content-Type', 'application/json') };

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
  createIntent(data: any) {
    return this.http.post<any>(
      this.baseUrl + '/intent/create_intent', data
    );
  }
  createSvp(data: any) {
    return this.http.post<any>(
      this.baseUrl + '/svp/create_svp', data
    );
  }
  getAllIntents(botId: number, selectedIntent) {
    return this.http.post<any>(
      this.baseUrl + '/intent/get_intents', {botId, selectedIntent}
    );
  }

  getSelectedUpdateIntents(botId: number, selectedIntent) {
    console.log(selectedIntent);
    return this.http.post<any>(
      this.baseUrl + '/intent/get_update_intents', {botId, selectedIntent}
    );
  }

  getAllTrainingIntents(botId: number) {
    return this.http.post<any>(
      this.baseUrl + '/intent/get_training_intents', botId
    );
  }

  getUpdateSenseData(botId: number) {
    return this.http.post<any>(
      this.baseUrl + '/intent/get_update_sense_data', botId
    );
  }

  getIntentsWithSvpData(botId) {
    return this.http.post<any>(
      this.baseUrl + '/svp/get_intents_with_svp_data', botId
    );
  }


    getAllSvps(botId, selectedIntent) {
    return this.http.post<any>(
      this.baseUrl + '/svp/get_svps', {botId, selectedIntent}
    );
  }
  deleteSingleUtterance(intentId) {
    return this.http.post<any>(
      this.baseUrl + '/intent/delete_intent', intentId
    );
  }
    deleteSingleSvp(svpId) {
    return this.http.post<any>(
      this.baseUrl + '/svp/delete_svp', svpId
    );
  }
  feedIntents(botId, va_tag, selectedUpdateIntent) {
    return this.http.post<any>(
      this.baseUrl + '/intent/feed_intents', {botId, va_tag, selectedUpdateIntent}
    );
  }

  feedUpdateSense(botId: any) {
    return this.http.post<any>(
      this.baseUrl + '/intent/feed_update_sense', botId, this.options
    );
  }

  feedSvps(botId, va_tag, selectedIntent) {
    return this.http.post<any>(
      this.baseUrl + '/svp/feed_svps', {botId, va_tag, selectedIntent}, this.options
    );
  }
  trainClassifierModel(selectedUpdateIntent, va_tag) {
    return this.http.post<any>(
      this.baseUrl + '/model/train_classifier_model', {selectedUpdateIntent, va_tag}, this.options
    );
  }

  trainUpdateSenseClassifierModel() {
    return this.http.post<any>(
      this.baseUrl + '/model/train_update_sense_classifier_model', this.options
    );

  }

  trainSvpModel(selectedIntent, va_tag) {
    return this.http.post<any>(
      this.baseUrl + '/model/train_svp_model', {selectedIntent, va_tag}, this.options
    );
  }

}
