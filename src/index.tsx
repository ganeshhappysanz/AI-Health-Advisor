import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './App';
import './index.css';

bootstrapApplication(AppComponent)
  .catch(err => console.error(err));
