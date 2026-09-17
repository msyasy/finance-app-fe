import API from "./api";

// Helper konversi Base64URL <-> ArrayBuffer untuk WebAuthn API
function bufferToBase64URL(buffer) {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64URLToBuffer(base64URL) {
  if (!base64URL) return new Uint8Array(0);
  if (base64URL instanceof Uint8Array || base64URL instanceof ArrayBuffer) {
    return base64URL;
  }
  let base64 = String(base64URL).replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Cek apakah browser & perangkat mendukung WebAuthn / Passkeys
export function isWebAuthnSupported() {
  return (
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === "function"
  );
}

// 1. Registrasi Biometrik (Passkey Baru)
export async function registerBiometrics() {
  if (!isWebAuthnSupported()) {
    throw new Error(
      "Perangkat atau browser kamu belum mendukung autentikasi biometrik."
    );
  }

  try {
    // Step 1: Minta opsi registrasi (challenge) dari backend
    const beginRes = await API.post("/webauthn/register/begin");
    const rawData = beginRes.data;

    console.log("[WebAuthn Register Begin Response]:", rawData);

    const publicKeyOpts = rawData.publicKey || (rawData.options && rawData.options.publicKey) || rawData;

    if (!publicKeyOpts || !publicKeyOpts.challenge) {
      throw new Error("Format opsi registrasi biometrik dari server tidak valid.");
    }

    // Format challenge & user id ke ArrayBuffer
    publicKeyOpts.challenge = base64URLToBuffer(publicKeyOpts.challenge);
    if (publicKeyOpts.user && publicKeyOpts.user.id) {
      publicKeyOpts.user.id = base64URLToBuffer(publicKeyOpts.user.id);
    }

    if (publicKeyOpts.excludeCredentials && Array.isArray(publicKeyOpts.excludeCredentials)) {
      for (let cred of publicKeyOpts.excludeCredentials) {
        cred.id = base64URLToBuffer(cred.id);
      }
    }

    console.log("[WebAuthn Creating Credentials with options]:", publicKeyOpts);

    // Step 2: Panggil dialog Biometrik bawaan perangkat (Face ID / Fingerprint / Windows Hello)
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOpts,
    });

    console.log("[WebAuthn Credential Created]:", credential);

    // Step 3: Format respons dari perangkat kembali ke format Base64URL untuk dikirim ke backend
    const credentialJSON = {
      id: credential.id,
      rawId: bufferToBase64URL(credential.rawId),
      type: credential.type,
      response: {
        attestationObject: bufferToBase64URL(
          credential.response.attestationObject
        ),
        clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
      },
    };

    // Step 4: Kirim ke backend untuk verifikasi & penyimpanan Public Key
    const finishRes = await API.post("/webauthn/register/finish", credentialJSON);
    return finishRes.data;
  } catch (err) {
    console.error("[WebAuthn Register Error]:", err);
    throw err;
  }
}

// 2. Login dengan Biometrik (Passkey)
export async function loginWithBiometrics(email) {
  if (!isWebAuthnSupported()) {
    throw new Error(
      "Perangkat atau browser kamu belum mendukung autentikasi biometrik."
    );
  }

  if (!email) {
    throw new Error("Masukkan email kamu terlebih dahulu.");
  }

  try {
    // Step 1: Minta challenge login dari backend
    const beginRes = await API.post("/webauthn/login/begin", { email });
    const rawData = beginRes.data;

    console.log("[WebAuthn Login Begin Response]:", rawData);

    const user_id = rawData.user_id;
    const publicKeyOpts = (rawData.options && rawData.options.publicKey) || rawData.publicKey || rawData;

    if (!publicKeyOpts || !publicKeyOpts.challenge) {
      throw new Error("Format opsi login biometrik dari server tidak valid.");
    }

    // Format challenge & allowCredentials ke ArrayBuffer
    publicKeyOpts.challenge = base64URLToBuffer(publicKeyOpts.challenge);
    if (publicKeyOpts.allowCredentials && Array.isArray(publicKeyOpts.allowCredentials)) {
      for (let cred of publicKeyOpts.allowCredentials) {
        cred.id = base64URLToBuffer(cred.id);
      }
    }

    console.log("[WebAuthn Getting Credential Assertion]:", publicKeyOpts);

    // Step 2: Panggil dialog Biometrik perangkat
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyOpts,
    });

    console.log("[WebAuthn Assertion Received]:", assertion);

    // Step 3: Format respons assertion ke Base64URL
    const assertionJSON = {
      id: assertion.id,
      rawId: bufferToBase64URL(assertion.rawId),
      type: assertion.type,
      response: {
        authenticatorData: bufferToBase64URL(
          assertion.response.authenticatorData
        ),
        clientDataJSON: bufferToBase64URL(assertion.response.clientDataJSON),
        signature: bufferToBase64URL(assertion.response.signature),
        userHandle: assertion.response.userHandle
          ? bufferToBase64URL(assertion.response.userHandle)
          : null,
      },
    };

    // Step 4: Verifikasi di backend & dapatkan Token JWT
    const finishRes = await API.post(
      `/webauthn/login/finish?user_id=${user_id}`,
      assertionJSON
    );
    return finishRes.data;
  } catch (err) {
    console.error("[WebAuthn Login Error]:", err);
    throw err;
  }
}
