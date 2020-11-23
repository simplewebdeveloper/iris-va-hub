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
  va: any;
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

  save_bls(data: any) {
    return this.http.post<any>(
      this.baseUrl + '/va/save_bls', data
    )
  }

  get_bls(va_id) {
    return this.http.post<any>(
      this.baseUrl + '/va/get_bls', {va_id}
    )
  }

  get_va_id() {
    return this.va_id;
  }

  set_current_va(va) {
    this.va = va;
  }

  get_current_va() {
    return this.va;
  }

}
