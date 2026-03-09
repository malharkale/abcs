import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { VideoCallComponent } from './components/video-call/video-call.component';
import { SocketService } from './services/socket.service';
import { WebRtcService } from './services/webrtc.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    VideoCallComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonModule
  ],
  providers: [SocketService, WebRtcService],
  bootstrap: [AppComponent]
})
export class AppModule { }
