let productModal = null;
let previousBodyStyles = null;
let previousScrollPosition = 0;
let previousFocusedElement = null;

function updateProductModalPrice(product, sizeKey, additiveButtons, priceElement) {
  let priceInCents = Math.round(parseFloat(product.price) * 100);
  priceInCents += Math.round(parseFloat(product.sizes[sizeKey]["add-price"]) * 100);

  for (let i = 0; i < additiveButtons.length; i += 1) {
    if (additiveButtons[i].selected) {
      priceInCents += Math.round(parseFloat(additiveButtons[i].price) * 100);
    }
  }

  const dollars = Math.floor(priceInCents / 100);
  const cents = priceInCents % 100;
  let centsText = cents;

  if (cents < 10) {
    centsText = "0" + cents;
  }

  priceElement.textContent = "$" + dollars + "." + centsText;
}

function closeProductModal() {
  if (productModal) {
    document.removeEventListener("keydown", handleProductModalKeydown);
    productModal.remove();
    productModal = null;

    document.body.style.position = previousBodyStyles.position;
    document.body.style.top = previousBodyStyles.top;
    document.body.style.left = previousBodyStyles.left;
    document.body.style.width = previousBodyStyles.width;
    document.body.style.overflow = previousBodyStyles.overflow;
    window.scrollTo(0, previousScrollPosition);

    if (previousFocusedElement && document.body.contains(previousFocusedElement)) {
      previousFocusedElement.focus();
    } else {
      document.body.focus();
    }

    previousBodyStyles = null;
    previousFocusedElement = null;
  }
}

function handleProductModalKeydown(event) {
  if (event.key === "Escape") {
    closeProductModal();
    return;
  }

  if (event.key === "Tab" && productModal) {
    const modalButtons = productModal.querySelectorAll("button");
    const firstButton = modalButtons[0];
    const lastButton = modalButtons[modalButtons.length - 1];
    const focusIsOutsideModal = !productModal.contains(document.activeElement);

    if (event.shiftKey && (document.activeElement === firstButton || focusIsOutsideModal)) {
      event.preventDefault();
      lastButton.focus();
    } else if (!event.shiftKey && (document.activeElement === lastButton || focusIsOutsideModal)) {
      event.preventDefault();
      firstButton.focus();
    }
  }
}

function openProductModal(product, imagePath) {
  if (productModal) {
    document.removeEventListener("keydown", handleProductModalKeydown);
    productModal.remove();
    productModal = null;
  } else {
    previousScrollPosition = window.scrollY;
    previousFocusedElement = document.activeElement;
    previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      width: document.body.style.width,
      overflow: document.body.style.overflow
    };

    document.body.style.position = "fixed";
    document.body.style.top = "-" + previousScrollPosition + "px";
    document.body.style.left = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  }

  productModal = document.createElement("div");
  productModal.className = "product-modal-backdrop";
  productModal.setAttribute("data-product-modal", "");

  const dialog = document.createElement("section");
  dialog.className = "product-modal";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  const title = document.createElement("h2");
  title.className = "product-modal__title";
  title.textContent = product.name;
  title.id = "product-modal-title";
  dialog.setAttribute("aria-labelledby", title.id);

  const image = document.createElement("img");
  image.className = "product-modal__image";
  image.src = imagePath;
  image.alt = product.name;

  const content = document.createElement("div");
  content.className = "product-modal__content";

  const closeButton = document.createElement("button");
  closeButton.className = "product-modal__close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close product details");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", closeProductModal);

  const description = document.createElement("p");
  description.className = "product-modal__description";
  description.textContent = product.description;

  const sizeHeading = document.createElement("h3");
  sizeHeading.className = "product-modal__section-title";
  sizeHeading.textContent = "Size";

  const sizeOptions = document.createElement("div");
  sizeOptions.className = "product-modal__options";
  sizeOptions.setAttribute("aria-label", "Size");

  let selectedSizeKey = "";
  for (const sizeKey in product.sizes) {
    if (selectedSizeKey === "") {
      selectedSizeKey = sizeKey;
    }
  }

  const sizeButtons = [];
  for (const sizeKey in product.sizes) {
    const size = product.sizes[sizeKey];
    const button = document.createElement("button");
    button.className = "product-modal__option";
    button.type = "button";
    button.textContent = sizeKey.toUpperCase() + " · " + size.size;
    button.setAttribute("aria-pressed", sizeKey === selectedSizeKey ? "true" : "false");

    if (sizeKey === selectedSizeKey) {
      button.classList.add("is-selected");
    }

    button.addEventListener("click", function () {
      selectedSizeKey = sizeKey;

      for (let i = 0; i < sizeButtons.length; i += 1) {
        sizeButtons[i].classList.remove("is-selected");
        sizeButtons[i].setAttribute("aria-pressed", "false");
      }

      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
      updateProductModalPrice(product, selectedSizeKey, additiveButtons, price);
    });

    sizeButtons.push(button);
    sizeOptions.appendChild(button);
  }

  const additivesHeading = document.createElement("h3");
  additivesHeading.className = "product-modal__section-title";
  additivesHeading.textContent = "Additives";

  const additiveOptions = document.createElement("div");
  additiveOptions.className = "product-modal__options";
  additiveOptions.setAttribute("aria-label", "Additives");

  const additiveButtons = [];
  for (let i = 0; i < product.additives.length; i += 1) {
    const additive = product.additives[i];
    const button = document.createElement("button");
    button.className = "product-modal__option";
    button.type = "button";
    button.textContent = additive.name;
    button.setAttribute("aria-pressed", "false");

    const additiveChoice = {
      button: button,
      price: additive["add-price"],
      selected: false
    };

    button.addEventListener("click", function () {
      additiveChoice.selected = !additiveChoice.selected;

      if (additiveChoice.selected) {
        button.classList.add("is-selected");
        button.setAttribute("aria-pressed", "true");
      } else {
        button.classList.remove("is-selected");
        button.setAttribute("aria-pressed", "false");
      }
      updateProductModalPrice(product, selectedSizeKey, additiveButtons, price);
    });

    additiveButtons.push(additiveChoice);
    additiveOptions.appendChild(button);
  }

  const priceRow = document.createElement("p");
  priceRow.className = "product-modal__price-row";
  priceRow.textContent = "Total: ";

  const price = document.createElement("span");
  price.className = "product-modal__price";
  priceRow.appendChild(price);

  content.appendChild(closeButton);
  content.appendChild(title);
  content.appendChild(description);
  content.appendChild(sizeHeading);
  content.appendChild(sizeOptions);
  content.appendChild(additivesHeading);
  content.appendChild(additiveOptions);
  content.appendChild(priceRow);

  dialog.appendChild(image);
  dialog.appendChild(content);
  productModal.appendChild(dialog);
  productModal.addEventListener("click", function (event) {
    if (event.target === productModal) {
      closeProductModal();
    }
  });

  document.body.appendChild(productModal);
  closeButton.focus();
  document.addEventListener("keydown", handleProductModalKeydown);
  updateProductModalPrice(product, selectedSizeKey, additiveButtons, price);
}
