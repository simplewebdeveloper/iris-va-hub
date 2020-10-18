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

//   get_all_vas() {
//     return this.http.get<any>(
//      this.baseUrl + '/va/get_vas'
//    );
//  }

  get_single_va(va_id) {
    return this.http.post<any>(
      this.baseUrl + '/va/get_va', {va_id}
    );
  }

  save_va(data: any) {
    return this.http.post<any>(
      this.baseUrl + '/va/update_va', data
    );
  }
}
