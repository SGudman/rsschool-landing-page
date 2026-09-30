function initCatalog(products) {
  const tabs = document.querySelectorAll(".category-tab");
  const grid = document.querySelector(".product-grid");
  const showMoreButton = document.querySelector(".show-more");
  const categories = ["coffee", "tea", "dessert"];
  const mobileCardLimit = 4;
  let activeCategory = categories[0];
  let showAllCards = false;

  if (!grid || !showMoreButton || tabs.length !== categories.length) {
    return;
  }

  function renderCatalog() {
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }

    let categoryProductCount = 0;
    for (let i = 0; i < products.length; i += 1) {
      const product = products[i];
      if (product.category === activeCategory) {
        categoryProductCount += 1;
        const card = document.createElement("article");
        const image = document.createElement("img");
        const content = document.createElement("div");
        const name = document.createElement("h2");
        const description = document.createElement("p");
        const price = document.createElement("p");

        card.classList.add("product-card", "catalog-card-visible");
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        name.textContent = product.name;
        description.textContent = product.description;
        price.textContent = "$" + product.price;
        price.classList.add("price");
        content.classList.add("product-content");
        content.appendChild(name);
        content.appendChild(description);
        content.appendChild(price);

        image.src = product.image;
        image.alt = product.name;
        card.appendChild(image);
        card.appendChild(content);

        if (!showAllCards && window.innerWidth <= 768 && categoryProductCount > mobileCardLimit) {
          card.classList.remove("catalog-card-visible");
          card.classList.add("catalog-card-hidden");
        }

        card.addEventListener("click", function () {
          if (typeof window.openProductModal === "function") {
            window.openProductModal(product);
          }
        });
        card.addEventListener("keydown", function (event) {
          if ((event.key === "Enter" || event.key === " ") && typeof window.openProductModal === "function") {
            event.preventDefault();
            window.openProductModal(product);
          }
        });
        grid.appendChild(card);
      }
    }

    if (window.innerWidth <= 768 && categoryProductCount > mobileCardLimit && !showAllCards) {
      showMoreButton.classList.remove("catalog-control-hidden");
    } else {
      showMoreButton.classList.add("catalog-control-hidden");
    }
  }

  for (let i = 0; i < tabs.length; i += 1) {
    tabs[i].setAttribute("aria-pressed", i === 0 ? "true" : "false");
    tabs[i].addEventListener("click", function () {
      activeCategory = categories[i];
      showAllCards = false;
      for (let j = 0; j < tabs.length; j += 1) {
        tabs[j].classList.remove("category-tab-active");
        tabs[j].setAttribute("aria-pressed", j === i ? "true" : "false");
      }
      tabs[i].classList.add("category-tab-active");
      renderCatalog();
    });
  }

  showMoreButton.addEventListener("click", function () {
    showAllCards = true;
    renderCatalog();
  });

  window.addEventListener("resize", function () {
    showAllCards = false;
    renderCatalog();
  });

  renderCatalog();
}
