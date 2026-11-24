/* Mwalimu.site analytics integration — public counters + admin traffic */
(() => {
  if (window.__MWALIMU_ANALYTICS_LOADED__) return;
  window.__MWALIMU_ANALYTICS_LOADED__ = true;

  const SUPABASE_URL = "https://ilzbxafrtxfurccqdpub.supabase.co";
  const SUPABASE_KEY = "sb_publishable_xodjAhF80sHdlo_8TyDCEA_B2ZCA5t_";
  const VISITOR_KEY = "mwalimu_analytics_visitor_v1";
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const PATH = location.pathname || "/";
  const IS_ADMIN = /mwalimu-admin-content-manager\.html$/.test(PATH);

  function getVisitorId() {
    try {
      let id = localStorage.getItem(VISITOR_KEY);
      if (!UUID_RE.test(id || "")) {
        id = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, id);
      }
      return id;
    } catch (error) {
      // A session-only identifier keeps analytics working when storage is blocked.
      return crypto.randomUUID();
    }
  }

  function addStyles() {
    if (document.getElementById("mwalimu-analytics-styles")) return;
    const style = document.createElement("style");
    style.id = "mwalimu-analytics-styles";
    style.textContent = `
      .mw-analytics-count{display:inline-flex;align-items:center;gap:4px;color:#829087;font-size:10px;font-weight:650;white-space:nowrap;margin-left:9px;vertical-align:middle}
      .mw-analytics-count svg{width:14px;height:14px;display:block;flex:0 0 auto}
      .mw-analytics-admin{margin:20px 0 26px;padding:22px;border:1px solid #e0e7dd;border-radius:18px;background:#fffdf7;color:#1d2b24}
      .mw-analytics-admin h2{margin:0 0 5px;font-size:20px;color:#244c3b}
      .mw-analytics-admin p{margin:0 0 16px;color:#718078;font-size:12px}
      .mw-analytics-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:18px}
      .mw-analytics-metric{padding:14px;border:1px solid #e5ebe2;border-radius:13px;background:#f7f8f2}
      .mw-analytics-metric span{display:block;color:#718078;font-size:11px}
      .mw-analytics-metric strong{display:block;color:#244c3b;font-size:26px;margin-top:4px}
      .mw-analytics-chart{display:flex;align-items:flex-end;gap:8px;height:170px;padding:14px 8px 28px;border:1px solid #e5ebe2;border-radius:13px;background:linear-gradient(180deg,#fff 0%,#f7f8f2 100%);overflow-x:auto}
      .mw-analytics-week{height:100%;min-width:26px;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:5px}
      .mw-analytics-bar{width:min(100%,30px);min-height:2px;border-radius:6px 6px 2px 2px;background:#6d9b7b;position:relative}
      .mw-analytics-bar:after{content:attr(data-visits);position:absolute;left:50%;top:-18px;transform:translateX(-50%);font-size:9px;color:#718078;white-space:nowrap}
      .mw-analytics-week small{font-size:9px;color:#718078;white-space:nowrap}
      .mw-analytics-table{width:100%;border-collapse:collapse;font-size:12px}
      .mw-analytics-table th,.mw-analytics-table td{text-align:left;padding:9px;border-bottom:1px solid #edf0e9}
      .mw-analytics-table th{color:#718078;font-weight:700}
      @media(max-width:600px){.mw-analytics-metrics{grid-template-columns:1fr}.mw-analytics-admin{padding:15px;overflow-x:hidden}.mw-analytics-chart{gap:6px}}
    `;
    document.head.appendChild(style);
  }

  const icons = {
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v3h16v-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function makeBadge(kind, id, count) {
    const badge = document.createElement("span");
    badge.className = "mw-analytics-count";
    badge.dataset.analyticsBadge = `${kind}:${id}`;
    badge.innerHTML = `${kind === "resource" ? icons.download : icons.eye}<span>${Number(count || 0).toLocaleString()}</span>`;
    badge.title = kind === "resource" ? "Successful downloads" : "Times opened";
    return badge;
  }

  function start(client) {
    if (!client) return;
    const visitorId = getVisitorId();
    const pageEvent = client.from("mwalimu_analytics_events").insert({
      event_type: "page_view", content_id: null, page_path: PATH, visitor_id: visitorId
    });
    pageEvent.then(({ error }) => {
      if (error) console.warn("Mwalimu analytics page view:", error.message);
    });

    function record(eventType, contentId) {
      if (!UUID_RE.test(String(contentId || ""))) return;
      client.from("mwalimu_analytics_events").insert({
        event_type: eventType, content_id: contentId, page_path: PATH, visitor_id: visitorId
      }).then(({ error }) => {
        if (error) console.warn("Mwalimu analytics event:", error.message);
      });
    }

    async function loadCounters(kind) {
      const { data, error } = await client.from("mwalimu_public_counters")
        .select("content_id,total_count").eq("content_kind", kind);
      if (error) {
        console.warn("Mwalimu analytics counters:", error.message);
        return new Map();
      }
      return new Map((data || []).map(row => [String(row.content_id), Number(row.total_count || 0)]));
    }

    function observeAndDecorate(selector, kind, counters, getId) {
      const decorate = () => document.querySelectorAll(selector).forEach(element => {
        const id = String(getId(element) || "");
        if (!UUID_RE.test(id)) return;
        const target = element.parentElement || element;
        if (target.querySelector(`[data-analytics-badge="${kind}:${id}"]`)) return;
        target.appendChild(makeBadge(kind, id, counters.get(id) || 0));
      });
      decorate();
      new MutationObserver(decorate).observe(document.body, { childList: true, subtree: true });
    }

    async function decorateResources() {
      const counters = await loadCounters("resource");
      observeAndDecorate("[data-download-id]", "resource", counters, el => el.dataset.downloadId);
    }

    async function decorateUpdates() {
      const counters = await loadCounters("update");
      observeAndDecorate("[data-open-update]", "update", counters, el => el.dataset.openUpdate);
    }

    async function decorateJobs() {
      const [{ data: jobs, error }, counters] = await Promise.all([
        client.from("mwalimu_site_content").select("id,title,employer")
          .eq("content_type", "job").eq("is_published", true),
        loadCounters("job")
      ]);
      if (error) {
        console.warn("Mwalimu analytics job lookup:", error.message);
        return;
      }
      const byTitleAndEmployer = new Map((jobs || []).map(job => [
        `${(job.title || "").trim()}|${(job.employer || "").trim()}`.toLowerCase(), String(job.id)
      ]));
      const byTitle = new Map((jobs || []).map(job => [(job.title || "").trim().toLowerCase(), String(job.id)]));
      const decorate = () => document.querySelectorAll(".job-card").forEach(card => {
        const title = card.querySelector("h3")?.textContent?.trim() || "";
        const employerText = card.querySelector(".employer")?.textContent?.trim() || "";
        const employer = employerText === "Employer not stated" ? "" : employerText;
        const id = byTitleAndEmployer.get(`${title}|${employer}`.toLowerCase()) || byTitle.get(title.toLowerCase());
        if (!id || card.querySelector(`[data-analytics-badge="job:${id}"]`)) return;
        const target = card.querySelector(".job-top") || card;
        target.appendChild(makeBadge("job", id, counters.get(id) || 0));
        card.dataset.mwalimuContentId = id;
      });
      decorate();
      new MutationObserver(decorate).observe(document.body, { childList: true, subtree: true });
      document.addEventListener("click", event => {
        const link = event.target.closest(".job-card a.job-btn");
        const card = link?.closest(".job-card");
        if (card?.dataset.mwalimuContentId) record("job_view", card.dataset.mwalimuContentId);
      });
    }

    if (/resources\.html$/.test(PATH)) decorateResources();
    if (/updates\.html$/.test(PATH)) {
      decorateUpdates();
      document.addEventListener("click", event => {
        const button = event.target.closest("[data-open-update]");
        if (button) record("update_view", button.dataset.openUpdate);
      });
    }
    if (/jobs\.html$/.test(PATH)) decorateJobs();
    if (IS_ADMIN) setupAdminAnalytics(client);
  }

  function setupAdminAnalytics(client) {
    let panelCreated = false;
    async function maybeShowPanel(sessionUser) {
      const app = document.getElementById("app");
      if (panelCreated || !app || sessionUser?.app_metadata?.role !== "admin") return;
      panelCreated = true;
      addStyles();
      const panel = document.createElement("section");
      panel.className = "mw-analytics-admin";
      panel.innerHTML = `
        <h2>Website traffic</h2>
        <p>Weekly visits and unique browsers · Kampala time</p>
        <div class="mw-analytics-metrics">
          <div class="mw-analytics-metric"><span>This week · unique visitors</span><strong id="mwUnique">—</strong></div>
          <div class="mw-analytics-metric"><span>This week · total visits</span><strong id="mwVisits">—</strong></div>
        </div>
        <h3 style="margin:0 0 8px;font-size:14px;color:#244c3b">12-week traffic trend</h3>
        <div class="mw-analytics-chart" id="mwTrafficChart" aria-label="12-week total visits chart"><span style="font-size:12px;color:#718078">Loading traffic…</span></div>
        <div style="overflow-x:auto;margin-top:14px">
          <table class="mw-analytics-table">
            <thead><tr><th>Week starting</th><th>Unique visitors</th><th>Total visits</th></tr></thead>
            <tbody id="mwTrafficRows"><tr><td colspan="3">Loading analytics…</td></tr></tbody>
          </table>
        </div>`;
      app.prepend(panel);

      const { data, error } = await client.from("mwalimu_weekly_traffic")
        .select("week_start,total_visits,unique_visitors")
        .order("week_start", { ascending: false }).limit(12);
      const rows = data || [];
      const uniqueEl = document.getElementById("mwUnique");
      const visitsEl = document.getElementById("mwVisits");
      const table = document.getElementById("mwTrafficRows");
      const chart = document.getElementById("mwTrafficChart");
      if (error) {
        table.innerHTML = '<tr><td colspan="3">Analytics could not be loaded. Check analytics table permissions.</td></tr>';
        chart.textContent = "Traffic data is currently unavailable.";
        console.warn("Mwalimu admin analytics:", error.message);
        return;
      }
      uniqueEl.textContent = Number(rows[0]?.unique_visitors || 0).toLocaleString();
      visitsEl.textContent = Number(rows[0]?.total_visits || 0).toLocaleString();
      const chronological = [...rows].reverse();
      const maxVisits = Math.max(1, ...chronological.map(row => Number(row.total_visits || 0)));
      chart.innerHTML = chronological.map(row => {
        const visits = Number(row.total_visits || 0);
        const height = Math.max(2, Math.round((visits / maxVisits) * 100));
        const label = new Date(row.week_start + "T00:00:00").toLocaleDateString("en-UG", { day: "numeric", month: "short" });
        return `<div class="mw-analytics-week" title="${label}: ${visits} visits">
          <div class="mw-analytics-bar" data-visits="${visits.toLocaleString()}" style="height:${height}%"></div>
          <small>${label}</small>
        </div>`;
      }).join("") || '<span style="font-size:12px;color:#718078">No traffic recorded yet.</span>';
      table.innerHTML = rows.map(row => {
        const label = new Date(row.week_start + "T00:00:00").toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });
        return `<tr><td>${label}</td><td>${Number(row.unique_visitors || 0).toLocaleString()}</td><td>${Number(row.total_visits || 0).toLocaleString()}</td></tr>`;
      }).join("") || '<tr><td colspan="3">No traffic recorded yet.</td></tr>';
    }

    // Use the admin page's existing authenticated client to share its active session.
    client.auth.getUser().then(({ data }) => maybeShowPanel(data?.user));
    client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
        setTimeout(() => maybeShowPanel(session?.user), 0);
      }
    });
  }

  function init() {
    addStyles();
    // The admin page exposes its existing client; public pages use an isolated
    // anonymous client so their analytics does not interfere with sign-in state.
    if (IS_ADMIN && window.__MWALIMU_DB__) {
      start(window.__MWALIMU_DB__);
      return;
    }
    if (!window.supabase?.createClient) {
      const loader = document.createElement("script");
      loader.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      loader.onload = () => start(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "mwalimu-analytics-public" }
      }));
      document.head.appendChild(loader);
      return;
    }
    start(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "mwalimu-analytics-public" }
    }));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
