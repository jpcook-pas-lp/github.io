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

  function renderNotFound() {
    app.innerHTML = `
      <h1>We couldn’t find that page</h1>
      <p class="muted">
        The code might be incorrect or this page is no longer available.
      </p>
      <div class="pills" style="margin-top:16px;">
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

    const name = grad.name || "Graduate";
    const headline = grad.headline || "";
    const school = grad.school || "";
    const year = grad.year || "";
    const about = grad.about || "";

    const photos = Array.isArray(cfg.photos)
      ? cfg.photos.slice(0, 3)
      : [];

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
        href: `https://venmo.com/${encodeURIComponent(
          venmoUser
        )}?txn=pay&note=${noteEncoded}`
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

    const mapLink = mapQuery
      ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
      : "";

    const photosHtml = photos.length
      ? `
        <h2>Photos</h2>
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

    app.innerHTML = `
      <h1>${escapeHtml(name)}</h1>
      ${
        headline
          ? `<p class="muted" style="margin-top:6px;">${escapeHtml(
              headline
            )}</p>`
          : ""
      }

      <div class="kv">
        ${
          school
            ? `
          <div class="kvBox">
            <div class="kvLabel">School</div>
            <div class="kvValue">${escapeHtml(school)}</div>
          </div>
        `
            : ""
        }
        ${
          year
            ? `
          <div class="kvBox">
            <div class="kvLabel">Class of</div>
            <div class="kvValue">${escapeHtml(year)}</div>
          </div>
        `
            : ""
        }
      </div>

      ${
        about
          ? `
        <h2>About</h2>
        <p>${escapeHtml(about)}</p>
      `
          : ""
      }

      ${photosHtml}

      <h2>Party details</h2>
      <div class="kv">
        <div class="kvBox">
          <div class="kvLabel">Date</div>
          <div class="kvValue">${escapeHtml(
            party.date || "TBD"
          )}</div>
        </div>
        <div class="kvBox">
          <div class="kvLabel">Time</div>
          <div class="kvValue">${escapeHtml(
            party.time || "TBD"
          )}</div>
        </div>
        <div class="kvBox">
          <div class="kvLabel">Location</div>
          <div class="kvValue">${escapeHtml(
            party.locationName || "TBD"
          )}</div>
          ${
            party.address
              ? `<div class="muted" style="margin-top:6px;">${escapeHtml(
                  party.address
                )}</div>`
              : ""
          }
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
            <div class="kvValue">${escapeHtml(
              party.notes
            )}</div>
          </div>
        `
            : ""
        }
      </div>

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
      if (!res.ok) return renderNotFound();
      const cfg = await res.json();
      render(cfg);
    } catch (err) {
      renderNotFound();
    }
  }

  init();
})();
