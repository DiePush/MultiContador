// src/services/GoogleInit.js
import { gapi } from 'gapi-script';

const CLIENT_ID = '436730530714-sj5puaqunc0fn9clr19phkfkqgaemoip.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDuQ7Bc1Vot6-k6r1EgiWWYlOmOV7XiikY';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const initGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          ],
          scope: SCOPES,
        })
        .then(() => {
          resolve(gapi.auth2.getAuthInstance());
        })
        .catch(reject);
    });
  });
};
