import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class VaService {

  private baseUrl: string;
  project_id: any;
  va_id: any;
  va_tag: any;

  constructor(private http: HttpClient) { 
    this.baseUrl = environment.restApi.uri
  }

  get_single_va(va_id) {
    this.va_id = va_id
    return this.http.post<any>(
      this.baseUrl + '/va/get_va', {va_id}
    );
    
  }

  get_va_id() {
    return this.va_id;
  }

  set_va_id(va_id) {
    this.va_id = va_id;
  }

  set_project_id(project_id) {
    this.project_id = project_id;
  }

  get_project_id() {
    return this.project_id;
  }

}
