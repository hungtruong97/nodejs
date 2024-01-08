/**
 *
 * @param {string} text
 * @param {number} i
 */

export function maskInfo(text) {
  if (text.includes("@")) {
    const atIndex = text.indexOf("@");
    const dotIndex = text.indexOf(".");
    const firstCharacter = text.slice(0, 1);
    const LastCharacterBeforeAt = text.slice(atIndex - 1, atIndex);
    const maskedPart = "*".repeat(text.slice(1, atIndex - 1).length);
    const domainName = "*".repeat(text.slice(atIndex, dotIndex - 1).length);
    const domainExtension = text.slice(dotIndex);
    const maskedEmail =
      firstCharacter +
      maskedPart +
      LastCharacterBeforeAt +
      "@" +
      domainName +
      domainExtension;

    return maskedEmail;
  } else if (text.includes(" ")) {
    const breakIndex = text.indexOf(" ");
    const firstName = text.slice(0, breakIndex);
    const firstLetterOfLastName = text.slice(breakIndex + 1, breakIndex + 2);
    const maskedLastName = "*".repeat(text.slice(breakIndex + 1).length);
    const maskedName = firstName + " " + firstLetterOfLastName + maskedLastName;
    return maskedName;
  }
}
