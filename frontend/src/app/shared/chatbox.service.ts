import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatboxService {

  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.restApi.uri
   }
  chatbox_query(query, va_id, device) {
    return this.http.post<any>(
      this.baseUrl + '/test/test_query', {query, va_id, device}
    );
  }
}
