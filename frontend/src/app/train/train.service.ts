import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TrainService {
  
  private base_url: string;

  constructor(private http: HttpClient) { 
    this.base_url = environment.restApi.uri
   }
  private options = { headers: new HttpHeaders().set('Content-Type', 'application/json') };

  get_vas() {
     return this.http.get<any>(
      this.base_url + '/va/get_vas'
    );
  }
  get_single_va(va_id: number) {
    return this.http.post<any>(
      this.base_url + '/va/get_va', {va_id}
    );
  }
  create_intent(data: any) {
    console.log(data);
    return this.http.post<any>(
      this.base_url + '/intent/create_intent', data
    );
  }
  create_svp(data: any) {
    return this.http.post<any>(
      this.base_url + '/svp/create_svp', data
    );
  }
  get_all_intents(va_id: number, selected_intent) {
    return this.http.post<any>(
      this.base_url + '/intent/get_intents', {va_id, selected_intent}
    );
  }

  get_selected_update_intents(va_id: number, selectedIntent) {
    console.log(selectedIntent);
    return this.http.post<any>(
      this.base_url + '/intent/get_update_intents', {va_id, selectedIntent}
    );
  }

  get_all_training_intents(va_id: number) {
    return this.http.post<any>(
      this.base_url + '/intent/get_training_intents', va_id
    );
  }

  get_update_sense_data(va_id: number) {
    return this.http.post<any>(
      this.base_url + '/intent/get_update_sense_data', va_id
    );
  }

  get_intents_with_svp_data(va_id) {
    return this.http.post<any>(
      this.base_url + '/svp/get_intents_with_svp_data', {va_id}
    );
  }


    get_all_svps(va_id, selected_intent) {
    return this.http.post<any>(
      this.base_url + '/svp/get_svps', {va_id, selected_intent}
    );
  }
  delete_single_utterance(intentId) {
    return this.http.post<any>(
      this.base_url + '/intent/delete_intent', intentId
    );
  }
    delete_single_svp(svpId) {
    return this.http.post<any>(
      this.base_url + '/svp/delete_svp', svpId
    );
  }
  feed_intents(project_id, va_id, va_tag, selected_update_intent) {
    console.log(va_tag)
    return this.http.post<any>(
      this.base_url + '/intent/feed_intents', {project_id, va_id, va_tag, selected_update_intent}
    );
  }

  feed_update_sense(project_id, va_id, va_tag) {
    return this.http.post<any>(
      this.base_url + '/intent/feed_update_sense', {project_id, va_id, va_tag}, this.options
    );
  }

  feed_svps(project_id, va_id, va_tag, selected_intent) {
    return this.http.post<any>(
      this.base_url + '/svp/feed_svps', {project_id, va_id, va_tag, selected_intent}, this.options
    );
  }
  train_classifier_model(project_id, va_id, va_tag, selected_update_intent) {
    return this.http.post<any>(
      this.base_url + '/model/train_classifier_model', {project_id, va_id, va_tag, selected_update_intent}, this.options
    );
  }

  train_update_sense_classifier_model(project_id, va_id, va_tag) {
    return this.http.post<any>(
      this.base_url + '/model/train_update_sense_classifier_model', {project_id, va_id, va_tag}, this.options
    );

  }

  train_svp_model(selected_intent, project_id, va_id, va_tag) {
    return this.http.post<any>(
      this.base_url + '/model/train_svp_model', {selected_intent, va_id, project_id, va_tag}, this.options
    );
  }

}
