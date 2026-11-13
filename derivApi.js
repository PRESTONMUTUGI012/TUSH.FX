class DerivAPIConnector {
    constructor(appId) {
        this.appId = appId;
        this.ws = null;
        this.isConnected = false;
        this.subscribers = {};
        this.multiSubscribers = {};
        this.lastEpochs = {};
        this.lastQuotes = {};
        this.pingInterval = null;
        this.rejectedTicksCount = 0;
    }

    connect() {
        return new Promise((resolve, reject) => {
            const endpoint = `wss://ws.derivws.com/websockets/v3?app_id=${this.appId}`;
            this.ws = new WebSocket(endpoint);
            
            this.ws.onopen = () => {
                this.isConnected = true;
                this.startHeartbeat();
                resolve(true);
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.msg_type === 'active_symbols' && data.active_symbols) {
                        if (this.onActiveSymbolsCallback) {
                            this.onActiveSymbolsCallback(data.active_symbols);
                        }
                    }
                    if (data.msg_type === 'tick' && data.tick) {
                        const sym = data.tick.symbol;
                        const epoch = data.tick.epoch;
                        const quote = Number(data.tick.quote);

                        if (isNaN(quote) || quote <= 0) {
                            this.rejectedTicksCount++;
                            return;
                        }
                        if (this.lastEpochs[sym] && epoch <= this.lastEpochs[sym]) {
                            this.rejectedTicksCount++;
                            return;
                        }
                        if (this.lastQuotes[sym] !== undefined && this.lastQuotes[sym] === quote && (epoch - this.lastEpochs[sym]) < 2) {
                            return;
                        }

                        this.lastEpochs[sym] = epoch;
                        this.lastQuotes[sym] = quote;

                        if (this.subscribers[sym]) {
                            this.subscribers[sym](data.tick);
                        }
                        if (this.multiSubscribers[sym]) {
                            this.multiSubscribers[sym](data.tick);
                        }
                    }
                } catch (e) {
                    console.error("Packet validation error:", e);
                }
            };

            this.ws.onerror = (err) => {
                console.error("WebSocket error:", err);
                reject(err);
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                clearInterval(this.pingInterval);
                setTimeout(() => this.connect(), 2000);
            };
        });
    }

    startHeartbeat() {
        clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
            if (this.ws && this.isConnected) {
                this.ws.send(JSON.stringify({ ping: 1 }));
            }
        }, 25000);
    }

    fetchActiveSymbols(callback) {
        this.onActiveSymbolsCallback = callback;
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({ active_symbols: "brief", product_type: "basic" }));
        }
    }

    subscribeTicks(symbol, callback) {
        this.subscribers = { [symbol]: callback };
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({ forget_all: 'ticks' }));
            this.ws.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
        }
    }

    addSimultaneousSubscription(symbol, callback) {
        this.multiSubscribers[symbol] = callback;
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
        }
    }
}
