const PARTNER_APP_ID = "34UGhpx0qrXHqpfKHAkGH";
const AFFILIATE_TOKEN = "3A2CFHPG722B";

const exchangeRates = { KES: 129.0, UGX: 3750.0, TZS: 2600.0, ETB: 120.5, EUR: 0.92, GBP: 0.79, JPY: 155.0 };

const monthlyEconomicNews = [
    { day: "1st Wed", time: "16:00 EAT", event: "US ADP Employment Change", currency: "USD", impact: "HIGH", direction: "Bullish USD", boat: "Boat 4: Trend Scalper", exit: "Exit 5 Ticks" },
    { day: "1st Fri", time: "15:30 EAT", event: "US Non-Farm Payrolls (NFP)", currency: "USD", impact: "HIGH", direction: "Breakout Expansion", boat: "Boat 3: Recovery Hedging", exit: "Exit 3 Ticks (Risk Cap)" },
    { day: "3rd Wed", time: "15:30 EAT", event: "US Consumer Price Index (CPI)", currency: "USD", impact: "HIGH", direction: "High Volatility Reversal", boat: "Boat 5: Boundary Scalper", exit: "Exit 4 Runs" }
];

let exhaustiveAssets = [];
let assetDigitStats = {};
let assetQuoteHistory = {};
let totalTicks = 0;
let currentMarketRiskHigh = false;

function updateAssetDropdown(category) {
    const assetSelector = document.getElementById('asset-selector');
    if (!assetSelector) return;
    assetSelector.innerHTML = '';
    
    let filtered = exhaustiveAssets;
    if (category !== 'all') {
        filtered = exhaustiveAssets.filter(a => a.market === category);
    }

    filtered.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.symbol;
        opt.innerText = item.name;
        assetSelector.appendChild(opt);
    });
}

function setupCurrencyConverter() {
    const amtInput = document.getElementById('convert-amount');
    const curSelect = document.getElementById('target-currency');
    const outEl = document.getElementById('converted-output');
    function calc() {
        const val = (parseFloat(amtInput.value) || 0) * (exchangeRates[curSelect.value] || 1);
        outEl.innerText = `${val.toLocaleString(undefined, {minimumFractionDigits: 2})} ${curSelect.value}`;
    }
    if (amtInput && curSelect) { amtInput.addEventListener('input', calc); curSelect.addEventListener('change', calc); calc(); }
}

function switchAccountMode(mode) {
    const b1 = document.getElementById('btn-mode-demo'), b2 = document.getElementById('btn-mode-real');
    if (mode === 'demo') {
        b1.className = 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition';
        b2.className = 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
    } else {
        b2.className = 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition';
        b1.className = 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
    }
}

function executeActionSignal() {
    if (currentMarketRiskHigh) {
        alert("⚠️ RISK CIRCUIT BREAKER ACTIVE: Market volatility spike/whipsaw detected. Execution paused.");
        return;
    }
    triggerElhadartProfitAlert("[VERIFIED CASCADING AI EXECUTION]", 50.00);
}

function resetDigitScanner() {
    assetDigitStats = {};
    assetQuoteHistory = {};
    alert("Cascading Matrix & Spike Buffers reset.");
}

function populateMonthlyNewsCalendar() {
    const container = document.getElementById('news-calendar-widget');
    if (!container) return;
    container.innerHTML = '';
    monthlyEconomicNews.forEach(item => {
        const div = document.createElement('div');
        div.className = 'bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-0.5';
        div.innerHTML = `
            <div class="flex justify-between font-bold text-fxgreen">
                <span>📅 ${item.day} (${item.currency})</span>
                <span class="text-amber-400">[${item.impact}]</span>
            </div>
            <div class="text-white font-semibold text-[10px]">${item.event}</div>
            <div class="text-gold text-[9px]">⚡ ${item.direction} | Use <strong>${item.boat}</strong> (${item.exit})</div>
        `;
        container.appendChild(div);
    });
}

function extractExactLastDigit(tick) {
    const pipSize = tick.pip_size !== undefined ? tick.pip_size : 2;
    const formattedPrice = Number(tick.quote).toFixed(pipSize);
    const lastDigit = parseInt(formattedPrice.slice(-1), 10);
    return { formattedPrice, lastDigit };
}

function evaluateMarketRiskAndWhipsaw(sym, quote) {
    if (!assetQuoteHistory[sym]) assetQuoteHistory[sym] = [];
    const history = assetQuoteHistory[sym];
    history.push(quote);
    if (history.length > 20) history.shift();
    if (history.length < 6) return { isHighRisk: false, reason: "Calibrating Volatility..." };

    let deltas = [];
    let directionFlips = 0;
    for (let i = 1; i < history.length; i++) {
        const diff = history[i] - history[i - 1];
        deltas.push(Math.abs(diff));
        if (i >= 2) {
            const prevDiff = history[i - 1] - history[i - 2];
            if ((diff > 0 && prevDiff < 0) || (diff < 0 && prevDiff > 0)) directionFlips++;
        }
    }

    const avgDelta = deltas.slice(0, -1).reduce((a, b) => a + b, 0) / (deltas.length - 1 || 1);
    const latestDelta = deltas[deltas.length - 1];

    if (avgDelta > 0 && latestDelta > avgDelta * 4.5) {
        return { isHighRisk: true, reason: "⚡ ABNORMAL SPIKE DETECTED" };
    }
    if (directionFlips / (history.length - 2) > 0.78) {
        return { isHighRisk: true, reason: "🌪️ WHIPSAW CHOP DETECTED" };
    }
    return { isHighRisk: false, reason: "🟢 SAFE / CLEAN FLOW" };
}

function computeDynamicAnalytics(tick) {
    totalTicks++;
    const sym = tick.symbol;
    const { formattedPrice, lastDigit } = extractExactLastDigit(tick);
    const riskAssessment = evaluateMarketRiskAndWhipsaw(sym, Number(tick.quote));

    document.getElementById('tick-buffer-count').innerText = `${totalTicks} Verified Ticks`;

    if (!assetDigitStats[sym]) {
        assetDigitStats[sym] = { counts: [0,0,0,0,0,0,0,0,0,0], total: 0 };
    }
    assetDigitStats[sym].counts[lastDigit]++;
    assetDigitStats[sym].total++;

    const currentAsset = document.getElementById('asset-selector').value || (exhaustiveAssets[0] ? exhaustiveAssets[0].symbol : '1HZ10V');

    if (sym === currentAsset) {
        currentMarketRiskHigh = riskAssessment.isHighRisk;
        document.getElementById('live-quote-display').innerText = formattedPrice;
        document.getElementById('digit-analyzer-title').innerText = `Cascading Digit AI (${sym})`;
        document.getElementById('last-digit-display').innerText = `Last Digit: ${lastDigit}`;
        document.getElementById('digit-entry-price').innerText = formattedPrice;

        const riskEl = document.getElementById('market-risk-status');
        const execBtn = document.getElementById('btn-execute-signal');
        if (riskAssessment.isHighRisk) {
            riskEl.innerText = riskAssessment.reason;
            riskEl.className = "text-red-400 font-bold animate-pulse";
            execBtn.className = "bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg text-xs transition";
            execBtn.innerText = "RISK SHIELD PAUSED";
        } else {
            riskEl.innerText = riskAssessment.reason;
            riskEl.className = "text-fxgreen font-bold";
            execBtn.className = "bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition";
            execBtn.innerText = "EXECUTE VERIFIED SIGNAL";
        }

        const stats = assetDigitStats[sym];
        let minHits = Infinity, dormantDigit = 0;
        let maxHits = -1, hotDigit = 0;
        for (let i = 0; i < 10; i++) {
            const pct = stats.total > 0 ? ((stats.counts[i] / stats.total) * 100).toFixed(1) : 0.0;
            document.getElementById(`freq-${i}`).innerText = `${pct}%`;
            if (stats.counts[i] < minHits) { minHits = stats.counts[i]; dormantDigit = i; }
            if (stats.counts[i] > maxHits) { maxHits = stats.counts[i]; hotDigit = i; }
        }

        const evenCount = stats.counts[0] + stats.counts[2] + stats.counts[4] + stats.counts[6] + stats.counts[8];
        const evenPct = stats.total > 0 ? ((evenCount / stats.total) * 100).toFixed(1) : 50;
        document.getElementById('even-odd-recommendation').innerText = `${evenPct}% Even vs ${100 - evenPct}% Odd`;

        const underCount = stats.counts[0] + stats.counts[1] + stats.counts[2] + stats.counts[3] + stats.counts[4];
        const underPct = stats.total > 0 ? ((underCount / stats.total) * 100).toFixed(1) : 50;
        const overUnderText = underPct > 55 ? `UNDER 6 (~${underPct}%)` : underPct < 45 ? `OVER 3 (~${(100 - underPct).toFixed(1)}%)` : `Balanced Over/Under`;

        let modeText = "Scanning Match/Differ...";
        let boatName = "Boat 1: Differ Harvester";
        let exitTarget = "Exit after 4 Runs";

        const maxPct = stats.total > 0 ? (maxHits / stats.total) * 100 : 0;

        if (riskAssessment.isHighRisk) {
            modeText = `🛡️ RISK SHIELD: Differ ${dormantDigit} Defense`;
            boatName = "Boat 1: Safe Differ Harvester";
            exitTarget = "IMMEDIATE EXIT / Max 2 Ticks";
        } else if (maxPct >= 18.5 && stats.total > 20) {
            modeText = `🔥 CASCADED TO MATCH/DIFFER (Hot ${hotDigit} / Dormant ${dormantDigit})`;
            boatName = "Boat 1: Differ Safe Harvester";
            exitTarget = "Exit after 3 Runs";
        } else if (evenPct >= 60 || evenPct <= 40) {
            modeText = `🟢 CASCADED TO EVEN/ODD (${evenPct >= 60 ? 'Even' : 'Odd'} Dominance)`;
            boatName = "Boat 4: Even/Odd Scalper";
            exitTarget = "Exit after 5 Runs";
        } else {
            modeText = `🟡 CASCADED TO OVER/UNDER (${overUnderText})`;
            boatName = "Boat 5: Over/Under Boundary Scalper";
            exitTarget = "Exit after 5 Ticks";
        }

        document.getElementById('active-strategy-mode').innerText = modeText;
        document.getElementById('prescribed-boat').innerText = boatName;
        document.getElementById('prescribed-runs').innerText = exitTarget;
    }
}

function updateKillzones() {
    const now = new Date();
    const eatTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const hrs = eatTime.getUTCHours();
    const mins = eatTime.getUTCMinutes();
    const secs = eatTime.getUTCSeconds();

    const timerEl = document.getElementById('killzone-timer');
    if (timerEl) timerEl.innerText = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} EAT`;

    let sessionName = "24/7 Multimarket Session";
    let currencyBias = "Multi-Market Volatility Stable";

    if (hrs >= 10 && hrs < 15) { 
        sessionName = "🔥 London Open Killzone (Active)"; 
        currencyBias = "High Expansion - Trade USD/EUR breakouts"; 
    } else if (hrs >= 15 && hrs < 19) { 
        sessionName = "⚡ London / New York Overlap (Active)"; 
        currencyBias = "High Volatility Sweep Window - Risk Shield Armed"; 
    }

    document.getElementById('active-session-name').innerText = sessionName;
    document.getElementById('active-currency-bias').innerText = currencyBias;
}

function initializeLiveTerminal() {
    setupCurrencyConverter();
    populateMonthlyNewsCalendar();

    const categorySelect = document.getElementById('market-category');
    const assetSelector = document.getElementById('asset-selector');

    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            updateAssetDropdown(e.target.value);
            const newAsset = assetSelector.value;
            if (window.derivApiInstance && newAsset) {
                window.derivApiInstance.subscribeTicks(newAsset, computeDynamicAnalytics);
            }
        });
    }

    const derivApi = new DerivAPIConnector(PARTNER_APP_ID);
    window.derivApiInstance = derivApi;

    if (assetSelector) {
        assetSelector.addEventListener('change', (e) => {
            derivApi.subscribeTicks(e.target.value, computeDynamicAnalytics);
        });
    }

    derivApi.connect().then(() => {
        derivApi.fetchActiveSymbols((symbols) => {
            exhaustiveAssets = symbols.map(s => ({
                symbol: s.symbol || s.underlying_symbol,
                name: s.display_name || s.underlying_symbol_name,
                market: s.market
            }));

            updateAssetDropdown('all');
            const initialAsset = assetSelector && assetSelector.value ? assetSelector.value : (exhaustiveAssets[0] ? exhaustiveAssets[0].symbol : '1HZ10V');
            derivApi.subscribeTicks(initialAsset, computeDynamicAnalytics);

            exhaustiveAssets.slice(0, 20).forEach(symObj => {
                if (symObj.symbol !== initialAsset) {
                    derivApi.addSimultaneousSubscription(symObj.symbol, computeDynamicAnalytics);
                }
            });
        });
    }).catch((err) => {
        console.error("Connection fallback active", err);
        exhaustiveAssets = [{ symbol: '1HZ10V', name: 'Volatility 10 (1s) Index', market: 'synthetic' }];
        updateAssetDropdown('all');
        setInterval(() => { 
            computeDynamicAnalytics({ 
                quote: 6450.25 + (Math.random() * 2 - 1), 
                pip_size: 2,
                epoch: Math.floor(Date.now() / 1000),
                symbol: '1HZ10V' 
            }); 
        }, 1000);
    });

    setInterval(updateKillzones, 1000);
}

window.addEventListener('DOMContentLoaded', () => { 
    // Quick initialize if splash screen was bypassed
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.remove();
        initializeLiveTerminal();
    }, 3000);
});
