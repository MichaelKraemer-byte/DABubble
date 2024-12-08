import { Injectable } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { deleteObject, getDownloadURL, ref, uploadBytes } from '@firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public messageImages: any = [];
  public messageImagesThread: any = [];

  constructor(private auth: AuthenticationService) { }

  uploadMultipleImages(files: FileList, folderName: string = 'User') {
    Array.from(files).forEach((file, index) => {
      const fileRef = ref(this.auth.storage, `${folderName}/${this.auth.getCurrentUserUid()}/${file.name}`);
      console.log('herllo')
      uploadBytes(fileRef, file).then((snapshot) => {
        console.log(`Datei ${index + 1} hochgeladen: ${file.name}`);
      }).catch(error => {
        console.error(`Fehler beim Hochladen der Datei ${file.name}:`, error);
      });
    });
  }

  async getDownloadURLFromFirebase(file: File, folderName: string = 'User', id: string = '') {
    const fileRef = ref(this.auth.storage, `${folderName}/${id ? id : this.auth.getCurrentUserUid()}/${file.name}`);
    return getDownloadURL(fileRef);
  }

  async uploadImage(file: File, folderName: string = 'User', id: string = ''): Promise<string> {
    const fileRef = ref(this.auth.storage, `${folderName}/${id ? id : this.auth.getCurrentUserUid()}/${file.name}`);

    return uploadBytes(fileRef, file)
      .then(() => {
        console.log('File uploaded:', file);
        // Abrufen der Download-URL nach erfolgreichem Upload
        return getDownloadURL(fileRef);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        throw error; // Weitergeben des Fehlers zur Fehlerbehandlung
      });
  }
  async uploadImageMessage(file: File): Promise<string> {
    const fileRef = ref(this.auth.storage, `messagesImages/${this.auth.getCurrentUserUid()}/${file.name}`);
  
    return uploadBytes(fileRef, file)
      .then(() => getDownloadURL(fileRef))
      .then((url) => {
        console.log('File uploaded and URL retrieved:', url);
        this.messageImages.push(url);
        return url;
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        throw error;
      });
  }
  async uploadImageMessageThread(file: File): Promise<string> {
    const fileRef = ref(this.auth.storage, `messagesImages/${this.auth.getCurrentUserUid()}/${file.name}`);
  
    return uploadBytes(fileRef, file)
      .then(() => getDownloadURL(fileRef))
      .then((url) => {
        console.log('File uploaded and URL retrieved:', url);
        this.messageImagesThread.push(url);
        return url; 
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        throw error;
      });
  }

  uploadImagesMessage(imagesUpload: File[]): Promise<string[]> {
    const uploadPromises = imagesUpload.map(image => {
      const storageRef = this.auth.storage;
      const imagePath = `messagesImages/${this.auth.getCurrentUserUid()}/${image.name}`;
      const imageRef = ref(storageRef, imagePath);

      return uploadBytes(imageRef, image)
        .then(() => getDownloadURL(imageRef))
        .catch(error => {
          console.error(`Fehler beim Hochladen von ${image.name}:`, error);
          throw error;
        });
    });
    return Promise.all(uploadPromises);
  }


  async deleteMessageImages(downloadUrl: string) {
    try {
      const regex = /\/o\/(.*?)\?/;
      const match = downloadUrl.match(regex);
      if (match && match[1]) {
        const encodedPath = match[1];
        const decodedPath = decodeURIComponent(encodedPath);
  
        const storageRef =  this.auth.storage;
        const desertRef = ref(storageRef, decodedPath);
        console.log(desertRef)

        await deleteObject(desertRef);
        console.log('Bild erfolgreich gelöscht.');
      } else {
        console.error('Speicherpfad konnte nicht aus der URL extrahiert werden.');
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Bildes:', error);
    }
  }

}
