import { Injectable } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { addDoc, arrayRemove, arrayUnion, deleteDoc, getDoc, getDocs, increment, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { firstValueFrom, Subject } from 'rxjs';
import { ReferencesService } from '../references/references.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  threadMessages: any = [];
  threadFirstMessage: any = {};
  threadUpdated = new Subject<void>();
  threadFirstMessageUpdated = new Subject<void>();
  currentMessageId: string = '';

  constructor(
    private authenticationService: AuthenticationService,
    private referencesServic: ReferencesService,
    private storageService: StorageService,) { }

  async createThread(message: string) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
    const weekday = formatter.format(now);
    const day = now.getDate(); 
    const month = now.toLocaleString('en-US', { month: 'long' });
    const createdAt = `${weekday}, ${day} ${month}`;

    const threadData = {
      user: this.authenticationService.getCurrentUserUid(),
      name: this.authenticationService.currentMember.name,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      message: message,
      profileImage: this.authenticationService.currentMember.imageUrl,
      createdAt: createdAt,
      reactions: {
        like: [],
        rocket: []
      },
      attachment: this.storageService.messageImagesThread,
      timestamp: Date.now(),
    };
    const threadDocRef = await addDoc(this.referencesServic.getCollectionThread(this.currentMessageId), threadData);
    await this.updateThredId(threadDocRef);
    await this.updateMessageAnswer();
    this.storageService.messageImagesThread = [];
  }

  async updateThredId(threadDocRef: any) {
    await updateDoc(threadDocRef, {
      threadId: threadDocRef.id
    });
  }

  async updateMessageAnswer() {
    const now = new Date();
    await updateDoc(this.referencesServic.getMessageDocRefId(this.currentMessageId), {
      answers: increment(1),
      lastAnswer: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    });
  }

  async readThread(messageId: string) {
    this.threadMessages = [];
    onSnapshot(this.referencesServic.getCollectionThread(messageId), (querySnapshot) => {
      const threadsData = querySnapshot.docs
        .map(doc => doc.data())
        .sort((a, b) => Number(a['timestamp']) - Number(b['timestamp']));
      this.threadMessages = threadsData;
      this.threadUpdated.next();
    });
  }

  async readMessageThread(messageId: string) {
    this.threadFirstMessage = {};
    onSnapshot(this.referencesServic.getMessageDocRefId(messageId), (docSnap) => {
      if (docSnap.exists()) {
        this.threadFirstMessage = docSnap.data();
        this.threadFirstMessageUpdated.next();
      }
    });
  }

  async deleteMessageThread(messageId: string) {
    await deleteDoc(this.referencesServic.getThreadDocRef(this.currentMessageId, messageId));
    const querySnapshot = await getDocs(this.referencesServic.getCollectionThread(this.currentMessageId));
    if (querySnapshot.empty) {
      this.threadMessages = [];
      this.threadUpdated.next();
    }
    await updateDoc(this.referencesServic.getMessageDocRefId(this.currentMessageId), {
      answers: increment(-1)
    });
  }

  async updateThreadMessage(newMessage: string, threadId: string) {
    await updateDoc(this.referencesServic.getThreadDocRef(this.currentMessageId, threadId), {
      message: newMessage
    });
    await this.checkMessageLength(threadId);
  }

  async deleteImages(attachmentUrl: string, messageId: string) {
    const docRef = this.referencesServic.getThreadDocRef(this.currentMessageId, messageId);
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
    const docSnap = await getDoc(this.referencesServic.getThreadDocRef(this.currentMessageId, messageId));
    if (docSnap.exists()) {
      if (docSnap.data()["message"].length == 0 && docSnap.data()["attachment"].length == 0) {
        await this.deleteMessageThread(messageId);
      }
    }
  }

  async reaction(reaction: string, messageId: string) {
    const uid = this.authenticationService.getCurrentUserUid();
    const user = await firstValueFrom(this.authenticationService.currentMember$);
    const docRef = this.referencesServic.getThreadDocRef(this.currentMessageId, messageId);
    const reactionEntry = { uid, name: user?.name };
    const docSnapshot = await getDoc(docRef); // Dokument abrufen
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
