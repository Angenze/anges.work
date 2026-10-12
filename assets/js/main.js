/* Ange — anges.work
   Small vanilla script, no build step. It adds:
   - the painting overlay (click an artwork or collab to read more),
   - the contact overlay (any "Contact me" button),
   - "Go Back Up",
   - deep links like /work/#second-artwork that open the overlay directly. */

// Where the contact form sends to. The form opens the visitor's mail app
// with the message filled in, so no server or third-party service is needed.
// CHANGE THIS to the address you want to receive messages at.
const CONTACT_EMAIL = "hello@anges.work";

(function () {
  "use strict";

  // Opened straight from disk (file://): folder links like "work/" would show a
  // folder listing, so point them at the index.html inside. On the live site
  // (http/https) nothing changes and URLs stay clean.
  if (location.protocol === "file:") {
    document.querySelectorAll("a[href]").forEach(function (a) {
      const href = a.getAttribute("href");
      if (/^[a-z]+:/i.test(href) || href.charAt(0) === "#") return;
      const parts = href.split("#");
      if (parts[0] === "" || parts[0].slice(-1) === "/") {
        parts[0] = (parts[0] === "" ? "" : parts[0]) + "index.html";
        a.setAttribute("href", parts.join("#"));
      }
    });
  }

  const supportsDialog = typeof HTMLDialogElement === "function";

  /* ---------- helpers ---------- */

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function wireDialog(dialog) {
    // Close when clicking the dimmed backdrop (outside the box).
    dialog.addEventListener("click", function (e) {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) dialog.close();
    });
    dialog.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () { dialog.close(); });
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  function open(dialog) {
    if (!dialog.open) dialog.showModal();
  }

  if (!supportsDialog) return; // very old browsers: the pages still work, just without overlays

  /* ---------- contact overlay ---------- */

  const contact = wireDialog(el(`
    <dialog class="modal modal--contact" aria-labelledby="contact-title">
      <button class="modal__close" type="button" data-close aria-label="Close">X</button>
      <form class="contact" novalidate>
        <div class="contact__intro">
          <h2 class="entry__title" id="contact-title">Contact me</h2>
          <p class="contact__hint">Please fill out your Information</p>
        </div>
        <input class="contact__field" type="text" name="name" placeholder="Name..." aria-label="Name" autocomplete="name" required>
        <input class="contact__field" type="email" name="email" placeholder="E-mail..." aria-label="E-mail" autocomplete="email" required>
        <label class="contact__label" for="contact-message">Your Message:</label>
        <textarea class="contact__field" id="contact-message" name="message" required></textarea>
        <button class="btn btn--primary" type="submit">Send</button>
        <p class="contact__status" role="status"></p>
      </form>
    </dialog>`));

  const form = contact.querySelector("form");
  const status = contact.querySelector(".contact__status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    const firstInvalid = Array.from(form.elements).find(function (f) { return f.willValidate && !f.checkValidity(); });
    if (firstInvalid || !name || !message) {
      status.textContent = "Please fill out your name, a valid e-mail and a message.";
      (firstInvalid || form.elements.name).focus();
      return;
    }

    const subject = "Message from " + name + " via anges.work";
    const body = message + "\n\n— " + name + " (" + email + ")";
    window.location.href = "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
    status.textContent = "Your mail app should open with the message ready to send.";
  });

  contact.addEventListener("close", function () { status.textContent = ""; });

  /* ---------- painting overlay ---------- */

  const painting = wireDialog(el(`
    <dialog class="modal modal--painting" aria-labelledby="painting-title">
      <button class="modal__close" type="button" data-close aria-label="Close">X</button>
      <figure class="painting__media"><img alt=""></figure>
      <div class="painting__heading">
        <h2 class="entry__title" id="painting-title"></h2>
        <p class="entry__date"></p>
      </div>
      <div class="painting__body entry__body"></div>
      <div class="painting__actions">
        <button class="btn btn--secondary" type="button" data-open-contact>Contact me</button>
      </div>
    </dialog>`));

  function showEntry(entry, updateHash) {
    const img = entry.querySelector(".entry__img");
    const pImg = painting.querySelector(".painting__media img");
    pImg.src = img.currentSrc || img.src;
    pImg.alt = img.alt;
    pImg.style.aspectRatio = getComputedStyle(img).aspectRatio;
    pImg.style.objectFit = "cover";
    pImg.style.objectPosition = getComputedStyle(img).objectPosition;

    painting.querySelector(".entry__title").textContent = entry.querySelector(".entry__title").textContent.trim();
    const date = entry.querySelector(".entry__date");
    const pDate = painting.querySelector(".entry__date");
    pDate.innerHTML = date ? date.innerHTML : "";
    pDate.hidden = !date;

    // Longer text from <template class="entry__detail"> if there is one, otherwise the normal text.
    const detail = entry.querySelector("template.entry__detail");
    const body = painting.querySelector(".painting__body");
    body.replaceChildren(detail ? detail.content.cloneNode(true) : entry.querySelector(".entry__body").cloneNode(true));

    if (updateHash && entry.id) history.replaceState(null, "", "#" + entry.id);
    open(painting);
    painting.scrollTop = 0;
  }

  painting.addEventListener("close", function () {
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  });

  document.querySelectorAll(".entry[data-overlay]").forEach(function (entry) {
    entry.querySelectorAll("[data-open-entry]").forEach(function (trigger) {
      trigger.addEventListener("click", function () { showEntry(entry, true); });
    });
  });

  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const entry = document.getElementById(id);
    if (entry && entry.matches(".entry[data-overlay]")) showEntry(entry, false);
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);

  /* ---------- buttons ---------- */

  document.addEventListener("click", function (e) {
    const contactBtn = e.target.closest("[data-open-contact]");
    if (contactBtn) {
      if (painting.open) painting.close();
      open(contact);
      return;
    }
    if (e.target.closest("[data-scroll-top]")) {
      window.scrollTo({ top: 0 });
      const first = document.querySelector(".nav__link");
      if (first) first.focus({ preventScroll: true });
    }
  });
})();
