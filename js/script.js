document.addEventListener("DOMContentLoaded", function() {

  const fadeInElements = document.querySelectorAll(".fade-in");
  const sections       = document.querySelectorAll(".section");
  const header         = document.querySelector("header");
  const nav            = document.querySelector("nav");
  const toggleButton   = document.querySelector(".toggle-button");

  // Bolla => typed text
  const loaderDots     = document.getElementById("loaderDots");
  const typedText      = document.getElementById("typedtext");
  const diarioTextarea = document.getElementById("diarioTextarea");
  let isTyping         = false;

  if (diarioTextarea) {
    diarioTextarea.value = localStorage.getItem("diarioTesto") || "";
    diarioTextarea.addEventListener("input", function() {
      localStorage.setItem("diarioTesto", this.value);
    });
  }

  // Testo da scrivere con l'effetto typewriter
  var aText = [
    "Numero di telefono: 123456789",
    "Email: contatto@example.com",
    "Puoi scrivermi in qualsiasi momento!"
  ];
  var iSpeed = 100; 
  var iIndex = 0;   
  var iArrLength = aText[0].length; 
  var iScrollAt  = 20; 
  var iTextPos   = 0;  
  var sContents  = '';
  var iRow;

  // TYPEWRITER
  function typewriter() {
    sContents = ' ';
    iRow = Math.max(0, iIndex - iScrollAt);
    const destination = typedText;

    while (iRow < iIndex) {
      sContents += aText[iRow++] + '<br />';
    }
    destination.innerHTML = sContents + aText[iIndex].substring(0, iTextPos) + "_";

    if (iTextPos++ == iArrLength) {
      iTextPos = 0;
      iIndex++;
      if (iIndex != aText.length) {
        iArrLength = aText[iIndex].length;
        setTimeout(typewriter, 500);
      } else {
        // Fine => rimuoviamo il cursore e nascondiamo i pallini
        setTimeout(() => {
          destination.innerHTML = sContents + aText[iIndex-1];
        }, 300);
        loaderDots.style.display = "none";
      }
    } else {
      setTimeout(typewriter, iSpeed);
    }
  }
  function startTyping() {
    if (!isTyping) {
      isTyping = true;
      loaderDots.style.display = "block";
      typewriter();
    }
  }

  // Reset -> menu top
  function resetSidebar() {
    header.classList.add("menu-top");
    header.classList.remove("menu-sidebar", "collapsed");
    nav.classList.remove("nav-sidebar");
    toggleButton.style.display = "none";
    header.style.transform = "translateY(0)";
  }

  // Gestione fadeIn + sidebar
  function checkVisibility() {
    const windowHeight = window.innerHeight;
    const scrollY      = window.scrollY;

    // fadeIn su .fade-in
    fadeInElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const startFade = windowHeight * 0.85;
      const endFade   = windowHeight;
      if (rect.top < endFade && rect.top > startFade) {
        const opacity    = (endFade - rect.top)/(endFade - startFade);
        const translateY = (1 - opacity)*150;
        el.style.opacity   = opacity;
        el.style.transform = `translateY(${translateY}px)`;
      }
      else if (rect.top <= startFade) {
        el.style.opacity   = 1;
        el.style.transform = 'translateY(0)';
      } 
      else {
        el.style.opacity   = 0;
        el.style.transform = 'translateY(150px)';
      }
    });

    // .visible sulle sezioni => avvia typewriter se contatti
    sections.forEach(section => {
      const rectTop = section.getBoundingClientRect().top;
      const rectBot = section.getBoundingClientRect().bottom;
      if (rectTop < windowHeight - 50 && rectBot > 50) {
        section.classList.add("visible");
        if (section.id === "contatti") {
          startTyping();
        }
      } else {
        section.classList.remove("visible");
      }
    });

    // Desktop => sidebar se scroll>100
    if (window.innerWidth > 768) {
      if (scrollY > 100) {
        header.classList.add("menu-sidebar");
        header.classList.remove("menu-top");
        nav.classList.add("nav-sidebar");
        toggleButton.style.display = "inline-block";
      } else {
        resetSidebar();
      }
    } else {
      // Mobile => hamburger hidden
      header.classList.remove("collapsed");
      toggleButton.style.display = "none";
      if (scrollY > 50) {
        header.style.transform = "translateY(-100%)";
      } else {
        header.style.transform = "translateY(0)";
      }
    }
  }

  // CLICK SU LINK => scorrimento verso la sezione corrispondente
document.querySelectorAll("nav ul li a").forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault(); // Evita il comportamento predefinito

    const targetId = this.getAttribute("href").replace("#", "");
    const targetEl = document.querySelector(`section#${targetId}`); // <-- CERCA SOLO LE SEZIONI



    if (targetEl) {
      
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      
    }
  });
});


  // event scroll + resize
  window.addEventListener("scroll", checkVisibility);
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) {
      resetSidebar();
    }
    checkVisibility();
  });

  // hamburger -> toggle collapsed
  toggleButton.addEventListener("click", function() {
    header.classList.toggle("collapsed");
  });

  // Avvio
  checkVisibility();
});