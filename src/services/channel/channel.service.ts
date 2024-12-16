import { Injectable } from '@angular/core';
import { Channel } from '../../classes/channel.class';
import { arrayRemove, arrayUnion, collection, doc, DocumentData, getDoc, onSnapshot, QuerySnapshot, serverTimestamp, setDoc, updateDoc, writeBatch } from '@angular/fire/firestore';
import { AuthenticationService } from '../authentication/authentication.service';
import { Member } from '../../interface/message';
import { combineLatest, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  currentChannelId: string = 'uZaX2y9zpsBqyaOddLWh';


  constructor(
    private authenticationService: AuthenticationService,
  ){
  }

  getAllAccessableChannelsFromFirestoreObservable(currentMember: Member): Observable<Channel[]> {
    const publicChannels$ = new Observable<Channel[]>((observer) => {
      this.getAllPublicChannelsFromFirestore((channels) => {
        observer.next(channels);
        observer.complete();
      });
    });
    const privateChannels$ = new Observable<Channel[]>((observer) => {
      this.getAllChannelsWithChannelIdsFromCurrentUser(currentMember, (channels) => {
        observer.next(channels);
        observer.complete();
      });
    });
    return combineLatest([publicChannels$, privateChannels$]).pipe(
      map(([publicChannels, privateChannels]) => [...publicChannels, ...privateChannels])
    );
  }
  
  
  async removeMemberIdFromChannel(memberId: string, channelId: string) {
    const channelRef = doc(this.authenticationService.getReference(), 'channels', channelId);
    const channelSnap = await getDoc(channelRef);
    if (channelSnap.exists()) {
      await updateDoc(channelRef, {
        membersId: arrayRemove(memberId),
      });
    } else {
      console.error('Channel document does not exist:', channelId);
    }
  }
  
  

  async updateChannelDetails(channelId: string, updates: Partial<Channel>) {
    if (!channelId) {
      throw new Error('Channel ID is invalid or not provided.');
    }
    const channelDocRef = doc(this.authenticationService.getReference(), 'channels', channelId);
    try {
      await updateDoc(channelDocRef, updates);
    } catch (error) {
      console.error(`Failed to update channel ${channelId}:`, error);
      throw error;
    }
  }


  sortChannelsByDate(channels: Channel[]): Channel[] {
    return channels.sort((a, b) => {
      const dateA = this.getTimestampAsDate(a.createdAt).getTime();
      const dateB = this.getTimestampAsDate(b.createdAt).getTime();
      return dateB - dateA; 
    });
  }
  

  private getTimestampAsDate(timestamp: any): Date {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate(); 
    }
    return new Date(timestamp); 
  }
  

  async getChannelById(channelId: string): Promise<Channel | null> {
    try {
      const channelDocRef = doc(this.authenticationService.getReference(), 'channels', channelId);
      const channelSnapshot = await getDoc(channelDocRef);
      if (channelSnapshot.exists()) {
        const data = channelSnapshot.data();
        return {
          id: data['id'],
          title: data['title'],
          messages: data['messages'] || [],
          membersId: data['membersId'] || [],
          admin: data['admin'],
          description: data['description'] || '',
          isPublic: data['isPublic'] || false,
          createdAt: data['createdAt'] || '',
        };
      } else {
        console.warn(`Channel with ID ${channelId} does not exist.`);
        return null;
      }
    } catch (error) {
      console.error(`Error while trying to get the document of channels with the ID: ${channelId}:`, error);
      return null;
    }
  }
  

  async getAllPublicChannelsFromFirestore(onChannelsUpdated: (channels: Channel[]) => void): Promise<void> {
    const channelsCollection = collection(this.authenticationService.getReference(), 'channels');
    onSnapshot(channelsCollection, (snapshot: QuerySnapshot<DocumentData>) => {
      const channels: Channel[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data['id'],
          title: data['title'],
          messages: data['messages'],
          membersId: data['membersId'],
          admin: data['admin'],
          description: data['description'],
          isPublic: data['isPublic'],
          createdAt: data['createdAt'] || '',
        };
      })
      .filter((channel) => channel.isPublic === true); 
      onChannelsUpdated(channels);
    }, (error) => {
      console.error("Fehler beim Abrufen der Channels: ", error);
    });
  }


  getAllChannelsWithChannelIdsFromCurrentUser(
    currentMember: Member,
    onChannelsUpdated: (channels: Channel[]) => void
  ): void {
    const channelsCollection = collection(this.authenticationService.getReference(), 'channels');
    onSnapshot(channelsCollection, (snapshot: QuerySnapshot<DocumentData>) => {
      const channels: Channel[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: data['id'],
            title: data['title'],
            messages: data['messages'],
            membersId: data['membersId'],
            admin: data['admin'],
            description: data['description'],
            isPublic: data['isPublic'],
            createdAt: data['createdAt'] || '',
          };
        })
        .filter((channel) => currentMember.channelIds.includes(channel.id)); 
      onChannelsUpdated(channels); 
    }, (error) => {
      console.error('Fehler beim Abrufen der Channels: ', error);
    });
  }


  getAllChannelsFromFirestore(): void {
    const channelsCollection = collection(this.authenticationService.getReference(), 'channels');
    onSnapshot(channelsCollection, (snapshot: QuerySnapshot<DocumentData>) => {
      const channels: Channel[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: data['id'],
            title: data['title'],
            messages: data['messages'],
            membersId: data['membersId'],
            admin: data['admin'],
            description: data['description'],
            isPublic: data['isPublic'],
            createdAt: data['createdAt'] || '',
          };
        })
      })
  }
  

  async addChannelToFirebase(channel: Channel) {
    const firestore = this.authenticationService.getReference(); // Firestore-Instanz
    const userUid = this.authenticationService.getCurrentUserUid();
    if (!userUid) {
      throw new Error("User UID is invalid or not found");
    }
    const collectionRef = collection(firestore, "channels"); // Sammlung "channels"
    const docRef = doc(collectionRef); // Automatische Dokument-ID
    channel.id = docRef.id;
    await setDoc(docRef, {
      adminName: this.authenticationService.currentMember.name,
      createdAt: serverTimestamp(),
      id: channel.id,
      title: channel.title,
      messages: [],
      membersId: channel.membersId,
      admin: userUid,
      description: channel.description,
      isPublic: channel.isPublic,
    });
  }


  async addChannelIdToMembers(memberIds: string[], channelId: string) {
    const firestore = this.authenticationService.getReference();
    const batch = writeBatch(firestore);
    memberIds.forEach((memberId) => {
      const memberRef = doc(firestore, "member", memberId); 
      batch.update(memberRef, {
        channelIds: arrayUnion(channelId),
      });
    });
    await batch.commit();
  }
  

  async addChannelIdToCurrentUser(docRefid: string) {
    const userUid = this.authenticationService.getCurrentUserUid();
    if (!userUid) {
      throw new Error("User UID is invalid or not found");
    }
    const userDocRef = doc(this.authenticationService.getReference(), "member", userUid);
    await updateDoc(userDocRef, {
      channelIds: arrayUnion(docRefid),
    });
  }
  

  async updateMemberIdsToChannel(channelId: string, memberIds: string[]) {  
    if (!channelId) {
      throw new Error("Invalid channelId provided.");
    };
    const batch = writeBatch(this.authenticationService.getReference());
    const channelDocRef = doc(this.authenticationService.getReference(), 'channels', channelId);
    batch.update(channelDocRef, {
      membersId: arrayUnion(...memberIds)
    });
    await batch.commit();
  }
  
}
