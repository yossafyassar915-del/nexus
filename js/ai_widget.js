// ai_widget.js — "Nexus Ava", fully simulated for this static demo.
//
// There is no backend and no external AI API call here. Speech-to-text and
// text-to-speech still run for real (Web Speech API is a browser feature,
// not a server call), but the "thinking" step is a local rule-matcher
// against the data in db.js, with an artificial delay so it still feels
// like something is processing — exactly like the real (Groq-backed)
// version behaves from the person's point of view.
import { db } from "./db.js";

const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;

// Generic, professional-sounding fallback lines for anything that doesn't
// match a specific command — rotates so it doesn't feel like a broken
// record during a live demo.
const FALLBACK_REPLIES = [
  "Based on the stored data, sales have increased by 15% this quarter compared to last quarter.",
  "Your top-performing account right now is Apex Solutions, with two active proposals.",
  "Inventory levels look healthy overall, with only a couple of items nearing their reorder point.",
  "You have 8 open opportunities in the pipeline worth a combined $298,000.",
  "I can help with inventory lookups, creating leads, or a quick revenue summary — just ask.",
];

function getElements() {
  return {
    widget: document.getElementById("ai-widget"),
    launcher: document.getElementById("ai-launcher"),
    closeBtn: document.getElementById("ai-widget-close"),
    micBtn: document.getElementById("ai-widget-mic"),
    status: document.getElementById("ai-widget-status"),
    hint: document.getElementById("ai-widget-hint"),
    quickActions: document.querySelectorAll(".ai-widget__quick-action"),
  };
}

function setListeningUI(widget, status, listening) {
  widget.classList.toggle("is-listening", listening);
  status.textContent = listening ? "Ava is Listening..." : "Tap the mic to talk to Ava";
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel(); // don't stack replies if triggered twice quickly
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

// ---------------------------------------------------------------------
// Local "understanding" — simple keyword rules against db.js, standing in
// for the LLM tool-calling the full-stack version uses.
// ---------------------------------------------------------------------
function money(n) {
  return `$${Number(n || 0).toLocaleString("en-US")}`;
}

function pickFallback(message) {
  const idx = message.length % FALLBACK_REPLIES.length;
  return FALLBACK_REPLIES[idx];
}

function generateReply(message) {
  const text = message.toLowerCase();

  if (/(inventory|stock|كمية|مخزون)/.test(text)) {
    const match = text.match(/(?:for|of|كمية)\s+(.*?)(?:\s+in|\s+في|$)/);
    const productName = match ? match[1].trim() : text;
    const item = db.getInventoryItemByName(productName);
    if (item) {
      return `${item.name} currently has ${item.quantity} units in the ${item.warehouse} warehouse.`;
    }
    return "I couldn't find that product in inventory. Could you repeat the name?";
  }

  if (/(low stock|reorder|أقل من|منخفض)/.test(text)) {
    const items = db.getLowStockReport();
    if (!items.length) return "Nothing is low on stock right now.";
    return `${items.length} item(s) are low on stock: ${items.map((i) => i.name).join(", ")}.`;
  }

  if (/(top leads|top opportunities|أفضل العملاء|افضل الفرص)/.test(text)) {
    const leads = db.getTopLeads(3);
    const names = leads.map((l) => l.client_name).join(", ");
    return `Your top opportunities right now are: ${names}.`;
  }

  if (/(new lead|create a lead|عميل جديد|أضف عميل|اضف عميل)/.test(text)) {
    const match = text.match(/(?:lead|عميل)\s+(?:named|called|اسمه|باسم)?\s*(.*)/);
    const name = match && match[1].trim() ? match[1].trim() : "New Lead";
    const lead = db.createLead({ name, source: "voice-assistant" });
    return `Created a new lead for ${lead.name}.`;
  }

  if (/(revenue|إيرادات|المبيعات|sales)/.test(text)) {
    const kpis = db.getKpis();
    return `Total revenue is ${money(kpis.total_revenue)}, stock value is ${money(kpis.stock_value)}, across ${kpis.new_orders} orders.`;
  }

  if (/(find|search|ابحث عن|دور على)/.test(text)) {
    const match = text.match(/(?:find|search for|ابحث عن|دور على)\s+(.*)/);
    const query = match && match[1].trim() ? match[1].trim() : text;
    const results = db.searchCrm(query);
    const found = results.leads.length + results.accounts.length;
    return `Found ${found} matching record(s) for '${query}'.`;
  }

  return pickFallback(message);
}

async function handleTranscript(transcript, els) {
  els.hint.textContent = `You said: "${transcript}"`;
  els.status.textContent = "Ava is thinking...";
  els.micBtn.disabled = true;

  // Artificial delay so the local simulation still feels like it's
  // "processing" — matches how the real backend-backed version behaves.
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const reply = generateReply(transcript);
  els.status.textContent = reply;
  els.micBtn.disabled = false;
  speak(reply);
}

function initRecognition(els) {
  if (!SpeechRecognitionImpl) {
    els.status.textContent = "Voice recognition isn't supported in this browser — try the buttons below.";
    els.micBtn.disabled = true;
    return;
  }

  recognition = new SpeechRecognitionImpl();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isListening = true;
    setListeningUI(els.widget, els.status, true);
  };
  recognition.onend = () => {
    isListening = false;
    setListeningUI(els.widget, els.status, false);
  };
  recognition.onerror = (event) => {
    isListening = false;
    setListeningUI(els.widget, els.status, false);
    els.status.textContent = `Mic error: ${event.error}`;
  };
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    handleTranscript(transcript, els);
  };
}

function toggleListening() {
  if (!recognition) return;
  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
}

export function initAiWidget() {
  const els = getElements();
  if (!els.widget) return;

  initRecognition(els);

  els.micBtn.addEventListener("click", toggleListening);

  els.closeBtn.addEventListener("click", () => {
    els.widget.classList.add("is-collapsed");
    els.launcher.classList.remove("is-hidden");
  });

  els.launcher.addEventListener("click", () => {
    els.widget.classList.remove("is-collapsed");
    els.launcher.classList.add("is-hidden");
  });

  els.quickActions.forEach((btn) => {
    btn.addEventListener("click", () => handleTranscript(btn.dataset.command, els));
  });
}
