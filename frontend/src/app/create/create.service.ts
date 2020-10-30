import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'


@Injectable({
  providedIn: 'root'
})
export class CreateService {
  private baseUrl: string;

  constructor(private http: HttpClient) { 
    this.baseUrl = environment.restApi.uri
  }

  create_va(data: any) {
    return this.http.post<any>(
      this.baseUrl + '/va/create_va', data
    );
  }
}
