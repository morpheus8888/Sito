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
  const saveDiary      = document.getElementById("saveDiary");
  const calendar       = document.getElementById("calendar");
  const monthDisplay   = document.getElementById("monthDisplay");
  const prevMonth      = document.getElementById("prevMonth");
  const nextMonth      = document.getElementById("nextMonth");
  const loginForm      = document.getElementById("loginForm");
  const registerForm   = document.getElementById("registerForm");
  const logoutButton   = document.getElementById("logoutButton");
  const loginSection   = document.getElementById("login");
  const diarySection   = document.getElementById("diario");
  const loginEmail     = document.getElementById("loginEmail");
  const loginPassword  = document.getElementById("loginPassword");
  const registerEmail  = document.getElementById("registerEmail");
  const registerPassword = document.getElementById("registerPassword");
  let selectedDate     = new Date();
  let isTyping         = false;
  let entriesCache     = [];

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

  async function loadEntries() {
    const res = await fetch('/api/entries', { credentials: 'same-origin' });
    if (res.status === 401) {
      showLoggedOut();
      return;
    }
    entriesCache = await res.json();
    showLoggedIn();
    renderCalendar();
    displayEntry();
  }

  function showLoggedOut() {
    if (loginSection) loginSection.style.display = 'block';
    if (diarySection) diarySection.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'none';
  }

  function showLoggedIn() {
    if (loginSection) loginSection.style.display = 'none';
    if (diarySection) diarySection.style.display = 'block';
    if (logoutButton) logoutButton.style.display = 'inline-block';
  }

  function displayEntry() {
    const dateStr = selectedDate.toISOString().slice(0,10);
    const entry = entriesCache.find(e => e.date === dateStr);
    diarioTextarea.value = entry ? entry.text : '';
    const today = new Date().toISOString().slice(0,10);
    const editable = dateStr === today;
    diarioTextarea.disabled = !editable;
    saveDiary.disabled = !editable;
  }

  function renderCalendar() {
    if (!calendar) return;
    const current = new Date(selectedDate);
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    calendar.innerHTML = '';
    if (monthDisplay) {
      const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
      monthDisplay.textContent = `${monthNames[month]} ${year}`;
    }
    const weekdays = ['D','L','M','M','G','V','S'];
    weekdays.forEach(w => {
      const div = document.createElement('div');
      div.textContent = w;
      div.className = 'weekday';
      calendar.appendChild(div);
    });
    for (let i=0; i<firstDay.getDay(); i++) {
      calendar.appendChild(document.createElement('div'));
    }
    for (let d=1; d<=daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().slice(0,10);
      const div = document.createElement('div');
      div.textContent = d;
      div.className = 'day';
      if (entriesCache.some(e => e.date === dateStr)) div.classList.add('has-entry');
      if (dateStr === selectedDate.toISOString().slice(0,10)) div.classList.add('selected');
      div.addEventListener('click', () => {
        selectedDate = date;
        displayEntry();
        renderCalendar();
      });
      calendar.appendChild(div);
    }
  }

  renderCalendar();
  displayEntry();

  if (saveDiary) {
    saveDiary.addEventListener('click', async () => {
      await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ date: selectedDate.toISOString().slice(0,10), text: diarioTextarea.value })
      });
      loadEntries();
    });
  }

  if (prevMonth) {
    prevMonth.addEventListener('click', () => {
      selectedDate.setMonth(selectedDate.getMonth() - 1);
      renderCalendar();
      displayEntry();
    });
  }

  if (nextMonth) {
    nextMonth.addEventListener('click', () => {
      selectedDate.setMonth(selectedDate.getMonth() + 1);
      renderCalendar();
      displayEntry();
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: loginEmail.value, password: loginPassword.value })
      });
      loadEntries();
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: registerEmail.value, password: registerPassword.value })
      });
      loadEntries();
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
      showLoggedOut();
    });
  }

  loadEntries();

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