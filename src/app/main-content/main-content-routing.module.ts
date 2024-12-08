import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
      path: '',
      loadComponent: () => import('./main-content.component').then(m => m.MainContentComponent),
      children: [
        {
          path: 'chat',
          loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent),
        },
        {
          path: 'thread',
          loadComponent: () => import('./thread/thread.component').then(m => m.ThreadComponent),
        },
        {
          path: 'devspace',
          loadComponent: () => import('./devspace/devspace.component').then(m => m.DevspaceComponent),
        }
      ]
    }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainContentRoutingModule {}