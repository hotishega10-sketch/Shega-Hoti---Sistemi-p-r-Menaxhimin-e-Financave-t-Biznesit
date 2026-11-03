// Gabim i kontrolluar: bart kodin HTTP dhe mesazhin që i shfaqet klientit.
class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
module.exports = AppError;
