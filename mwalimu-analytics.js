/* mwalimu.site analytics — lightweight, privacy-conscious public tracker */
(() => {
  if (window.__MWALIMU_ANALYTICS_LOADED__) return;
  window.__MWALIMU_ANALYTICS_LOADED__ = true;

  const URL = "https://ilzbxafrtxfurccqdpub.supabase.co";
  const KEY = "sb_publishable_xodjAhF80sHdlo_8TyDCEA_B2ZCA5t_";
  const STORE_KEY = "mwalimu_analytics_visitor_v1";
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  function visitorId() {
    let id = localStorage.getItem(STORE_KEY);
    if (!UUID_RE.test(id || "")) {
      id = crypto.randomUUID();
      localStorage.setItem(STORE_KEY, id);
    }
    return id;
  }

  function start(client) {
    const visitor = visitorId();
    const path = location.pathname || "/";
    const isAdmin = /mwalimu-admin-content-manager\.html$/.test(path);

    // A page view is counted once per browser tab/page load; database dedupes
    // repeat events from the same visitor within 30 minutes.
    client.from("mwalimu_analytics_events").insert({
      event_type: "page_view", content_id: null, page_path: path, visitor_id: visitor
    }).then(({ error }) => { if (error) console.warn("Mwalimu analytics page view:", error.message); });

    const icon = {
      eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
      download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v3h16v-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    const style = document.createElement("style");
    style.textContent = `
      .mw-analytics-count{display:inline-flex;align-items:center;gap:4px;color:#829087;font-size:10px;font-weight:650;white-space:nowrap;margin-left:9px;vertical-align:middle}
      .mw-analytics-count svg{width:14px;height:14px;display:block}
      .mw-analytics-admin{margin:20px 0 26px;padding:22px;border:1px solid #e0e7dd;border-radius:18px;background:#fffdf7;color:#1d2b24}
      .mw-analytics-admin h2{margin:0 0 5px;font-size:20px;color:#244c3b}
      .mw-analytics-admin p{margin:0 0 16px;color:#718078;font-size:12px}
      .mw-analytics-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:18px}
      .mw-analytics-metric{padding:14px;border:1px solid #e5ebe2;border-radius:13px;background:#f7f8f2}
      .mw-analytics-metric span{display:block;color:#718078;font-size:11px}
      .mw-analytics-metric strong{display:block;color:#244c3b;font-size:26px;margin-top:4px}
      .mw-analytics-table{width:100%;border-collapse:collapse;font-size:12px}
      .mw-analytics-table th,.mw-analytics-table td{text-align:left;padding:9px;border-bottom:1px solid #edf0e9}
      .mw-analytics-table th{color:#718078;font-weight:700}
      @media(max-width:600px){.mw-analytics-metrics{grid-template-columns:1fr}.mw-analytics-admin{padding:15px;overflow-x:auto}}
    `;
    document.head.appendChild(style);

    function countBadge(kind, id, count) {
      const badge = document.createElement("span");
      badge.className = "mw-analytics-count";
      badge.dataset.analyticsBadge = kind + ":" + id;
      badge.innerHTML = (kind === "resource" ? icon.download : icon.eye) + "<span>" + Number(count || 0).toLocaleString() + "</span>";
      badge.title = kind === "resource" ? "Successful downloads" : "Times opened";
      return badge;
    }

    async function loadCounters(kind) {
      const { data, error } = await client.from("mwalimu_public_counters")
        .select("content_id,total_count").eq("content_kind", kind);
      if (error) { console.warn("Mwalimu analytics counters:", error.message); return new Map(); }
      return new Map((data || []).map(row => [row.content_id, Number(row.total_count || 0)]));
    }

    async function decorateResources() {
      const counters = await loadCounters("resource");
      const decorate = () => document.querySelectorAll("[data-download-id]").forEach(button => {
        const id = button.dataset.downloadId;
        if (!UUID_RE.test(id || "") || button.parentElement.querySelector(`[data-analytics-badge="resource:${id}"]`)) return;
        button.parentElement.appendChild(countBadge("resource", id, counters.get(id) || 0));
      });
      decorate();
      new MutationObserver(decorate).observe(document.body, { childList: true, subtree: true });
    }

    async function decorateUpdates() {
      const counters = await loadCounters("update");
      const decorate = () => document.querySelectorAll("[data-open-update]").forEach(button => {
        const id = button.dataset.openUpdate;
        if (!UUID_RE.test(id || "") || button.parentElement.querySelector(`[data-analytics-badge="update:${id}"]`)) return;
        button.parentElement.appendChild(countBadge("update", id, counters.get(id) || 0));
      });
      decorate();
      new MutationObserver(decorate).observe(document.body, { childList: true, subtree: true });
    }

    async function decorateJobs() {
      const [{ data: jobs, error: jobError }, counters] = await Promise.all([
        client.from("mwalimu_site_content").select("id,title,employer").eq("content_type","job").eq("is_published",true),
        loadCounters("job")
      ]);
      if (jobError) return;
      const byTitle = new Map((jobs || []).map(j => [((j.title || "") + "|" + (j.employer || "")).toLowerCase(), j.id]));
      const decorate = () => document.querySelectorAll(".job-card").forEach(card => {
        const title = card.querySelector("h3")?.textContent?.trim() || "";
        const employer = card.querySelector(".employer")?.textContent?.trim() || "";
        const id = byTitle.get((title + "|" + employer).toLowerCase()) ||
          (jobs || []).find(j => (j.title || "").toLowerCase() === title.toLowerCase())?.id;
        if (!id || card.querySelector(`[data-analytics-badge="job:${id}"]`)) return;
        card.dataset.mwalimuContentId = id;
        const target = card.querySelector(".job-top") || card;
        target.appendChild(countBadge("job", id, counters.get(id) || 0));
      });
      decorate();
      new MutationObserver(decorate).observe(document.body, { childList: true, subtree: true });
      document.addEventListener("click", event => {
        const card = event.target.closest(".job-card");
        const id = card?.dataset.mwalimuContentId;
        if (id && event.target.closest("a.job-btn")) record("job_view", id);
      });
    }

    function record(eventType, id) {
      if (!UUID_RE.test(id || "")) return;
      client.from("mwalimu_analytics_events").insert({
        event_type: eventType, content_id: id, page_path: path, visitor_id: visitor
      }).then(({ error }) => { if (error) console.warn("Mwalimu analytics event:", error.message); });
    }

    // Updates open inside a modal; track the actual open action, not a page impression.
    document.addEventListener("click", event => {
      const button = event.target.closest("[data-open-update]");
      if (button) record("update_view", button.dataset.openUpdate);
    });

    if (/resources\.html$/.test(path)) decorateResources();
    if (/updates\.html$/.test(path)) decorateUpdates();
    if (/jobs\.html$/.test(path)) decorateJobs();
    if (isAdmin) loadAdminPanel(client);
  }

  async function loadAdminPanel(client) {
    const { data: authData } = await client.auth.getUser();
    if (authData?.user?.app_metadata?.role !== "admin") return;
    const app = document.getElementById("app");
    if (!app) return;
    const panel = document.createElement("section");
    panel.className = "mw-analytics-admin";
    panel.innerHTML = '<h2>Website traffic</h2><p>Weekly visits and unique browsers · Kampala time</p><div class="mw-analytics-metrics"><div class="mw-analytics-metric"><span>This week · unique visitors</span><strong id="mwUnique">—</strong></div><div class="mw-analytics-metric"><span>This week · total visits</span><strong id="mwVisits">—</strong></div></div><div style="overflow-x:auto"><table class="mw-analytics-table"><thead><tr><th>Week starting</th><th>Unique visitors</th><th>Total visits</th></tr></thead><tbody id="mwTrafficRows"><tr><td colspan="3">Loading analytics…</td></tr></tbody></table></div>';
    app.prepend(panel);

    const { data, error } = await client.from("mwalimu_weekly_traffic")
      .select("week_start,total_visits,unique_visitors").order("week_start", { ascending: false }).limit(12);
    if (error) {
      document.getElementById("mwTrafficRows").innerHTML = '<tr><td colspan="3">Analytics could not be loaded. Check admin access.</td></tr>';
      console.warn("Mwalimu admin analytics:", error.message);
      return;
    }
    const rows = data || [];
    if (rows[0]) {
      document.getElementById("mwUnique").textContent = Number(rows[0].unique_visitors).toLocaleString();
      document.getElementById("mwVisits").textContent = Number(rows[0].total_visits).toLocaleString();
    } else {
      document.getElementById("mwUnique").textContent = "0";
      document.getElementById("mwVisits").textContent = "0";
    }
    document.getElementById("mwTrafficRows").innerHTML = rows.map(row =>
      `<tr><td>${new Date(row.week_start + "T00:00:00").toLocaleDateString("en-UG",{day:"numeric",month:"short",year:"numeric"})}</td><td>${Number(row.unique_visitors).toLocaleString()}</td><td>${Number(row.total_visits).toLocaleString()}</td></tr>`
    ).join("") || '<tr><td colspan="3">No traffic recorded yet.</td></tr>';
  }

  function init() {
    if (!window.supabase?.createClient) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = () => start(window.supabase.createClient(URL, KEY));
      document.head.appendChild(script);
    } else {
      start(window.supabase.createClient(URL, KEY));
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
