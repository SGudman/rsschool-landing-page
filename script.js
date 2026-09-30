const themeButton = document.querySelector("[data-theme-toggle]");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.documentElement.dataset.theme = "dark";
} else {
  document.documentElement.dataset.theme = "light";
}

function updateThemeButton() {
  const currentTheme = document.documentElement.dataset.theme;
  const themeIcon = themeButton.querySelector("img");

  if (currentTheme === "dark") {
    themeButton.setAttribute("aria-pressed", "true");
    themeButton.setAttribute("aria-label", "Switch to light theme");
    themeIcon.src = "assets/icons/theme-switch-dark.svg";
  } else {
    themeButton.setAttribute("aria-pressed", "false");
    themeButton.setAttribute("aria-label", "Switch to dark theme");
    themeIcon.src = "assets/icons/theme-switch.svg";
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme;
  let nextTheme;

  if (currentTheme === "dark") {
    nextTheme = "light";
  } else {
    nextTheme = "dark";
  }

  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  updateThemeButton();
}

updateThemeButton();
themeButton.addEventListener("click", toggleTheme);

const burgerButton = document.querySelector(".burger-button");
const navigation = document.querySelector(".navigation");
const logoLink = document.querySelector(".logo");

if (burgerButton && navigation) {
  let isNavigationOpen = false;
  let scrollPosition = 0;

  function setNavigationOpen(isOpen) {
    if ((isOpen && window.innerWidth > 768) || isOpen === isNavigationOpen) {
      return;
    }

    isNavigationOpen = isOpen;
    navigation.classList.toggle("navigation-open", isNavigationOpen);
    burgerButton.classList.toggle("burger-button-open", isNavigationOpen);
    burgerButton.setAttribute("aria-expanded", String(isNavigationOpen));
    burgerButton.setAttribute("aria-label", isNavigationOpen ? "Close navigation menu" : "Open navigation menu");
    navigation.setAttribute("aria-hidden", String(!isNavigationOpen && window.innerWidth <= 768));

    if (isNavigationOpen) {
      scrollPosition = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.left = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("navigation-scroll-locked");
      navigation.querySelector("a").focus();
    } else {
      const root = document.documentElement;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollPosition);
      root.classList.remove("navigation-scroll-locked");
    }
  }

  function updateNavigationForScreen() {
    if (window.innerWidth > 768) {
      setNavigationOpen(false);
      navigation.removeAttribute("aria-hidden");
    } else if (!isNavigationOpen) {
      navigation.setAttribute("aria-hidden", "true");
    }
  }

  burgerButton.addEventListener("click", () => {
    setNavigationOpen(!isNavigationOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setNavigationOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!isNavigationOpen) {
      return;
    }

    if (event.key === "Tab") {
      if (event.shiftKey && document.activeElement === logoLink) {
        event.preventDefault();
        burgerButton.focus();
      } else if (!event.shiftKey && document.activeElement === burgerButton) {
        event.preventDefault();
        logoLink.focus();
      }
    }

    if (event.key === "Escape") {
      burgerButton.focus();
      setNavigationOpen(false);
    }
  });

  window.addEventListener("resize", updateNavigationForScreen);
  updateNavigationForScreen();
}

const sliderTrack = document.querySelector(".slider-slides");
const sliderViewport = document.querySelector(".slider-track");
const sliderSlides = sliderTrack ? Array.from(sliderTrack.querySelectorAll(".slide")) : [];
const sliderIndicators = Array.from(document.querySelectorAll(".slider-indicator"));
const previousSlideButton = document.querySelector(".slider-button-previous");
const nextSlideButton = document.querySelector(".slider-button-next");

if (sliderTrack && sliderSlides.length > 1 && previousSlideButton && nextSlideButton) {
  const slideCount = sliderSlides.length;
  const firstSlideClone = sliderSlides[0].cloneNode(true);
  const lastSlideClone = sliderSlides[slideCount - 1].cloneNode(true);

  [firstSlideClone, lastSlideClone].forEach((slideClone) => {
    slideClone.classList.add("slide-clone");
    slideClone.setAttribute("aria-hidden", "true");
    slideClone.setAttribute("inert", "");
  });

  sliderTrack.insertBefore(lastSlideClone, sliderSlides[0]);
  sliderTrack.append(firstSlideClone);

  let currentPosition = 1;
  let isAnimating = false;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setTrackPosition() {
    sliderTrack.style.transform = `translateX(-${currentPosition * 100}%)`;
  }

  function updateSliderState(activeIndex) {
    sliderSlides.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", String(index !== activeIndex));
    });

    sliderIndicators.forEach((indicator, index) => {
      const isActive = index === activeIndex;
      indicator.classList.toggle("slider-indicator-active", isActive);

      if (isActive) {
        indicator.setAttribute("aria-current", "true");
      } else {
        indicator.removeAttribute("aria-current");
      }
    });
  }

  function normalizeClonePosition() {
    if (currentPosition === 0) {
      currentPosition = slideCount;
    } else if (currentPosition === slideCount + 1) {
      currentPosition = 1;
    } else {
      return;
    }

    sliderTrack.style.transition = "none";
    setTrackPosition();
    sliderTrack.getBoundingClientRect();
    sliderTrack.style.removeProperty("transition");
  }

  function finishSlideTransition(event) {
    if (event.target !== sliderTrack || (event.propertyName && event.propertyName !== "transform")) {
      return;
    }

    normalizeClonePosition();
    isAnimating = false;
  }

  function moveSlide(direction) {
    if (isAnimating) {
      return;
    }

    currentPosition += direction;

    if (prefersReducedMotion.matches) {
      normalizeClonePosition();
    }

    const activeIndex = (currentPosition - 1 + slideCount) % slideCount;
    updateSliderState(activeIndex);
    setTrackPosition();
    isAnimating = !prefersReducedMotion.matches;
  }

  sliderTrack.style.transition = "none";
  setTrackPosition();
  sliderTrack.getBoundingClientRect();
  sliderTrack.style.removeProperty("transition");
  updateSliderState(0);

  previousSlideButton.addEventListener("click", () => moveSlide(-1));
  nextSlideButton.addEventListener("click", () => moveSlide(1));
  sliderTrack.addEventListener("transitionend", finishSlideTransition);
  sliderTrack.addEventListener("transitioncancel", finishSlideTransition);

  if (sliderViewport) {
    const mobileSliderQuery = window.matchMedia("(max-width: 600px)");
    const swipeThreshold = 40;
    let touchStart = null;
    let pointerStart = null;

    function isHorizontalSwipe(deltaX, deltaY) {
      return Math.abs(deltaX) >= swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.25;
    }

    sliderViewport.addEventListener("touchstart", (event) => {
      if (!mobileSliderQuery.matches || event.touches.length !== 1) {
        touchStart = null;
        return;
      }

      const touch = event.touches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    sliderViewport.addEventListener("touchend", (event) => {
      if (!touchStart || !mobileSliderQuery.matches || event.changedTouches.length !== 1) {
        touchStart = null;
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      touchStart = null;

      if (!isHorizontalSwipe(deltaX, deltaY)) {
        return;
      }

      moveSlide(deltaX < 0 ? 1 : -1);
    }, { passive: true });

    sliderViewport.addEventListener("touchcancel", () => {
      touchStart = null;
    }, { passive: true });

    sliderViewport.addEventListener("pointerdown", (event) => {
      if (
        !mobileSliderQuery.matches ||
        (event.pointerType !== "mouse" && event.pointerType !== "pen") ||
        !event.isPrimary ||
        event.button !== 0
      ) {
        return;
      }

      pointerStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };

      if (typeof sliderViewport.setPointerCapture === "function") {
        sliderViewport.setPointerCapture(event.pointerId);
      }
    });

    sliderViewport.addEventListener("pointerup", (event) => {
      if (!pointerStart || pointerStart.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - pointerStart.x;
      const deltaY = event.clientY - pointerStart.y;
      pointerStart = null;

      if (!mobileSliderQuery.matches || !isHorizontalSwipe(deltaX, deltaY)) {
        return;
      }

      moveSlide(deltaX < 0 ? 1 : -1);
    });

    sliderViewport.addEventListener("pointercancel", (event) => {
      if (pointerStart && pointerStart.pointerId === event.pointerId) {
        pointerStart = null;
      }
    });
  }
}
