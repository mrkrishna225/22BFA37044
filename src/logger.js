// log.js - Logging middleware function
export const log = async (level, packageType, message) => {
  try {
    await fetch('http://20.244.56.144/evaluation-service/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stack: 'frontend',
        level: level,
        package: packageType,
        message: message
      })
    });
  } catch (error) {
    console.error('Log error:', error);
  }
};