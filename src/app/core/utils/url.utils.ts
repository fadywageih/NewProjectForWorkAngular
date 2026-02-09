export class UrlUtils {
  /**
   * Safely decodes a URL-encoded token, handling double encoding issues
   */
  static decodeResetToken(token: string): string {
    if (!token) return token;

    let decodedToken = token;
    
    try {
      decodedToken = decodeURIComponent(token);
      if (this.containsEncodedCharacters(decodedToken)) {
        decodedToken = decodeURIComponent(decodedToken);
      }
    } catch (error) {
      console.warn('Failed to decode token, using as-is:', error);
      return token;
    }

    return this.cleanToken(decodedToken);
  }

  static prepareTokenForDisplay(token: string): string {
    if (!token) return '';
    const length = token.length;
    if (length <= 20) return token;
    
    return `${token.substring(0, 10)}...${token.substring(length - 10)}`;
  }

  static buildResetPasswordUrl(baseUrl: string, email: string, token: string): string {
    const encodedEmail = encodeURIComponent(email);
    // Note: Token should NOT be encoded here - backend will handle encoding
    return `${baseUrl}/reset-password?email=${encodedEmail}&token=${token}`;
  }

  static getQueryParam(url: string, paramName: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get(paramName);
    } catch {
      return null;
    }
  }
  private static containsEncodedCharacters(str: string): boolean {
    return /%[0-9A-Fa-f]{2}/.test(str);
  }

  private static cleanToken(token: string): string {
    return token
      .trim()
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .replace(/\s+/g, ' '); // Replace multiple spaces with single space
  }
}