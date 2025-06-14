import { gapi } from 'gapi-script';

const CLIENT_ID = '436730530714-sj5puaqunc0fn9clr19phkfkqgaemoip.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDuQ7Bc1Vot6-k6r1EgiWWYlOmOV7XiikY';

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
export const initGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    function start() {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      }).then(() => {
        resolve(gapi);
      }).catch((error) => {
        console.error('Error en gapi.client.init:', error); // 👈 Aquí
        reject(error);
      });
    }

    try {
      gapi.load('client:auth2', start);
    } catch (e) {
      console.error('Error en gapi.load:', e); // 👈 Aquí
      reject(e);
    }
  });
};

export const signIn = async () => {
  try {
    const authInstance = gapi.auth2.getAuthInstance();
    const user = await authInstance.signIn();
    console.log('Usuario autenticado:', user);
    return user;
  } catch (error) {
    console.error('Error en signIn:', error); // Mostrará el objeto real
    throw error;
  }
};
