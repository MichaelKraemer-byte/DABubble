import { inject, Injectable } from '@angular/core';
import { Member } from '../../interface/message';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';
import { arrayRemove, arrayUnion, collection, doc, DocumentData, getDoc, getDocs, onSnapshot, QuerySnapshot, updateDoc } from '@firebase/firestore';
import { MatDialog } from '@angular/material/dialog';
import { CurrentProfileComponent } from '../../app/dialog/current-profile/current-profile.component';
import { updateProfile } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  allChannelMembers: Member[] = [];
  allMembersNames: any = []
  currentProfileMember: any = {};
  readonly dialog = inject(MatDialog);

  constructor(private authenticationService: AuthenticationService) {
  }

  async openProfileUser(id: string) {
    this.currentProfileMember = await this.search(id);
    this.openDialog();
  }

  openDialog(): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); 
    const dialogRef = this.dialog.open(CurrentProfileComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
      }
    });
  }

  getAllMembersFromFirestoreObservable(): Observable<Member[]> {
    return new Observable((observer) => {
      this.getAllMembersFromFirestore((members: Member[]) => {
        observer.next(members);
      });
    });
  }

  async addChannelIdToIgnoreList(memberId: string, channelId: string) {
    const memberRef = doc(this.authenticationService.getReference(), 'member', memberId);
    const memberSnap = await getDoc(memberRef);
    
    if (memberSnap.exists()) {
      await updateDoc(memberRef, {
        ignoreList: arrayUnion(channelId || ''),
      });
    } else {
      console.error('Member document does not exist:', memberId);
    }
  }

  async removeChannelIdFromMember(memberId: string, channelId: string) {
    const memberRef = doc(this.authenticationService.getReference(), 'member', memberId);
    const memberSnap = await getDoc(memberRef);
    
    if (memberSnap.exists()) {
      const channelRef = doc(this.authenticationService.getReference(), 'channels', channelId);
      const channelSnap = await getDoc(channelRef);
      
      if (!channelSnap.exists()) {
        console.warn(`Channel ${channelId} does not exist. Removing stale reference.`);
      } else {
        await updateDoc(memberRef, {
          channelIds: arrayRemove(channelId),
        });
      }
    } else {
      console.error('Member document does not exist:', memberId);
    }
  }
  


  getAllMembersFromFirestore(onMembersUpdated: (members: Member[]) => void): void {
    const membersCollection = collection(this.authenticationService.getReference(), 'member');
    onSnapshot(membersCollection, (snapshot: QuerySnapshot<DocumentData>) => {
      const members: Member[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data['name'],
          email: data['email'],
          imageUrl: data['imageUrl'],
          status: data['status'],
          channelIds: data['channelIds'] || [],
          ignoreList: data['ignoreList'] || [],
        };
      });
      onMembersUpdated(members);
    }, (error) => {
      console.error("Fehler beim Abrufen der Mitglieder: ", error);
    });
  }



  async allMembersInChannel(): Promise<Member[]> {
    const membersId: string[] = this.authenticationService.currentChannelData?.membersId ?? [];
    // if (membersId.length === 0) {
    //   console.warn('No members found');
    //   return [];
    // }
    const memberPromises = membersId.map(id => this.search(id));
    const members = await Promise.all(memberPromises);
    this.allChannelMembers = members.filter(member => member !== null) as Member[];
    return this.allChannelMembers;
  }


  async search(id: string): Promise<Member | null> {
    const docRef = doc(this.authenticationService.getReference(), "member", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Member;
    }
    return null;
  }


  async setCurrentMemberData() {
    const docRef = doc(this.authenticationService.getReference(), 'member', this.authenticationService.getCurrentUserUid());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      this.authenticationService.currentMember = {
        id: data['id'],
        name: data['name'],
        email: data['email'],
        imageUrl: data['imageUrl'],
        status: data['status'],
        channelIds: data['channelIds'],
        ignoreList: data['ignoreList'] || [],
      }
    } else {
      console.log("No such document!");
    }
  }

  async getCurrentMember(): Promise<Member | undefined> {
    const docRef = doc(this.authenticationService.getReference(), 'member', this.authenticationService.getCurrentUserUid());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: data['id'],
        name: data['name'],
        email: data['email'],
        imageUrl: data['imageUrl'],
        status: data['status'],
        channelIds: data['channelIds'],
        ignoreList: data['ignoreList'] || [],
      }
    } else {
      console.log("No such document!");
      return undefined;
    }
  }


  prioritizeCurrentMember(members: Member[], currentMember: Member | null | undefined): Member[] {
    if (!currentMember) {
      return members;
    }
    return [
      currentMember,
      ...members.filter(member => member.id !== currentMember.id)
    ];
  }


  async updateCurrentMemberData(currentMember: Member): Promise<void> {
    try {
      const docRef = doc(this.authenticationService.getReference(), 'member', this.authenticationService.getCurrentUserUid());
      await updateDoc(docRef, {
        name: currentMember.name,
        email: currentMember.email,
      });
    } catch (error) {
      console.error("Error while updating current user data:", error);
    }
  }


  async updateProfileImageOfUser(newImageUrl: string): Promise<void> {
    const user = this.authenticationService.auth.currentUser; 
    if (user) {
      try {
        // Aktualisiere Firebase Authentication
        await updateProfile(user, { photoURL: newImageUrl });
  
        // Aktualisiere Firestore
        const memberDoc = doc(this.authenticationService.getReference(), 'member', user.uid);
        await updateDoc(memberDoc, { imageUrl: newImageUrl });
        } catch (error) {
        console.error('Fehler beim Aktualisieren des Profilbildes:', error);
      }
    } else {
      console.error('Kein authentifizierter Benutzer gefunden.');
    }
  }
  
  
  

  async allMembersName() {
    this.allMembersNames = [];
    const querySnapshot = await getDocs(collection(this.authenticationService.getReference(), "member"));
    querySnapshot.forEach((doc) => {
      this.allMembersNames.push(doc.data()['name'])
    });
  }



}
