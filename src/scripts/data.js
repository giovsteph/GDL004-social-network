import { mockPosts } from "../data/dataMockPost.js"

//Cloud Firestore
const dataSource = firebase.firestore();
//dataSource.settings ({ timestampsInSnapshots }); //TODO: research this

//Storage
const storage = firebase.storage();

//Recuperar info de cloud firestore
const fetchData = (collection, document) => {
    var docRef = dataSource.collection(collection).doc(document);
    return docRef.get();

}

const fetchMockData = () => {
    return mockPosts;
}

// Crear entrada
const profileCreation = (_profileInfo) => {
    console.log("profileCreation");
    console.log("_profileInfo");
    return dataSource.collection("user").doc(_profileInfo.email).set(_profileInfo);
}

//Alamcenar archivo en storage
const fileUpload = (file) => {
    let storageRef = storage.ref('avatar/' + localStorage.getItem("email") + "_" + file.name);
    let uploadTask = storageRef.put(file);

    // Listen for state changes, errors, and completion of the upload.
   return new Promise((resolve, reject) => {
       uploadTask.on("state_changed", // or 'state_changed'
        function(snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            /*var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
            }*/
        },function(error) {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            console.error(error);
            reject(error);
            switch (error.code) {
            case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;

            case 'storage/canceled':
                // User canceled the upload
                break;

            case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break;
        }
        }, function() {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                resolve(downloadURL);
            });
        });
    });
}

export { profileCreation, fetchData, fetchMockData, fileUpload }