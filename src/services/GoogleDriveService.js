export async function uploadExcelToDrive(file, accessToken) {
  const metadata = {
    name: file.name || 'multicontadores.xlsx',
    mimeType: 'application/vnd.google-apps.spreadsheet', // Esto lo convierte en archivo editable tipo Sheets
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  try {
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
      body: form,
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Archivo subido con éxito:', data);
      return data;
    } else {
      console.error('Error al subir archivo:', data);
      throw new Error(data.error?.message || 'Fallo al subir el archivo');
    }
  } catch (error) {
    console.error('Excepción al subir a Drive:', error);
    throw error;
  }
}
