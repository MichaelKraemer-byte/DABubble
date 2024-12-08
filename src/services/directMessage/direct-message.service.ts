import { Injectable } from '@angular/core';
import { addDoc } from '@angular/fire/firestore';
import { AuthenticationService } from '../authentication/authentication.service';
import { arrayRemove, arrayUnion, deleteDoc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from '@firebase/firestore';
import { firstValueFrom, Subject } from 'rxjs';
import { ReferencesService } from '../references/references.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class DirectMessageService {
  public isDirectMessage: boolean = false;
  public directMessageUserData: any = {};
  public directMessageChannelId: string = '';
  public userOne: string = '';
  public userTwo: string = '';
  public allDirectMessages: any = [];
  messagesUpdated = new Subject<void>();


  constructor(
    private authenticationService: AuthenticationService, 
    private referencesServic: ReferencesService,
    private storageService: StorageService,
  ) {}

  async createDirectMessage(messageField: string) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('de-DE', { weekday: 'long' }); // Optional: Sprachanpassung
    const weekday = formatter.format(now);
    const day = now.getDate();
    const month = now.toLocaleString('de-DE', { month: 'long' }); // Optional: Lokale Monatsnamen
    const createdAt = `${weekday}, ${day} ${month}`;
    const member = await this.authenticationService.getCurrentMemberSafe();
    if (!member) {
      throw new Error('Benutzer ist nicht angemeldet oder currentMember ist undefined.');
    }
    const messageData = {
      user: this.authenticationService.getCurrentUserUid(),
      name: member.name,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      message: messageField,
      profileImage: member.imageUrl,
      createdAt: createdAt, // Manuell formatiertes Datum
      timestamp: Date.now(),
      reactions: {
        like: [],
        rocket: []
      },
      attachment: this.storageService.messageImages
    };
    const messageDocRef = await addDoc(
      this.referencesServic.getCollectionDirectMessages(this.directMessageChannelId),
      messageData
    );
    await this.updateDirectMessageId(messageDocRef);
    this.messagesUpdated.next();
    this.storageService.messageImages = [];
  }
  
  


async checkOrCreateDirectMessageChannel(targetMemberId: string): Promise<void> {
  await this.readDirectUserData(targetMemberId);
  if (!this.directMessageUserData || !this.directMessageUserData['id']) {
    throw new Error("Error: directMessageUserData could not be found.");
  }
  const channelId = this.generateChannelId(
    this.directMessageUserData['id'], 
    this.authenticationService.getCurrentUserUid()
  );
  const docSnap = await getDoc(this.referencesServic.getDirectMessageDocRef(channelId));
  if (!docSnap.exists()) {
    this.directMessageChannelId = channelId;
    await this.createDirectMessageChannel();  // Channel wird neu erstellt
  } else {
    this.directMessageChannelId = channelId;
  }
}

  
  async updateDirectMessageId(messageDocRef: any) {
    await updateDoc(messageDocRef, {
      messageId: messageDocRef.id,
    });
  }

  async createDirectMessageChannel() {
    if (!this.directMessageUserData || !this.directMessageUserData['id']) {
      throw new Error("directMessageUserData or its ID is undefined.");
    }
    if (!this.authenticationService.memberId) {
      throw new Error("Logged in member ID is undefined.");
    }
    await setDoc(this.referencesServic.getDirectMessageDocRef(this.directMessageChannelId), {
      memberOne: this.directMessageUserData['id'],
      memberTwo: this.authenticationService.memberId,
      timestamp: Date.now()
    });
  }

  readDirectMessages() {
    const unsub = onSnapshot(this.referencesServic.getCollectionDirectMessages(this.directMessageChannelId), (snapshot) => {
      this.allDirectMessages = snapshot.docs
        .map((doc) => {
          const data = doc.data() as { [key: string]: any };
          return {
            id: doc.id,
            ...data,
            timestamp: data['timestamp'] || 0,
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp);
      this.messagesUpdated.next();
    });
    return unsub;
  }

  async readDirectUserData(memberId: string) {
    const docSnap = await getDoc(this.referencesServic.getMemberDocRef(memberId));
    if (docSnap.exists()) {
      this.directMessageUserData = docSnap.data();
      this.userOne = this.directMessageUserData['id'];
      this.userTwo = this.authenticationService.memberId;
      this.directMessageChannelId = this.generateChannelId(this.userOne, this.userTwo);
      this.readDirectMessages();
    }
  }

  generateChannelId(userOne: string, userTwo: string): string {
    return [userOne, userTwo].sort().join('');
  }

  async deleteMessage(messageId: string) {
    await deleteDoc(this.referencesServic.getDirektMessageDocRefId(this.directMessageChannelId, messageId));
    const querySnapshot = await getDocs(this.referencesServic.getCollectionDirectMessages(this.directMessageChannelId));
    if (querySnapshot.empty) {
      this.allDirectMessages = [];
      this.messagesUpdated.next();
    }
  }

  async updateDirectMessage(messageId: string, newMessage: string) {
    await updateDoc(this.referencesServic.getDirektMessageDocRefId(this.directMessageChannelId, messageId), {
      message: newMessage
    });
    await this.checkMessageLength(messageId);
  }

  async deleteImages(attachmentUrl: string, messageId: string) {
    const docRef = this.referencesServic.getDirektMessageDocRefId(this.directMessageChannelId, messageId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Dokument existiert nicht.");
    }
    const attachmentArray = docSnap.data()?.["attachment"];
    if (!Array.isArray(attachmentArray)) {
      throw new Error("Attachment ist kein Array oder nicht vorhanden.");
    }
    const updatedArray = attachmentArray.filter((url: string) => url !== attachmentUrl);
    await updateDoc(docRef, {
      attachment: updatedArray
    });
     await this.checkMessageLength(messageId);
  }

  async checkMessageLength(messageId: string) {
    const docSnap = await getDoc(this.referencesServic.getDirektMessageDocRefId(this.directMessageChannelId, messageId));
    if (docSnap.exists()) {
      if (docSnap.data()["message"].length == 0 && docSnap.data()["attachment"].length == 0) {
      await this.deleteMessage(messageId);
      console.log(docSnap.data()["message"].length == 0)
      console.log(docSnap.data()["attachment"].length == 0)
      }
    } 
  }

  async reaction(reaction: string, messageId: string) {
    const uid = this.authenticationService.getCurrentUserUid(); 
    const user = await firstValueFrom(this.authenticationService.currentMember$);
    const docRef = this.referencesServic.getDirektMessageDocRefId(this.directMessageChannelId, messageId);
    const reactionEntry = { uid, name: user?.name };
    const docSnapshot = await getDoc(docRef); 
    const data = docSnapshot.data();
    if (!data || !data["reactions"]) {
      await updateDoc(docRef, { [`reactions.${reaction}`]: arrayUnion(reactionEntry) });
      console.log(`Reaktion '${reaction}' hinzugefügt.`);
      return;
    }
    const currentReactions = data["reactions"][reaction] || [];
    const hasReacted = currentReactions.some((entry: any) => entry.uid === uid);
    await updateDoc(docRef, {
      [`reactions.${reaction}`]: hasReacted
        ? arrayRemove(reactionEntry)
        : arrayUnion(reactionEntry),
    });
  }
}
