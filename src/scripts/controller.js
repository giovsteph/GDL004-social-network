import {
    initConfiguration,
    afterLogout,
    setViewSelectors,
    sliderSecctionAction,
    printErrorMsj,
    clearInputField,
    getInputValue,
    setDataInProfileDataScreen,
    profileInfoNext,
    finishAndCollectInputInfo,
    afterLoginConfigurations,
    printPreviewPost,
    profileDataMainSection,
    printUserDataProfile,
    sideMenu,
    toggleDarkMode,
    fileListenerElement,
    setPictureSRC,
    collectMainDataPost
} from "./viewer.js";
import { router } from "./router.js";
import { loginWithProvider, emailRegistration, loginWithEmail, signOut } from "./authentication.js";
import {
    setDataInDB,
    getDocumentData,
    fetchMockData,
    fileUpload,
    addDataInDB,
    getCollectionData,
    getCollectionDataWithCondition
} from "./data.js";


const viewContainer = document.querySelector("#viewContainer");
const defaultView = "/";
let topScreenNavBar;


const scrollFunction = () => {
    if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        mybutton.style.display = 'block';
    } else {
        mybutton.style.display = 'none';
    }
}
let mybutton = document.getElementById('myBtn');
window.onscroll = function() { scrollFunction() };

const topFunction = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

document.getElementById('myBtn').addEventListener('click', topFunction)

const main = () => {
    topScreenNavBar = initConfiguration();

    topScreenNavBar.forEach(button => {
        button.addEventListener("click", () => {
            topScreenNavBar.forEach(element => {
                element.classList.remove("active");
            });
            button.classList.add("active");
            location.hash = button.getAttribute("data-nav");
        });
    });
};

//Listener for loading
window.addEventListener("load", () => {
    location.hash = defaultView;
    handleHashChange(defaultView.slice(2));
    main();
    // handleSessionStatus();
});

window.addEventListener("hashchange", () => {
    handleHashChange(location.hash.slice(2));
});

/***************************************************/
const handleSessionStatus = () => {
    //Verificar si existe sesion
    if (localStorage.getItem("email")) {
        if (localStorage.getItem("isNewUser") == "true") {
            //Abrir view de profileInfo
            console.log("Es nuevo usuario, abrir profile info");
            location.hash = "/profileInfo";
            topScreenNavBar[2].classList.remove("active");

        } else {
            // Abrir view feed
            console.log("No es nuevo usuario, abrir feed");
            //Hacer visible la barra de menu y adaptar tamanio de viewContainer
            afterLoginConfigurations();
            location.hash = "/feed";
        }
    } else {
        //Abrir view signIn
        console.log("Abrir signIn");
        location.hash = "/signIn";
    }
};

/***************************************************/
const handleHashChange = (_route) => {
    viewContainer.innerHTML = "";
    viewContainer.appendChild(router(_route));
    setViewSelectors(_route);

    /***Contenido dinamico******/
    switch (_route) {
        case "profile":
            topScreenNavBar[1].classList.add("active");
            loadProfileUserData();
            loadProfilePost("post");
            break;
        case "profileInfo":
            loadProfileInfoData();
            break;
        case "feed":
            loadFeed("home");
            break;
        case "explore":
            loadFeed("explore");
            break;
        case "newPost":
            pictureNewPost();
            break;
    }
};
/***************************************/
//Eventlistener controller
const eventListenerHandler = (e) => {
    let clickedItem = e.target;
    let dataAction = clickedItem.getAttribute("data-action");
    if (dataAction) { //Validar que es un objeto con accion
        actionsHandler(clickedItem, dataAction);
    }
    e.stopPropagation();
};

viewContainer.addEventListener("click", eventListenerHandler);

const actionsHandler = (_clickedItem, _action) => {
    switch (_action) {
        //signIn Screen
        case "slideSecctionSignUp":
        case "slideSecctionSignIn":
            sliderSecctionAction();
            break;
        case "socialNetworkButton":
            socialNetworkButton(_clickedItem);
            break;
        case "submitForm":
            submitRegistrationForm();
            break;
        case "loginButton":
            submitLoginForm();
            break;
            //Profile info
        case "profileInfoNext":
            profileInfoNext();
            break;
        case "profileInfoSubmit":
            profileInfoSubmit();
            break;
            //Feed screen
        case "favPost":
            favPost(_clickedItem);
            break;
        case "unFavPost":
            unFavPost(_clickedItem);
            break;
        case "openPost":
            //aqui debe ir el modal
            alert("Post: " + _clickedItem.getAttribute("data-postId"));
            break;
        case "deletePost":
            deletePost(_clickedItem);
            break;
        case "newPost":
            newPostCreation();
            break;
            //Profile
        case "openSideMenu":
            sideMenu("open"); //1988
            break;
        case "closeSideMenu":
            sideMenu("close");
            break;
        case "showUserPost":
            loadProfilePost("post");
            break;
        case "showUserFav":
            loadProfilePost("fav");
            break;
        case "editProfile":
            topScreenNavBar[1].classList.remove("active");
            location.hash = "/profileInfo";
            break;
        case "toggleDarkMode":
            toggleDarkMode();
            break;
        case "logoutOption":
            closeSession();
            break;
        default:
    }
};

/****************************************/

/*********Loging con redes sociales***********/
const socialNetworkButton = (element) => {
    if (element.classList.contains("fa-google")) {
        loginWithProvider(1);
    } else if (element.classList.contains("fa-github-alt")) {
        loginWithProvider(2);
    } else {
        loginWithProvider(3);
    }
};

window.addEventListener("redirected", handleSessionStatus);

/********Registro con email ****************/
const submitRegistrationForm = () => {
    printErrorMsj("formErrorMsj", "", true);
    if (userEmail.value != "" && userPassword.value != "" && userPasswordConfirmation.value != "") {
        if (userPassword.value === userPasswordConfirmation.value) {
            //Si paso todas las validaciones
            // emailRegistration(userEmail.value, userPassword.value, userName.value);
            let inputArrayValue = getInputValue(["userEmail", "userPassword"]);
            emailRegistration(inputArrayValue.userEmail, inputArrayValue.userPassword)
                .then(function() {
                    localStorage.setItem("isNewUser", true);
                    handleSessionStatus();
                }).catch(function(error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.error("Error " + errorCode + ": " + errorMessage);
                    //handling errors has to be done like this
                    if (errorCode == "auth/email-already-in-use") {
                        printErrorMsj("formErrorMsj", "The email address is already in use by another account.", false);
                    } else if (errorCode == "auth/invalid-email") {
                        printErrorMsj("formErrorMsj", "Invalid Email Address.", false);
                    } else if (errorCode == "auth/weak-password") {
                        printErrorMsj("formErrorMsj", "Password should be at least 6 characters.", false);
                    } else {
                        alert("Ocurrio un error en la autenticación [Email account creation].");
                    }
                });

            // clearInputField(["userEmail", "userPassword", "userPasswordConfirmation"]);

        } else {
            printErrorMsj("formErrorMsj", "The password confirmation does not match", false);
        }

    } else {
        printErrorMsj("formErrorMsj", "All fields are required", false);

    }
};


/*** Account additional info ***/
const loadProfileInfoData = () => {
    let profileInfo = {}
    if (localStorage.getItem("isNewUser") == "true") {
        profileInfo = {
            email: localStorage.getItem("email"),
            displayName: localStorage.getItem("displayName"),
            userAbout: "null",
            userCountry: "null",
            userBirthday: "null",
            profilePicture: localStorage.getItem("photoURL"),
            topics: "null"
        }
        setDataInProfileDataScreen(profileInfo);
    } else {
        //Llama a la base de datos
        let loggedUser = localStorage.getItem("email");
        getDocumentData("user", loggedUser).then(function(profileData) {
            if (profileData.exists) {
                setDataInProfileDataScreen(profileData.data());
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
    }


    let fileListener = fileListenerElement("profile");
    fileListener.addEventListener("change", element => {
        let file = element.target.files[0];
        console.log(element);
        setProfilePicture("profile", file);
    });
}

const setProfilePicture = (opcion, _file) => {
    console.log("entré a set profile");
    fileUpload(opcion, _file).then(downloadURL => {
        console.log('File available at', downloadURL);
        // localStorage.setItem("photoURL", downloadURL);
        setPictureSRC(opcion, downloadURL);
    });
}

const profileInfoSubmit = () => {
    let profileInfo = finishAndCollectInputInfo();
    console.log(profileInfo);
    setDataInDB("user", profileInfo.email, profileInfo).then(function() {
        console.log("Document successfully written!");
        location.hash = "/profile";
        afterLoginConfigurations();
    });
    // showProfile();
}

/********Login con email ****************/
const submitLoginForm = () => {
    printErrorMsj("loginFormErrorMsj", "", true);
    if (loginFormUserEmail.value != "" && loginFormUserPassword.value != "") {
        //Si paso todas las validaciones
        let inputArrayValue = getInputValue(["loginFormUserEmail", "loginFormUserPassword"]);

        loginWithEmail(inputArrayValue.loginFormUserEmail, inputArrayValue.loginFormUserPassword)
            .then(() => {
                localStorage.setItem("isNewUser", false);
                handleSessionStatus();
            }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.error("Error " + errorCode + ": " + errorMessage);
                if (errorCode == "auth/user-not-found") {
                    printErrorMsj("loginFormErrorMsj", "There is no user record corresponding to this identifier.", false);
                } else if (errorCode == "auth/invalid-email") {
                    printErrorMsj("loginFormErrorMsj", "Invalid Email Address.", false);
                } else if (errorCode == "auth/wrong-password") {
                    printErrorMsj("loginFormErrorMsj", "The password is invalid.", false);
                } else {
                    alert("Ocurrio un error en la autenticación [Email account login].");
                }
            });

        // clearInputField(["loginFormUserEmail", "loginFormUserPassword"]);
    } else {
        printErrorMsj("loginFormErrorMsj", "All fields are required.", false);
    }
}

/************* Feed **************/
const loadFeed = (option) => {
    let collection = [];
    getDocumentData("user", localStorage.getItem("email"))
        .then(function(profileData) {
            let topicsArray = profileData.data().topics;
            if (profileData.exists) {
                getCollectionData("post").then(snapshot => {
                        snapshot.forEach(doc => {
                            collection[doc.id] = doc.data();
                        });
                        let collectionKeys = Object.keys(collection);
                        //Filtrar publicos
                        let collectionPublic = [];
                        let newCollectionKeys = [];
                        collectionKeys.map(element => {
                            if (collection[element].privacy === "true" || collection[element].email === localStorage.getItem("email")) {
                                collectionPublic[element] = collection[element];
                                newCollectionKeys.push(element);

                            }
                        });
                        console.log("newCollectionKeys ", newCollectionKeys);
                        newCollectionKeys.length > 0 ? collectionKeys = newCollectionKeys : collectionKeys;
                        collection = collectionPublic;

                        //Filtrar data por topics
                        if (option === "home") {
                            let postByTopic = {};
                            let flag = false;
                            collectionKeys.map(element => {
                                // console.log("test ", collection[element]);
                                collection[element].topics.forEach(topic => {
                                    if (topicsArray.includes(topic)) {
                                        flag = true;
                                    }
                                });
                                flag === true ? postByTopic[element] = collection[element] : flag = false;
                                flag = false;
                            });
                            collection = postByTopic;
                            console.log("postByTopic: ", collection);
                        }

                        getDocumentData("fav", localStorage.getItem("email"))
                            .then(function(profileData) {
                                if (profileData.exists) {
                                    let favPostArray = profileData.data().post;
                                    printPreviewPost(collection, favPostArray, "feed");
                                } else {
                                    // In case there's not a "fave" collection
                                    printPreviewPost(collection, [], "feed");
                                }
                            }).catch(function(error) {
                                console.log("Error: ", error);
                            });
                        //TODO: Filtrar data por topics

                        getDocumentData("fav", localStorage.getItem("email"))
                            .then(function(profileData) {
                                if (profileData.exists) {
                                    let favPostArray = profileData.data().post;
                                    printPreviewPost(collection, favPostArray, "feed");
                                } else {
                                    // In case there's not a "fave" collection
                                    printPreviewPost(collection, [], "feed");
                                }
                            }).catch(function(error) {
                                console.log("Erorr: ", error);
                            });
                    })
                    .catch(err => {
                        console.log('Error getting documents', err);
                    });
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });
};

/************* Profile **************/
const loadProfileUserData = () => {
    //Cargar data de usuario
    let loggedUser = localStorage.getItem("email");

    getDocumentData("user", loggedUser).then(function(profileData) {
        if (profileData.exists) {
            printUserDataProfile(profileData);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

const loadProfilePost = (option) => {
    //Cargar data de seccion main
    //Evaluar opcion para definir si se necesita post o favs
    let collection = {};
    let favArray = [];
    if (option === "post") {
        getCollectionDataWithCondition("post", "email", localStorage.getItem("email"))
            .then(snapshot => {
                snapshot.forEach(doc => {
                    collection[doc.id] = doc.data();
                });
                getDocumentData("fav", localStorage.getItem("email"))
                    .then(function(profileData) {
                        if (profileData.exists) {
                            let favPostArray = profileData.data().post;
                            profileDataMainSection(collection, favPostArray, "post");
                        } else {
                            // In case there's not a "fave" collection
                            profileDataMainSection(collection, [], "post");
                        }
                    }).catch(function(error) {
                        console.log("Error: ", error);
                    });
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    } else {
        //Get post collection and save it into json "collection"
        getCollectionData("post")
            .then(snapshot => {
                snapshot.forEach(doc => {
                    collection[doc.id] = doc.data();
                });
                //Get fav collection and save it into array "favArray"
                getDocumentData("fav", localStorage.getItem("email"))
                    .then(function(profileData) {
                        if (profileData.exists) {
                            favArray = profileData.data().post;
                            //If fav collection exist
                            //Keys arra
                            let collectionKeys = Object.keys(collection);
                            //Map de collection keys for favArrays elements, save the matches in a new collection favePost
                            let favePost = {};
                            collectionKeys.map(element => {
                                if (favArray.includes(element)) {
                                    favePost[element] = collection[element];
                                }
                            });
                            profileDataMainSection(favePost, favArray, "favs");
                        } else {
                            // In case there's not a "fave" collection
                            profileDataMainSection([], [], "favs");
                        }
                    }).catch(function(error) {
                        console.log("Error fetching fave: ", error);
                    });
            }).catch(function(error) {
                console.error("Error fetching collection: ", error);
            });
    }
};

//Logout
const closeSession = () => {
    signOut()
        .then(function() {
            // Sign-out successful.
            afterLogout();
        }).catch(function(error) {
            // An error happened.
        });
}

/****************************************NEW POST****************************************** */

const pictureNewPost = () => {
    let fileListener = fileListenerElement("post");
    fileListener.addEventListener("change", element => {
        let file = element.target.files[0];
        setProfilePicture("post", file);
    });
}

const newPostCreation = (title, about) => {
    console.log("New Post")
        //it should validate inputs
    if (postTitle.value != "" && postDescription.value != "") {
        //it should be able to add the data to the firestore
        let postMainData = collectMainDataPost();
        addDataInDB("post", postMainData)
            .then(function(docRef) {
                console.log("Document written with ID: ", docRef.id);
                location.hash = "/feed";
            })
            .catch(function(error) {
                console.error("Error adding document: ", error);
            });
    } else {
        printErrorMsj("errorMainPost", "Error", false);
    }
};


/************ Fav post *************/
const favPost = (_clickedItem) => {
    let postID = _clickedItem.getAttribute("data-postId");
    _clickedItem.classList.remove("fa-bookmark-o");
    _clickedItem.classList.add("fa-check");
    _clickedItem.setAttribute("data-action", "unFavPost");
    getDocumentData("fav", localStorage.getItem("email"))
        .then(function(profileData) {
            if (profileData.exists) {
                let data = profileData.data().post;
                console.log("data ", data);
                if (!data.includes(postID)) {
                    data.push(postID);
                }
                console.log("profileData: ", data);
                setDataInDB("fav", localStorage.getItem("email"), { post: data });
            } else {
                // Start document
                setDataInDB("fav", localStorage.getItem("email"), { post: [postID] });
            }
        }).catch(function(error) {
            console.log("Error: ", error);
        });
};

const unFavPost = (_clickedItem) => {
    let postID = _clickedItem.getAttribute("data-postId");
    _clickedItem.classList.remove("fa-check");
    _clickedItem.classList.add("fa-bookmark-o");
    _clickedItem.setAttribute("data-action", "favPost");
    getDocumentData("fav", localStorage.getItem("email"))
        .then(function(profileData) {
            if (profileData.exists) {
                let data = profileData.data().post;
                console.log("data ", data);
                if (data.includes(postID)) {
                    data.splice(data.indexOf(postID), 1);
                }
                console.log("profileData: ", data);
                setDataInDB("fav", localStorage.getItem("email"), { post: data });
            } else {
                // No such document
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error: ", error);
        });
}

/************ Delete post ***************/
const deletePost = (_clickedItem) => {
    let postID = _clickedItem.getAttribute("data-postId");

    if (confirm("Delete for all eternity?\nYou are about to delete the post #" + postID + ".\nAre you sure you want to permanently delete this post?")) {
        getDocumentData("post", postID)
            .then(function(profileData) {
                if (profileData.exists) {
                    let document = profileData.data();
                    console.log("First: ", document);
                    document.deleted = "true";
                    console.log("Second: ", document);
                    //Save new data in db
                    setDataInDB("post", postID, document)
                        .then(function() {
                            //Reload
                            handleHashChange(location.hash.slice(2));
                        }).catch(function(error) {
                            console.log("Error saving document ", error);
                        });
                } else {
                    // No such document
                    console.log("No such document!");
                }
            }).catch(function(error) {
                console.log("No such document! ", error);
            });
    }
};