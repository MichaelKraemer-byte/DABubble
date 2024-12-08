import { Injectable } from '@angular/core';
import { collection, doc, getDocs, setDoc } from '@angular/fire/firestore';
import { Router, } from '@angular/router';
import { createUserWithEmailAndPassword, GoogleAuthProvider,} from '@angular/fire/auth';
import { AuthenticationService} from '../authentication/authentication.service';
import { StorageService } from '../storage/storage.service';


@Injectable({
  providedIn: 'root'
})
export class SignUpService {

  constructor(private auth: AuthenticationService, private storage: StorageService, private router: Router ) { 
  }
  googleProvider = new GoogleAuthProvider();
  image?:File;
  userId:string = '';
  userEmail:string = '';
  password:string = '';
  fullName:String = '';
  isGoogleAcc:boolean = false;

/// registration of User
async getProfilPictureUrl(userId:string='', imageFile:File){
  await this.storage.uploadImage(this.image as File, 'User', userId);
  return await this.storage.getDownloadURLFromFirebase(imageFile, 'User', userId)
 }

 async createUserCollection(userId:string, imageFile:File) {
  await setDoc(doc(this.auth.getReference(), "member", userId), {
    id: userId,
    name: this.fullName,
    email: this.userEmail,
    imageUrl: await this.getProfilPictureUrl(userId, imageFile),
    status: true,
    channelIds: [],
  });
}

 async setProfilForMember(userid:string){
  await this.createUserCollection(userid, this.image as File);
 }

  async signUpUser() {
    if(!this.isGoogleAcc){ 
      createUserWithEmailAndPassword(this.auth.auth, this.userEmail, this.password)
      .then((userCredential) => {
        this.setProfilForMember(userCredential.user.uid);
      })
      .catch((error) => {
      });} else{
        this.setProfilForMember(this.auth.getCurrentUserId()!);
        this.router.navigate(['start']);
      }
      this.isGoogleAcc = false
  }

   /// Email Validation
   async pullAllEmails(){
    const membersCollection = collection(this.auth.getReference(), 'member');
    let allEmails:string[] = [];
    await getDocs(membersCollection)
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData['email']) {
          allEmails.push(userData['email']);
        }
      });
    })
    .catch((error) => {
      console.error('Error fetching documents:', error);
    });
    return(allEmails)
  }

  async checkIsEmailAlreadyExists(email:string = ''): Promise<boolean>{
    let collection:string [] = await this.pullAllEmails();
    return collection.includes(email);
  }
}
