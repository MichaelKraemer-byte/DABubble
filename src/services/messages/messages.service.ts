import { Injectable } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, updateDoc } from '@firebase/firestore';
import { MemberService } from '../member/member.service';
import { ChannelService } from '../channel/channel.service';
import { firstValueFrom, Subject } from 'rxjs';
import { ReferencesService } from '../references/references.service';
import { StorageService } from '../storage/storage.service';
import { Channel } from '../../classes/channel.class';
import { MainContentService } from '../main-content/main-content.service';
import { DirectMessageService } from '../directMessage/direct-message.service';
import { Member, Message } from '../../interface/message';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  messages: Message[] = [];
  messagesUpdated = new Subject<void>();
  editMessageText: string = '';
  isWriteAMessage: boolean = false;
  isSearchForMessages: boolean = false;
  searchQuery: string = '';
  // selectedObject?: Member | Channel;
  selectedObjects: Array<{ label: string, type: string, value: Member | Channel }> = [];



  constructor(
    private authenticationService: AuthenticationService,
    private memberService: MemberService,
    private channelService: ChannelService,
    private referencesService: ReferencesService,
    private storageService: StorageService,
    private mainContentService: MainContentService,
    private directMessageService: DirectMessageService
  ) { }


  async readChannel() {
    const channel = await getDoc(this.referencesService.getChannelDocRef());
    if (channel.exists()) {
      await this.loadInitialMessages(this.channelService.currentChannelId);
      this.listenToMessages(this.channelService.currentChannelId);
      this.authenticationService.currentChannelData = channel.data();
      await this.memberService.allMembersInChannel();
    }
    // this.mainContentService.closeNavBar();
  }

  async getCurrentChannelData(){
    const channel = await getDoc(this.referencesService.getChannelDocRef());
    return channel.data();
  }

  async checkWindowAndOpenChannel(channel: Channel) {
    this.isWriteAMessage = false;
    this.mainContentService.hideThread();
    this.directMessageService.isDirectMessage = false;
    this.channelService.currentChannelId = channel.id;
    if (window.innerWidth <= 1285 ) {
      this.mainContentService.openChannelForMobile()
    };
    await this.readChannel();
  }

  async loadInitialMessagesByChannelId(channelId: string) {
    const channelRef = doc(this.authenticationService.getReference(), "channels", channelId);
    const messagesCollection = collection(channelRef, "messages");
    const querySnapshot = await getDocs(messagesCollection);
    this.messages = querySnapshot.docs
      .map(doc => doc.data() as Message) // Typkonvertierung
      .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
    this.messagesUpdated.next();
    return this.messages;
  }
  

  async loadInitialMessages(channelId: string) {
    const querySnapshot = await getDocs(this.referencesService.getCollectionMessage());
    this.messages = querySnapshot.docs
      .map(doc => doc.data() as Message)
      .sort((a, b) => Number(a['timestamp']) - Number(b['timestamp']));
    this.messagesUpdated.next();
  }

  listenToMessages(channelId: string) {
    const unsub = onSnapshot(this.referencesService.getCollectionMessage(), (querySnapshot) => {
      const loadedMessages = querySnapshot.docs
        .map(doc => doc.data() as Message)
        .sort((a, b) => a['timestamp'] - b['timestamp']);
      if (loadedMessages.length > 0) {
        this.messages = loadedMessages;
        this.messagesUpdated.next();
      }
    });
    return unsub;
  }

  async createMessage(message: string) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
    const weekday = formatter.format(now);
    const day = now.getDate(); 
    const month = now.toLocaleString('en-US', { month: 'long' });
    const createdAt = `${weekday}, ${day}. ${month}`;

    const messageData = {
      user: this.authenticationService.getCurrentUserUid(),
      name: this.authenticationService.currentMember.name,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      message: message,
      profileImage: this.authenticationService.currentMember.imageUrl,
      createdAt: createdAt,
      timestamp: Date.now(),
      reactions: {
        like: [],
        rocket: []
      },
      answers: 0,
      lastAnswer: '',
      attachment: this.storageService.messageImages
    };
    const messageDocRef = await addDoc(this.referencesService.getCollectionMessage(), messageData);
    this.updateMessageId(messageDocRef);
    this.messagesUpdated.next();
    this.storageService.messageImages = [];
  }

  async updateMessageId(messageDocRef: any) {
    await updateDoc(messageDocRef, {
      messageId: messageDocRef.id,
    });
  }

  checkUser(message: any): boolean {
    return message.user === this.authenticationService.memberId;
  }

  async deleteMessage(messageId: string) {
    await deleteDoc(this.referencesService.getMessageDocRefId(messageId));
    const querySnapshot = await getDocs(this.referencesService.getCollectionMessage());
    if (querySnapshot.empty) {
      this.messages = [];
      this.messagesUpdated.next();
    }
  }

  async adminUserChannel(id: string) {
    const docSnap = await getDoc(this.referencesService.getMemberDocRef(id));
    if (docSnap.exists()) {
      return docSnap.data()['name'];
    }
  }

  async updateMessage(messageId: string, newMessage: string) {
    await updateDoc(this.referencesService.getMessageDocRefId(messageId), {
      message: newMessage
    });
    await this.checkMessageLength(messageId);
  }

  async deleteImages(attachmentUrl: string, messageId: string) {
    const docRef = this.referencesService.getMessageDocRefId(messageId);
    const docSnap = await getDoc(docRef);
    const attachmentArray = docSnap.data()?.["attachment"];
    const updatedArray = attachmentArray.filter((url: string) => url !== attachmentUrl);
    await updateDoc(docRef, {
      attachment: updatedArray
    });
    await this.checkMessageLength(messageId);
  }

  async checkMessageLength(messageId: string) {
    const docSnap = await getDoc(this.referencesService.getMessageDocRefId(messageId));
    if (docSnap.exists()) {
      if (docSnap.data()["message"].length == 0 && docSnap.data()["attachment"].length == 0) {
        await this.deleteMessage(messageId);
      }
    }
  }

  async reaction(reaction: string, messageId: string) {
    const uid = this.authenticationService.getCurrentUserUid(); // Benutzer-ID
    const user = await firstValueFrom(this.authenticationService.currentMember$); // Benutzerdaten
    const docRef = this.referencesService.getMessageDocRefId(messageId);
    const reactionEntry = { uid, name: user?.name };
    const docSnapshot = await getDoc(docRef); // Dokument abrufen
    const data = docSnapshot.data();
    if (!data || !data["reactions"]) {
      await updateDoc(docRef, { [`reactions.${reaction}`]: arrayUnion(reactionEntry) });
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

  async sendMessageToChannel(channelId: string, messageText: string, currentMember: Member) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
    const weekday = formatter.format(now);
    const day = now.getDate(); 
    const month = now.toLocaleString('en-US', { month: 'long' });
    const createdAt = `${weekday}, ${day} ${month}`;
    // Nachrichtendaten erstellen
    const messageData = {
      user: currentMember.id,
      name: currentMember.name,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      message: messageText,
      profileImage: currentMember.imageUrl,
      createdAt: createdAt,
      timestamp: Date.now(),
      reactions: {
        like: [],
        rocket: []
      },
      answers: 0,
      lastAnswer: '',
      attachment: this.storageService.messageImages
    };
    try {
      // Nachricht in die entsprechende Firestore-Sammlung pushen
      const channelRef = this.referencesService.getChannelDocRefById(channelId); // Hole Channel-Referenz basierend auf der Channel-ID
      const messagesCollection = collection(channelRef, 'messages'); // Nachrichten in der Channel-Nachrichten-Sammlung
      const messageDocRef = await addDoc(messagesCollection, messageData);
      // Message-ID aktualisieren
      await this.updateMessageId(messageDocRef);
      // Nachricht wurde erfolgreich gesendet
      console.log(`Message sent to channel with ID ${channelId}`);
      this.messagesUpdated.next(); // Aktualisiere die Nachrichtenliste
      this.storageService.messageImages = []; // Angehängte Bilder zurücksetzen
    } catch (error) {
      console.error('Error sending message to channel:', error);
    }
  }

  clearSelectedObjects(){
    this.selectedObjects = [];
  }

}
