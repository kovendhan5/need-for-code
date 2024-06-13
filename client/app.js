const CLIENT_ID = '';
const API_KEY = '';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  }, function(error) {
    console.log(JSON.stringify(error, null, 2));
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    // User is signed in, now you can make API calls.
  } else {
    // User is not signed in, start the sign-in process.
    gapi.auth2.getAuthInstance().signIn();
  }
}

function uploadFile(event) {
    const file = event.target.files[0];
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify({
      'name': file.name,
      'mimeType': file.type
    })], { type: 'application/json' }));
    form.append('file', file);
  
    gapi.client.request({
      'path': '/upload/drive/v3/files',
      'method': 'POST',
      'params': { 'uploadType': 'multipart' },
      'headers': {
        'Content-Type': 'multipart/related'
      },
      'body': form
    }).then(function(response) {
      console.log(response);
      // Call function to display the file.
    });
  }
  
  function listFiles() {
    gapi.client.drive.files.list({
      'pageSize': 10,
      'fields': "nextPageToken, files(id, name)"
    }).then(function(response) {
      const files = response.result.files;
      if (files && files.length > 0) {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';
        files.forEach(function(file) {
          const li = document.createElement('li');
          li.textContent = file.name;
          fileList.appendChild(li);
        });
      }
    });
  }
  
  function createFileElement(fileId, fileName) {
    const fileList = document.getElementById('fileList');
    const fileElement = document.createElement('li');
    const fileLink = document.createElement('a');
    fileLink.textContent = fileName;
    fileLink.href = `https://drive.google.com/uc?id=${fileId}&export=download`;
    fileLink.target = '_blank';
  
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function() { deleteFile(fileId); };
  
    fileElement.appendChild(fileLink);
    fileElement.appendChild(deleteButton);
    fileList.appendChild(fileElement);
  }
  
  function deleteFile(fileId) {
    gapi.client.drive.files.delete({
      'fileId': fileId
    }).then(function(response) {
      console.log(response);
      // Remove the file element from the list
    });
  }
  