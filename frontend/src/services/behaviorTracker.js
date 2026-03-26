import axios from 'axios';

class BehaviorTracker {
  constructor() {
    this.signalQueue = [];
    this.isFlushing = false;
    this.flushInterval = setInterval(() => this.flush(), 10000); // Flush every 10s
    this.pageEntryTime = Date.now();
  }

  getAuthToken() {
    return localStorage.getItem('token');
  }

  logSignal(signalType, signalValue, pageContext) {
    this.signalQueue.push({
      signal_type: signalType,
      signal_value: signalValue,
      page_context: pageContext || window.location.pathname
    });

    if (this.signalQueue.length >= 5) {
      this.flush();
    }
  }

  trackPageView(pageName) {
    const timeSpent = Math.floor((Date.now() - this.pageEntryTime) / 1000);
    if (timeSpent > 0 && this.lastPage) {
      this.logSignal('TIME_ON_PAGE', { page: this.lastPage, time_spent_seconds: timeSpent });
    }
    
    this.pageEntryTime = Date.now();
    this.lastPage = pageName;
    this.logSignal('PAGE_VIEW', { page: pageName, referrer: document.referrer, timestamp: new Date().toISOString() });
  }

  trackArticleRead(articleId, category, completionPct) {
    this.logSignal('ARTICLE_READ', { article_id: articleId, category, completion_pct: completionPct });
  }

  trackProductClick(productId, componentName) {
    this.logSignal('PRODUCT_CLICK', { product: productId, section: componentName });
  }

  trackSearchQuery(query, resultsCount = 0) {
    this.logSignal('SEARCH_QUERY', { query, results_count: resultsCount });
  }

  async flush() {
    if (this.signalQueue.length === 0 || this.isFlushing) return;
    
    const token = this.getAuthToken();
    if (!token) return; // Silent discard if not logged in

    this.isFlushing = true;
    const batch = [...this.signalQueue];
    this.signalQueue = []; // Clear current queue

    try {
      // Send the batch sequentially to the single signal endpoint to ensure they don't block
      for (const signal of batch) {
        await axios.post('http://localhost:8000/api/v1/profile/signal', signal, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.warn('Silent telemetry discard:', e.message);
      // Optional: push back to queue on fail
    } finally {
      this.isFlushing = false;
    }
  }
}

export const tracker = new BehaviorTracker();
