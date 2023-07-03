class UpdateActivity {
  limitRemaining = 0;
  resetAt = Date.now();

  getLimitRemaining() {
    return this.limitRemaining;
  }

  getResetAt() {
    return this.resetAt;
  }

  setLimitRemaining(limit) {
    this.limitRemaining = limit;
    return this.limitRemaining;
  }

  setResetAt(resetAt) {
    this.resetAt = resetAt;
    return this.resetAt;
  }
}

module.exports = UpdateActivity;
