(function () {
  const data = window.BFX;
  data.symbols.forEach(seed);

  function seed(s) {
    const hist = [];
    for (let i = 0; i < 28; i++) {
      const trend = s.open + (s.price - s.open) * (i / 27);
      hist.push(trend + (Math.random() - 0.5) * Math.abs(s.price - s.open || s.pip * 20) * 0.35);
    }
    hist[hist.length - 1] = s.price;
    s.hist = hist;
    s.high = Math.max(s.open, s.price, ...hist);
    s.low = Math.min(s.open, s.price, ...hist);
  }

  function money(n, digits) {
    return n.toLocaleString("en-NA", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  function changeOf(s) {
    return ((s.price - s.open) / s.open) * 100;
  }

  function askOf(s) {
    return s.price + s.spread * s.pip;
  }

  function spark(hist) {
    const w = 160;
    const h = 42;
    const min = Math.min(...hist);
    const max = Math.max(...hist);
    const span = max - min || 1;
    const pts = hist.map((v, i) => {
      const x = (i / (hist.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ");
    return '<svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none"><polyline points="' + pts + '"/></svg>';
  }

  function quoteHTML() {
    return data.symbols.map((s) => {
      const ch = changeOf(s);
      const cls = ch >= 0 ? "up" : "down";
      return '<span class="q" data-q="' + s.id + '"><span class="qs">' + s.id + '</span><span class="qp">' + money(s.price, s.digits) + '</span><span class="qc ' + cls + '">' + (ch >= 0 ? "+" : "") + ch.toFixed(2) + "%</span></span>";
    }).join("");
  }

  function initNav() {
    const quotes = quoteHTML();
    const track = document.getElementById("tape-track");
    if (track) {
      track.innerHTML = '<div class="tape-group">' + quotes + '</div><div class="tape-group" aria-hidden="true">' + quotes + "</div>";
    }
    const burger = document.querySelector(".burger");
    const links = document.querySelector(".nav-links");
    if (burger && links) {
      burger.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      links.addEventListener("click", (e) => {
        if (e.target.closest("a")) links.classList.remove("open");
      });
    }
    document.querySelectorAll(".caret").forEach((btn) => {
      btn.addEventListener("click", () => {
        const li = btn.closest(".has-sub");
        const open = li.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
    document.body.addEventListener("click", (e) => {
      const social = e.target.closest("[data-social]");
      const store = e.target.closest("[data-store]");
      if (social) {
        e.preventDefault();
        toast("Social profiles for BlueFx Markets are placeholders on this demo.");
      }
      if (store) {
        e.preventDefault();
        toast(store.dataset.store === "ios" ? "App Store listing for the BlueFx iPhone app is part of this demo layout." : "Google Play listing for the BlueFx Android app is part of this demo layout.");
      }
    });
  }

  function paintPhone() {
    const chart = document.querySelector("[data-phone-chart]");
    const usd = data.symbols.find((s) => s.id === "USD/NAD");
    if (chart && usd) chart.innerHTML = spark(usd.hist);
    const phonePx = document.querySelector('[data-phone="USD/NAD"]');
    if (phonePx && usd) phonePx.textContent = money(usd.price, usd.digits);
  }

  function toast(text) {
    document.querySelectorAll(".toast").forEach((n) => n.remove());
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function clock() {
    const el = document.getElementById("cat-clock");
    if (!el) return;
    const text = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Windhoek",
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(new Date());
    el.textContent = text + " CAT";
  }

  function paintSymbol(s) {
    const ch = changeOf(s);
    const cls = ch >= 0 ? "up" : "down";
    const sign = ch >= 0 ? "+" : "";
    document.querySelectorAll('[data-q="' + s.id + '"]').forEach((node) => {
      node.querySelector(".qp").textContent = money(s.price, s.digits);
      const qc = node.querySelector(".qc");
      qc.textContent = sign + ch.toFixed(2) + "%";
      qc.classList.remove("up", "down");
      qc.classList.add(cls);
    });
    document.querySelectorAll('[data-card="' + s.id + '"]').forEach((card) => {
      card.classList.remove("up", "down", "flash-up", "flash-down");
      card.classList.add(cls, ch >= 0 ? "flash-up" : "flash-down");
      const bid = card.querySelector("[data-bid]");
      const chg = card.querySelector("[data-chg]");
      const ask = card.querySelector("[data-ask]");
      const spread = card.querySelector("[data-spread]");
      const svg = card.querySelector("[data-spark]");
      if (bid) bid.textContent = money(s.price, s.digits);
      if (chg) {
        chg.textContent = sign + ch.toFixed(2) + "%";
        chg.classList.remove("up", "down");
        chg.classList.add(cls);
      }
      if (ask) ask.textContent = "Ask " + money(askOf(s), s.digits);
      if (spread) spread.textContent = "Spread " + s.spread;
      if (svg) svg.innerHTML = spark(s.hist);
    });
    const row = document.querySelector('[data-row="' + s.id + '"]');
    if (row) {
      row.classList.remove("flash-up", "flash-down");
      row.classList.add(ch >= 0 ? "flash-up" : "flash-down");
      row.querySelector("[data-bid]").textContent = money(s.price, s.digits);
      row.querySelector("[data-ask]").textContent = money(askOf(s), s.digits);
      row.querySelector("[data-spread]").textContent = String(s.spread);
      const cell = row.querySelector("[data-chg]");
      cell.textContent = sign + ch.toFixed(2) + "%";
      cell.classList.remove("up", "down");
      cell.classList.add(cls);
      row.querySelector("[data-high]").textContent = money(s.high, s.digits);
      row.querySelector("[data-low]").textContent = money(s.low, s.digits);
    }
    document.querySelectorAll('[data-phone="' + s.id + '"]').forEach((node) => {
      node.textContent = money(s.price, s.digits);
    });
    const phoneChart = document.querySelector("[data-phone-chart]");
    if (phoneChart && s.id === "USD/NAD") phoneChart.innerHTML = spark(s.hist);
  }

  function tick() {
    for (let n = 0; n < 3; n++) {
      const s = data.symbols[Math.floor(Math.random() * data.symbols.length)];
      const shock = (Math.random() - 0.5) * s.pip * (s.tags.includes("indices") || s.tags.includes("synthetic") ? 8 : 5);
      s.price = Math.max(s.pip, s.price + shock);
      s.hist.push(s.price);
      if (s.hist.length > 32) s.hist.shift();
      s.high = Math.max(s.high, s.price);
      s.low = Math.min(s.low, s.price);
      paintSymbol(s);
    }
  }

  function renderBoard() {
    const root = document.getElementById("quote-board");
    if (!root) return;
    root.innerHTML = data.symbols.filter((s) => s.featured).map((s) => {
      const ch = changeOf(s);
      const cls = ch >= 0 ? "up" : "down";
      return '<article class="qcard ' + cls + '" data-card="' + s.id + '"><div class="qcard-top"><span>' + s.id + '</span><b data-chg class="' + cls + '">' + (ch >= 0 ? "+" : "") + ch.toFixed(2) + '%</b></div><div class="qcard-px" data-bid>' + money(s.price, s.digits) + '</div><div class="qcard-meta"><span data-ask>Ask ' + money(askOf(s), s.digits) + '</span><span data-spread>Spread ' + s.spread + '</span></div><div class="spark" data-spark>' + spark(s.hist) + '</div><p class="qname">' + s.name + "</p></article>";
    }).join("");
  }

  function specValue(account, label) {
    const row = account.specs.find((item) => item[0] === label);
    return row ? row[1] : "";
  }

  function accountCard(account) {
    const keys = ["Minimum Deposit", "Maximum Deposit", "Leverage", "Spreads from", "Bonus", "Cashback", "Swap", "Stop out"];
    const keyRows = keys.map((label) => {
      const value = specValue(account, label);
      return value ? "<li><span>" + label + "</span><strong>" + value + "</strong></li>" : "";
    }).join("");
    const full = account.specs.map((row) => "<div><dt>" + row[0] + "</dt><dd>" + row[1] + "</dd></div>").join("");
    const hot = account.tags.includes("bonus") ? " hot" : "";
    return '<article class="account-card" id="acc-' + account.id + '"><span class="pill' + hot + '">' + account.tag + "</span><h3>" + account.name + "</h3><p>" + account.blurb + '</p><ul class="key-specs">' + keyRows + '</ul><details><summary>Full conditions</summary><dl class="full-specs">' + full + '</dl></details><a class="btn btn-primary" href="/login?type=' + account.id + '">Open this account</a></article>';
  }

  function renderAccounts() {
    const grid = document.getElementById("account-grid");
    const syn = document.getElementById("syn-accounts");
    const count = document.getElementById("account-count");
    if (grid) {
      let scrolled = false;
      const draw = (filter) => {
        const list = data.accounts.filter((a) => filter === "all" || a.tags.includes(filter));
        grid.innerHTML = list.map(accountCard).join("");
        if (count) count.textContent = "Showing " + list.length + " of " + data.accounts.length + " NAD accounts.";
        const hash = location.hash.replace("#", "");
        if (!scrolled && hash) {
          const target = document.getElementById(hash);
          if (target) {
            scrolled = true;
            target.classList.add("is-target");
            target.scrollIntoView({ block: "center" });
          }
        }
      };
      draw("all");
      document.getElementById("account-filters").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-filter]");
        if (!btn) return;
        document.querySelectorAll("#account-filters .chip").forEach((c) => c.classList.remove("on"));
        btn.classList.add("on");
        draw(btn.dataset.filter);
      });
    }
    if (syn) syn.innerHTML = data.accounts.filter((a) => a.tags.includes("synthetic")).map(accountCard).join("");
  }

  function renderWatch() {
    const body = document.getElementById("watch-body");
    if (!body) return;
    body.innerHTML = data.symbols.map((s) => {
      const ch = changeOf(s);
      const cls = ch >= 0 ? "up" : "down";
      return '<tr data-row="' + s.id + '" data-tags="' + s.tags.join(" ") + '" data-name="' + (s.id + " " + s.name).toLowerCase() + '"><td><strong>' + s.id + "</strong><small>" + s.name + '</small></td><td data-bid>' + money(s.price, s.digits) + '</td><td data-ask>' + money(askOf(s), s.digits) + '</td><td data-spread>' + s.spread + '</td><td data-chg class="chg ' + cls + '">' + (ch >= 0 ? "+" : "") + ch.toFixed(2) + '%</td><td data-high>' + money(s.high, s.digits) + '</td><td data-low>' + money(s.low, s.digits) + "</td></tr>";
    }).join("");
    const search = document.getElementById("watch-search");
    let filter = "all";
    const apply = () => {
      const q = (search.value || "").trim().toLowerCase();
      body.querySelectorAll("tr").forEach((row) => {
        const okFilter = filter === "all" || row.dataset.tags.split(" ").includes(filter);
        const okSearch = !q || row.dataset.name.includes(q);
        row.hidden = !(okFilter && okSearch);
      });
    };
    search.addEventListener("input", apply);
    document.getElementById("watch-filters").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      filter = btn.dataset.filter;
      document.querySelectorAll("#watch-filters .chip").forEach((c) => c.classList.remove("on"));
      btn.classList.add("on");
      apply();
    });
  }

  function renderCalendar() {
    const root = document.getElementById("calendar");
    if (!root) return;
    const draw = (impact) => {
      const events = data.events.filter((ev) => impact === "all" || ev.impact === impact);
      const days = [];
      events.forEach((ev) => {
        if (!days.includes(ev.day)) days.push(ev.day);
      });
      root.innerHTML = days.map((day) => {
        const rows = events.filter((ev) => ev.day === day).map((ev) => "<tr><td>" + ev.time + "</td><td>" + ev.zone + "</td><td>" + ev.event + '</td><td><span class="impact ' + ev.impact + '"><i></i>' + ev.impact + "</span></td><td>" + ev.forecast + "</td><td>" + ev.previous + "</td></tr>").join("");
        return '<h3 class="day-label">' + day + '</h3><div class="table-wrap"><table><thead><tr><th>Time CAT</th><th>Zone</th><th>Event</th><th>Impact</th><th>Forecast</th><th>Previous</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
      }).join("") || "<p>No events in this filter.</p>";
    };
    draw("all");
    document.getElementById("cal-filters").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-impact]");
      if (!btn) return;
      document.querySelectorAll("#cal-filters .chip").forEach((c) => c.classList.remove("on"));
      btn.classList.add("on");
      draw(btn.dataset.impact);
    });
  }

  function renderSignals() {
    const grid = document.getElementById("bot-grid");
    const feed = document.getElementById("signal-feed");
    if (!grid || !feed) return;
    grid.innerHTML = data.bots.map((bot) => '<article class="bot"><header><h3>' + bot.name + '</h3><span class="pill">' + bot.market + "</span></header><p>" + bot.text + "</p><dl><div><dt>Sample hit rate</dt><dd>" + bot.win + "</dd></div><div><dt>Typical hold</dt><dd>" + bot.hold + "</dd></div><div><dt>Session</dt><dd>" + bot.session + '</dd></div></dl><button class="btn btn-primary" type="button" data-bot="' + bot.name + '">Enable on demo</button></article>').join("");
    const pool = data.seedSignals.slice();
    const drawItem = (item, fresh) => {
      const cls = item.side === "Buy" ? "up" : "down";
      return '<article class="signal' + (fresh ? " new" : "") + '"><div><strong>' + item.symbol + "</strong><span>" + item.bot + '</span></div><div class="' + cls + '"><strong>' + item.side + "</strong></div><div>Entry " + item.entry + "</div><div>SL " + item.sl + "</div><div>TP " + item.tp + "</div><time>" + item.time + " CAT</time></article>";
    };
    feed.innerHTML = pool.map((item) => drawItem(item, false)).join("");
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-bot]");
      if (!btn) return;
      btn.textContent = "Active on demo";
      toast(btn.dataset.bot + " is marked active in this browser. No live order is sent.");
    });
    const extras = [
      { bot: "Namib Gold", symbol: "XAU/USD", side: "Buy", entry: "2,654.20", sl: "2,641.00", tp: "2,678.00" },
      { bot: "Desert Range", symbol: "Boom 500", side: "Buy", entry: "1,842.30", sl: "1,828.00", tp: "1,868.00" },
      { bot: "Dollar-NAD Desk", symbol: "EUR/NAD", side: "Sell", entry: "19.8240", sl: "19.8900", tp: "19.7100" },
      { bot: "Atlantic Trend", symbol: "USD/JPY", side: "Buy", entry: "151.842", sl: "151.420", tp: "152.400" },
      { bot: "Desert Range", symbol: "Crash 1000", side: "Sell", entry: "6,410.82", sl: "6,470.00", tp: "6,320.00" },
      { bot: "Dollar-NAD Desk", symbol: "GBP/NAD", side: "Buy", entry: "23.1960", sl: "23.1100", tp: "23.3400" }
    ];
    let i = 0;
    setInterval(() => {
      const item = Object.assign({}, extras[i % extras.length]);
      i += 1;
      const now = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Windhoek", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
      item.time = now;
      feed.insertAdjacentHTML("afterbegin", drawItem(item, true));
      while (feed.children.length > 8) feed.lastElementChild.remove();
    }, 7000);
  }

  function renderAuth() {
    const login = document.getElementById("form-login");
    if (!login) return;
    const register = document.getElementById("form-register");
    const tabs = document.querySelectorAll(".tabs button");
    const success = document.getElementById("auth-success");
    const select = document.getElementById("account-type");
    select.innerHTML = data.accounts.map((a) => '<option value="' + a.id + '">' + a.name + "</option>").join("");
    const open = (name) => {
      tabs.forEach((tab) => tab.classList.toggle("on", tab.dataset.tab === name));
      login.hidden = name !== "login";
      register.hidden = name !== "register";
    };
    tabs.forEach((tab) => tab.addEventListener("click", () => open(tab.dataset.tab)));
    const preset = new URLSearchParams(location.search).get("type");
    if (preset && data.accounts.some((a) => a.id === preset)) {
      open("register");
      select.value = preset;
    }
    const showOk = (title, text) => {
      login.hidden = true;
      register.hidden = true;
      document.querySelector(".tabs").hidden = true;
      success.hidden = false;
      success.querySelector("h2").textContent = title;
      success.querySelector("p").textContent = text;
    };
    login.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = login.email.value.trim();
      const err = login.querySelector(".form-error");
      if (!email.includes("@") || login.password.value.length < 8) {
        err.textContent = "Use a valid email and a password of at least 8 characters.";
        return;
      }
      err.textContent = "";
      showOk("Welcome back to the Windhoek desk.", "Demo only — nothing is sent to BlueFx. This profile stays in your browser and the account currency is NAD.");
    });
    register.addEventListener("submit", (e) => {
      e.preventDefault();
      const err = register.querySelector(".form-error");
      const email = register.email.value.trim();
      if (!register.first.value.trim() || !register.last.value.trim() || !email.includes("@") || register.password.value.length < 8 || !register.agree.checked) {
        err.textContent = "Complete your name, a valid email, an 8-character password, and the confirmation.";
        return;
      }
      err.textContent = "";
      const chosen = data.accounts.find((a) => a.id === select.value);
      showOk("Your BlueFx demo profile is ready.", "Demo only — nothing is sent to BlueFx. " + chosen.name + " is noted on this browser, denominated in NAD.");
    });
  }

  function renderCalc() {
    const form = document.getElementById("fee-calc");
    if (!form) return;
    const rules = {
      dpo: { fee: 0, min: 100, max: 100000, time: "Instant on this demo", label: "DPO Pay" },
      bank: { fee: 0, min: 250, max: 500000, time: "Same Windhoek business day", label: "Namibian bank EFT" }
    };
    const run = () => {
      const amount = Number(form.amount.value);
      const rule = rules[form.channel.value];
      const out = document.getElementById("fee-out");
      if (!amount || amount < rule.min) {
        out.textContent = rule.label + " starts at N$" + rule.min.toLocaleString("en-NA") + ".";
        return;
      }
      if (amount > rule.max) {
        out.textContent = rule.label + " on this demo stops at N$" + rule.max.toLocaleString("en-NA") + ".";
        return;
      }
      out.textContent = "You credit N$" + amount.toLocaleString("en-NA") + " with a sample fee of N$" + rule.fee + ". " + rule.time + ". Currency stays NAD.";
    };
    form.addEventListener("input", run);
    run();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    renderBoard();
    renderAccounts();
    renderWatch();
    renderCalendar();
    renderSignals();
    renderAuth();
    renderCalc();
    paintPhone();
    clock();
    setInterval(clock, 1000);
    data.symbols.forEach(paintSymbol);
    setInterval(tick, 900);
  });
})();
