import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { VideoCallComponent } from './components/video-call/video-call.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'call/:roomId', component: VideoCallComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
