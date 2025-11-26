import {
  settings,
  disableButton,
  enableValidation,
  resetValidation,
} from "../scripts/validation.js";

import "./index.css";

import logoSrc from "../images/logo.svg";
import pencilIconSrc from "../images/pencil-icon.svg";
import plusSignSrc from "../images/plus-sign.svg";
import avatarIconSrc from "../images/edit_avatar_btn.svg";

import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "1aebe21f-db39-4dc3-a820-84c04ff4cc04",
    "Content-Type": "application/json",
  },
});

document.querySelector(".header__logo").src = logoSrc;
document.querySelector(".profile__pencil-icon").src = pencilIconSrc;
document.querySelector(".profile__avatar-icon").src = avatarIconSrc;
document.querySelector(".profile__plus-icon").src = plusSignSrc;

const editProfileBtn = document.querySelector(".profile__edit-btn");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const newPostBtn = document.querySelector(".profile__add-btn");
const avatarSrc = document.querySelector(".profile__avatar");

const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = newPostModal.querySelector(".modal__form");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newPostImageInput = newPostModal.querySelector("#post-image-input");
const newPostCaptionInput = newPostModal.querySelector("#post-caption-input");
const newPostButtonElement = newPostModal.querySelector(".modal__submit-btn");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(
  ".modal__preview-close-btn"
);
const previewModalImage = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector("#delete-form");
const deleteModalCloseBtn = deleteModal.querySelector(
  ".modal__delete-close-btn"
);
const deleteModalCancelBtn = deleteModal.querySelector(
  ".modal__btn_type_cancel"
);

const editAvatarBtn = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#avatar-modal");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarModalForm = avatarModal.querySelector(".modal__form");
const avatarInput = avatarModal.querySelector("#avatar-image-input");

let selectedCard;
let selectedCardId;

api
  .getAppInfo()
  .then(([cards, user]) => {
    cards.forEach(function (item) {
      const newCardElement = getCardElement(item);

      cardsList.append(newCardElement);
    });
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    avatarSrc.src = user.avatar;
  })
  .catch(console.error);

function handleProfileFormSubmit(evt) {
  evt.preventDefault();

  evt.submitter.textContent = "Saving...";

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      evt.submitter.textContent = "Save";
    });
}

function handleNewPostSubmit(evt) {
  evt.preventDefault();

  evt.submitter.textContent = "Saving...";

  api
    .addNewCard({
      name: newPostCaptionInput.value,
      link: newPostImageInput.value,
    })
    .then((data) => {
      const newCardElement = getCardElement(data);
      cardsList.prepend(newCardElement);
      disableButton(newPostButtonElement, settings);
      closeModal(newPostModal);
      evt.target.reset();
    })
    .catch(console.error)
    .finally(() => {
      evt.submitter.textContent = "Save";
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  evt.submitter.textContent = "Saving...";

  api
    .updateAvatar({ avatar: avatarInput.value })
    .then((data) => {
      avatarSrc.src = data.avatar;
      closeModal(avatarModal);
      evt.target.reset();
    })
    .catch(console.error)
    .finally(() => {
      evt.submitter.textContent = "Save";
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();

  evt.submitter.textContent = "Deleting...";

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      evt.submitter.textContent = "Delete";
    });
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;

  openModal(deleteModal);
}

function handleLike(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-button_active");
  api
    .toggleLikeStatus(id, isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-button_active");
    })
    .catch(console.error);
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const cardLikeBtn = cardElement.querySelector(".card__like-button");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-button");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-button_active");
  }

  cardLikeBtn.addEventListener("click", (evt) => {
    handleLike(evt, data._id);
  });

  cardDeleteBtn.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id);
    openModal(deleteModal);
  });

  cardImage.addEventListener("click", () => {
    previewModalCaption.textContent = data.name;
    previewModalImage.src = data.link;
    previewModalImage.alt = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function handleEscapeKey(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscapeKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.activeElement.blur();
  document.removeEventListener("keydown", handleEscapeKey);
}

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(editProfileForm, settings);
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", function () {
  resetValidation(editProfileForm, settings);
  closeModal(editProfileModal);
});

newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

deleteModalCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteModalCancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

editAvatarBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

editProfileForm.addEventListener("submit", handleProfileFormSubmit);

newPostForm.addEventListener("submit", handleNewPostSubmit);

avatarModalForm.addEventListener("submit", handleAvatarSubmit);

deleteForm.addEventListener("submit", handleDeleteSubmit);

document.addEventListener("mousedown", (evt) => {
  if (evt.target.classList.contains("modal_is-opened")) {
    closeModal(evt.target);
  }
});

enableValidation(settings);
