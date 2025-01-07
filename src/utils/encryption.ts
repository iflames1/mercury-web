// lib/encryption.ts
import {
	createCipheriv,
	createDecipheriv,
	randomBytes,
	scryptSync,
} from "crypto";

// Generate a proper length key from password/secret
function getKey(password: string): Buffer {
	return scryptSync(password, "salt", 32); // 32 bytes = 256 bits
}

export async function encrypt(text: string, password: string) {
	try {
		const key = getKey(password);
		const iv = randomBytes(16);
		const cipher = createCipheriv("aes-256-cbc", key, iv);

		let encrypted = cipher.update(text, "utf8", "hex");
		encrypted += cipher.final("hex");

		return `${iv.toString("hex")}:${encrypted}`;
	} catch (error) {
		console.error("Encryption error:", error);
		throw error;
	}
}

export async function decrypt(text: string, password: string) {
	try {
		const key = getKey(password);
		const [ivHex, encryptedHex] = text.split(":");

		const iv = Buffer.from(ivHex, "hex");
		const decipher = createDecipheriv("aes-256-cbc", key, iv);

		let decrypted = decipher.update(encryptedHex, "hex", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	} catch (error) {
		console.error("Decryption error:", error);
		throw error;
	}
}
