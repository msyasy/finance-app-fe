import API from "./api";

// Helper konversi Base64URL <-> ArrayBuffer untuk WebAuthn API
function bufferToBase64URL(buffer) {
  const bytes = new Uint8Array(buffer);
  let string = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    string += String.fromCharCode(bytes[i]);
  }
  return btoa(string)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64URLToBuffer(base64URL) {
  let base64 = base64URL.replace(/-/g, "+").replace(/_/g, "/");
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
    throw new Error("Perangkat atau browser kamu belum mendukung autentikasi biometrik.");
  }

  // Step 1: Minta opsi registrasi (challenge) dari backend
  const beginRes = await API.post("/webauthn/register/begin");
  const options = beginRes.data;

  // Format options challenge & user id ke ArrayBuffer
  options.publicKey.challenge = base64URLToBuffer(options.publicKey.challenge);
  options.publicKey.user.id = base64URLToBuffer(options.publicKey.user.id);

  if (options.publicKey.excludeCredentials) {
    for (let cred of options.publicKey.excludeCredentials) {
      cred.id = base64URLToBuffer(cred.id);
    }
  }

  // Step 2: Panggil dialog Biometrik bawaan perangkat (Face ID / Fingerprint / Windows Hello)
  const credential = await navigator.credentials.create({
    publicKey: options.publicKey,
  });

  // Step 3: Format respons dari perangkat kembali ke format Base64URL untuk dikirim ke backend
  const credentialJSON = {
    id: credential.id,
    rawId: bufferToBase64URL(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: bufferToBase64URL(credential.response.attestationObject),
      clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
    },
  };

  // Step 4: Kirim ke backend untuk verifikasi & penyimpanan Public Key
  const finishRes = await API.post("/webauthn/register/finish", credentialJSON);
  return finishRes.data;
}

// 2. Login dengan Biometrik (Passkey)
export async function loginWithBiometrics(email) {
  if (!isWebAuthnSupported()) {
    throw new Error("Perangkat atau browser kamu belum mendukung autentikasi biometrik.");
  }

  if (!email) {
    throw new Error("Masukkan email kamu terlebih dahulu.");
  }

  // Step 1: Minta challenge login dari backend
  const beginRes = await API.post("/webauthn/login/begin", { email });
  const { options, user_id } = beginRes.data;

  // Format challenge & allowCredentials ke ArrayBuffer
  options.publicKey.challenge = base64URLToBuffer(options.publicKey.challenge);
  if (options.publicKey.allowCredentials) {
    for (let cred of options.publicKey.allowCredentials) {
      cred.id = base64URLToBuffer(cred.id);
    }
  }

  // Step 2: Panggil dialog Biometrik perangkat
  const assertion = await navigator.credentials.get({
    publicKey: options.publicKey,
  });

  // Step 3: Format respons assertion ke Base64URL
  const assertionJSON = {
    id: assertion.id,
    rawId: bufferToBase64URL(assertion.rawId),
    type: assertion.type,
    response: {
      authenticatorData: bufferToBase64URL(assertion.response.authenticatorData),
      clientDataJSON: bufferToBase64URL(assertion.response.clientDataJSON),
      signature: bufferToBase64URL(assertion.response.signature),
      userHandle: assertion.response.userHandle
        ? bufferToBase64URL(assertion.response.userHandle)
        : null,
    },
  };

  // Step 4: Verifikasi di backend & dapatkan Token JWT
  const finishRes = await API.post(`/webauthn/login/finish?user_id=${user_id}`, assertionJSON);
  return finishRes.data;
}
