import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ResponseService {
  private baseUrl: string;

  constructor(private http: HttpClient) { 
    this.baseUrl = environment.restApi.uri
   }


   create_response(data: any) {
     console.log(data)
      return this.http.post<any>(
        this.baseUrl + '/va/create_response', data
      )
   } 

   save_response(data: any) {
     return this.http.post<any>(
       this.baseUrl + '/va/update_response', data
     )
   }


   get_responses(device: string) {
    return this.http.post<any>(
      this.baseUrl + '/va/get_responses', {device}
    )
   }

   delete_responses(response_id: number) {
    return this.http.post<any>(
      this.baseUrl + '/va/delete_response', {response_id}
    )
   }
}


