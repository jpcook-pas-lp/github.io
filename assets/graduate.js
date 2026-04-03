(function () {
  const app = document.getElementById("app");

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function money(n) {
    return Number(n).toFixed(2);
  }

  function renderNotFound(details) {
    app.innerHTML = `
      <h1>We couldn’t load this page</h1>
      <p class="muted">
        This usually means the config file is missing or invalid.
      </p>
      ${details ? `<div class="error"><strong>Details:</strong> ${escapeHtml(details)}</div>` : ""}
      <div style="margin-top:16px;">
        <a class="btnSecondary" href="/">Back to homepage</a>
      </div>
    `;
    document.title = "Not found";
  }

  function buildPaymentLinks(cfg, amount, noteEncoded) {
    const links = [];
    const venmoUser = (cfg.payments?.venmoUsername || "").trim();
    const paypalMe = (cfg.payments?.paypalMe || "").trim();

    if (venmoUser) {
      links.push({
        label: `Venmo $${amount}`,
        href: `https://venmo.com/${encodeURIComponent(
          venmoUser
        )}?txn=pay&amount=${encodeURIComponent(
          money(amount)
        )}&note=${noteEncoded}`
      });
    }

    if (paypalMe) {
      links.push({
        label: `PayPal $${amount}`,
        href: `https://www.paypal.me/${encodeURIComponent(
          paypalMe
        )}/${encodeURIComponent(money(amount))}`
      });
    }

    return links;
  }

  function render(cfg) {
    const grad = cfg.graduate || {};
    const party = cfg.party || {};
    const payments = cfg.payments || {};
    const rsvp = cfg.rsvp || {};

    const name = grad.name || "Graduate";
    const headline = grad.headline || "";
    const school = grad.school || "";
    const year = grad.year || "";
    const about = grad.about || "";
    const about2= grad.about2 || "";

    const photos = Array.isArray(cfg.photos) ? cfg.photos.slice(0, 3) : [];

    const note = payments.defaultNote || `Congrats ${name}!`;
    const noteEncoded = encodeURIComponent(note);

    const suggestedAmounts = [25, 50, 100]
      .map((amt) => buildPaymentLinks(cfg, amt, noteEncoded))
      .flat();

    const venmoUser = (payments.venmoUsername || "").trim();
    const paypalMe = (payments.paypalMe || "").trim();

    const otherLinks = [];
    if (venmoUser) {
      otherLinks.push({
        label: "Venmo other amount",
        href: `https://venmo.com/${encodeURIComponent(venmoUser)}?txn=pay&note=${noteEncoded}`
      });
    }
    if (paypalMe) {
      otherLinks.push({
        label: "PayPal other amount",
        href: `https://www.paypal.me/${encodeURIComponent(paypalMe)}`
      });
    }

    const mapQuery = encodeURIComponent(
      [party.locationName, party.address].filter(Boolean).join(" ")
    );
    const mapLink = mapQuery ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}` : "";

    const photosHtml = photos.length
      ? `
      
        <div class="grid">
          ${photos
            .map(
              (p) => `
            <img
              class="photo"
              src="${escapeHtml(p.src || "")}"
              alt="${escapeHtml(p.alt || name + " photo")}"
              loading="lazy"
            />
          `
            )
            .join("")}
        </div>
      `
      : "";

    const rsvpEnabled = !!rsvp.enabled;
    const rsvpTitle = rsvp.title || "RSVP";
    const embedUrl = (rsvp.embedUrl || "").trim();
    const openUrl = (rsvp.openUrl || "").trim() || embedUrl.replace("embedded=true", "").trim();

    const rsvpHtml =
      rsvpEnabled
        ? `
          <h2>${escapeHtml(rsvpTitle)}</h2>
          <p class="muted">Please RSVP using the form below.</p>

          ${
            embedUrl
              ? `
                <div class="embedWrap">
                  <iframe
                    title="${escapeHtml(rsvpTitle)} form"
                    src="${escapeHtml(embedUrl)}"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              `
              : `
                <div class="error">
                  RSVP is enabled, but no Google Form link is set in config.json.
                </div>
              `
          }

          ${
            openUrl
              ? `
                <div style="margin-top:12px;">
                  <a class="btnSecondary" href="${escapeHtml(openUrl)}" target="_blank" rel="noopener">
                    Open RSVP form in a new tab
                  </a>
                </div>
              `
              : ""
          }

          <div class="note">
            RSVP emails are sent by Google Forms to the form owner (make sure email notifications are turned on).
          </div>
        `
        : "";

    app.innerHTML = `
      <h1>${escapeHtml(name)}</h1>
      ${headline ? `<h2 class="muted" style="margin-top:6px;">${escapeHtml(headline)}</h2>` : ""}

  ${photosHtml}
 
      ${
  about || about2
    ? `
      <h2>Plans for the Future </h2>
      ${about ? `<p>${escapeHtml(about)}</p>` : ""}
      ${about2 ? `<p>${escapeHtml(about2)}</p>` : ""}
    `
    : ""
}

      <h2>Party details</h2>
      <div class="kv">
        <div class="kvBox">
          <div class="kvLabel">Date</div>
          <div class="kvValue">${escapeHtml(party.date || "TBD")}</div>
        </div>
        <div class="kvBox">
          <div class="kvLabel">Time</div>
          <div class="kvValue">${escapeHtml(party.time || "TBD")}</div>
        </div>
        <div class="kvBox">
          <div class="kvLabel">Location</div>
          <div class="kvValue">${escapeHtml(party.locationName || "TBD")}</div>
          ${party.address ? `<div class="muted" style="margin-top:6px;">${escapeHtml(party.address)}</div>` : ""}
          ${
            mapLink
              ? `<div style="margin-top:10px;">
                   <a class="btnSecondary" href="${mapLink}" target="_blank" rel="noopener">
                     Open in Maps
                   </a>
                 </div>`
              : ""
          }
        </div>
        ${
          party.notes
            ? `
          <div class="kvBox">
            <div class="kvLabel">Notes</div>
            <div class="kvValue">${escapeHtml(party.notes)}</div>
          </div>
        `
            : ""
        }
      </div>

      ${rsvpHtml}

      <h2>Send a gift</h2>
      <p class="muted">Choose an amount below or select other.</p>

      ${
        suggestedAmounts.length
          ? `
        <div class="pills">
          ${suggestedAmounts
            .map(
              (l) => `
            <a class="pill" href="${l.href}" target="_blank" rel="noopener">
              ${escapeHtml(l.label)}
            </a>
          `
            )
            .join("")}
        </div>
      `
          : `
        <div class="error" style="margin-top:12px;">
          Payment links are not set up for this page.
        </div>
      `
      }

      ${
        otherLinks.length
          ? `
        <div class="pills" style="margin-top:10px;">
          ${otherLinks
            .map(
              (l) => `
            <a class="pill" href="${l.href}" target="_blank" rel="noopener">
              ${escapeHtml(l.label)}
            </a>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }

      <div class="note">
        If a link opens in your browser first, tap “Open in app” when available.
      </div>

      <div style="margin-top:20px;">
        <a class="btnSecondary" href="/">Back to homepage</a>
      </div>
    `;

    document.title = name + " | Celebrate the Grad";
  }

  async function init() {
    try {
      const res = await fetch("./config.json", { cache: "no-store" });
      if (!res.ok) return renderNotFound("config.json was not found (HTTP " + res.status + ").");
      const cfg = await res.json();
      render(cfg);
    } catch (err) {
      renderNotFound(err && err.message ? err.message : "Unknown error loading config.");
    }
  }

  init();
})();
